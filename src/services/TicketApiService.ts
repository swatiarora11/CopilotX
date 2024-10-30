import { Ticket, HoursEntry, TicketAssignment } from '../model/baseModel';
import { ApiTicket, ApiAddUserToTicketResponse, ApiAddCommentToTicketResponse } from '../model/apiModel';
import { ApiCreateTicketResponse, ApiUpdateTicketResponse } from '../model/apiModel';
import TicketDbService from './TicketDbService';
import TicketAssignmentDbService from './TicketAssignmentDbService';
import TicketCommentDbService from './TicketCommentDbService';
import UserDbService from './UserDbService';
import AssetApiService from './AssetApiService';
import UserApiService from './UserApiService';
import { HttpError } from './Utilities';
import AssetDbService from './AssetDbService';

class TicketApiService {

    async getApiTicketById(ticketId: string): Promise<ApiTicket> {
        const ticket = await TicketDbService.getTicketById(ticketId);
        let assignments = await TicketAssignmentDbService.getTicketAssignments();

        const result = await this.getApiTicket(ticket, assignments);
        return result;
    }

    async getApiTickets(ticketOrAssetName: string, userName: string, ownerName: string): Promise<ApiTicket[]> {
        let assets = await AssetApiService.getApiAssets(ticketOrAssetName);
        let tickets = await TicketDbService.getTickets();
        let assignments = await TicketAssignmentDbService.getTicketAssignments();

        const assetId = assets.length === 1 ? assets[0].id : undefined;

        // Filter on base properties
        if (ownerName) {
            let users = await UserApiService.getApiUsers(ownerName, "", "", "", "", "");
            const ownerId = users.length === 1 ? users[0].id : undefined;

            tickets = tickets.filter(
                (p) => {
                    return p.ownerId.includes(ownerId);
                });
        }

        // Filter on base properties
        if (ticketOrAssetName) {
            tickets = tickets.filter(
                (p) => {
                    const name = p.name?.toLowerCase();
                    return name.includes(ticketOrAssetName.toLowerCase()) || p.assetId.includes(assetId);
                });
        }
        //remove duplicates
        tickets = tickets.filter(
            (ticket, index, self) => 
                index === self.findIndex((p) => (
                    p.id === ticket.id
                ))
        );

        // Augment the base properties with assignment information
        let result = await Promise.all(tickets.map((p) => this.getApiTicket(p, assignments)));

        // Filter on augmented properties
        if (result && userName) {
            result = result.filter(
                (p) => {
                    const name = userName.toLowerCase();
                    return p.users.find((n) => n.userName.toLowerCase().includes(name));
                });
        };

        return result;
    }

    // Augment a ticket to get an ApiTicket
    async getApiTicket(ticket: Ticket, assignments: TicketAssignment[]): Promise<ApiTicket> {

        const result = ticket as ApiTicket;
        assignments = assignments.filter((a) => a.ticketId === ticket.id);

        result.users = [];
        result.forecastThisMonth = 0;
        result.forecastNextMonth = 0;
        result.actualLastMonth = 0;
        result.actualThisMonth = 0;

        for (let assignment of assignments) {
            const user = await UserDbService.getUserById(assignment.userId);
            const { lastMonthHours: forecastLastMonth,
                thisMonthHours: forecastThisMonth,
                nextMonthHours: forecastNextMonth } = this.findHours(assignment.forecast);
            const { lastMonthHours: actualLastMonth,
                thisMonthHours: actualThisMonth,
                nextMonthHours: actualNextMonth } = this.findHours(assignment.actual);

            result.users.push({
                userName: user.name,
                userLocation: user.location,
                role: assignment.role,
                forecastThisMonth: forecastThisMonth,
                forecastNextMonth: forecastNextMonth,
                actualLastMonth: actualLastMonth,
                actualThisMonth: actualThisMonth
            });

            result.forecastThisMonth += forecastThisMonth;
            result.forecastNextMonth += forecastNextMonth;
            result.actualLastMonth += actualLastMonth;
            result.actualThisMonth += actualThisMonth;

        }
        return result;
    }

    // Extract this and next month's hours from an array of HoursEntry
    private findHours(hours: HoursEntry[]): { lastMonthHours: number, thisMonthHours: number, nextMonthHours: number } {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const nextMonth = thisMonth === 11 ? 0 : thisMonth + 1;
        const nextYear = thisMonth === 11 ? thisYear + 1 : thisYear;

        const result = {
            lastMonthHours: hours.find((h) => h.month === lastMonth + 1 && h.year === lastYear)?.hours || 0,
            thisMonthHours: hours.find((h) => h.month === thisMonth + 1 && h.year === thisYear)?.hours || 0,
            nextMonthHours: hours.find((h) => h.month === nextMonth + 1 && h.year === nextYear)?.hours || 0
        };
        return result;
    }

    async createTicket(ticketName: string, description: string, ownerName: string
        , assetName: string, priority: string, status: string): Promise<ApiCreateTicketResponse> {
            
        let tickets = await this.getApiTickets(ticketName, "", "");
        let users = await UserApiService.getApiUsers(ownerName, "", "", "", "", "");
        let assets = await AssetApiService.getApiAssets(assetName);

        if (tickets.length > 0) {
            throw new HttpError(406, `Ticket already exists with the name: ${ticketName}`);
        } else if (users.length === 0) {
            throw new HttpError(404, `User not found: ${ownerName}`);
        } else if (users.length > 1) {
            throw new HttpError(406, `Multiple users found with the name: ${ownerName}`);
        } else if (assets.length === 0) {
            throw new HttpError(404, `Asset not found: ${assetName}`);
        } else if (assets.length > 1) {
            throw new HttpError(406, `Multiple assets found with the name: ${assetName}`);
        }
        const user = users[0];
        const asset = assets[0];
        const ticket = await TicketDbService.createTicket(ticketName, description, user.id, asset.id, priority, status);

        // Always charge to the current month
        // const remainingForecast = await TicketAssignmentDbService.addUserToTicket(ticket.id, user.id, true, "watcher", 0);
        const message = `Created ticket ${ticket.name} for ${asset.name} with owner ${user.name}`;

        return {
            assetId: ticket.assetId,
            assetName: asset.name,
            ticketName: ticket.name,
            ownerName: users[0].name,
            ticketStatus: ticket.status,
            priority: ticket.priority,
            message
        }
    }

    async updateTicket(ticketName: string, description: string, ownerName: string
        , assetName: string, priority: string, status: string): Promise<ApiUpdateTicketResponse> {
            
        let tickets = await this.getApiTickets(ticketName, "", "");
        let users = await UserApiService.getApiUsers(ownerName, "", "", "", "", "");
        let assets = await AssetApiService.getApiAssets(assetName);

        if (tickets.length === 0) {
            throw new HttpError(404, `Ticket not found: ${ticketName}`);
        } else if (tickets.length > 1) {
            throw new HttpError(406, `Multiple tickets found with the name: ${ticketName}`);
        } else if (ownerName && users.length === 0) {
            throw new HttpError(404, `User not found: ${ownerName}`);
        } else if (ownerName && users.length > 1) {
            throw new HttpError(406, `Multiple users found with the name: ${ownerName}`);
        } else if (assetName && assets.length === 0) {
            throw new HttpError(404, `Asset not found: ${assetName}`);
        } else if (assetName && assets.length > 1) {
            throw new HttpError(406, `Multiple assets found with the name: ${assetName}`);
        }
        const user = users[0];
        const asset = assets[0];

        const ownerId = ownerName ? user.id : undefined;
        const assetId = assetName ? asset.id : undefined;

        const ticket = await TicketDbService.updateTicket(tickets[0].id, ticketName, description, ownerId, assetId, priority, status);
        const taggedAsset = await AssetApiService.getApiAssetById(ticket.assetId);
        // Always charge to the current month
        // const remainingForecast = await TicketAssignmentDbService.addUserToTicket(ticket.id, user.id, isOwner, role, hours);
        const message = `Updated ticket id ${ticket.id} with ${ticket.name}`;

        return {
            assetId: ticket.assetId,
            assetName: taggedAsset.name,
            ticketName: ticket.name,
            ownerName: ownerName && users[0].name,
            ticketDescription: ticket.description,
            ticketStatus: ticket.status,
            priority: ticket.priority,
            message
        }
    }

    async addUserToTicket(ticketName: string, userName: string, isOwner: boolean, role: string, hours: number): Promise<ApiAddUserToTicketResponse> {
        let tickets = await this.getApiTickets(ticketName, "", "");
        let users = await UserApiService.getApiUsers(userName, "", "", "", "", "");

        if (tickets.length === 0) {
            throw new HttpError(404, `Ticket not found: ${ticketName}`);
        } else if (tickets.length > 1) {
            throw new HttpError(406, `Multiple tickets found with the name: ${ticketName}`);
        } else if (users.length === 0) {
            throw new HttpError(404, `User not found: ${userName}`);
        } else if (users.length > 1) {
            throw new HttpError(406, `Multiple users found with the name: ${userName}`);
        }
        const ticket = tickets[0];
        const user = users[0];

        const taggedAsset = await AssetApiService.getApiAssetById(ticket.assetId);

        // Always charge to the current month
        const remainingForecast = await TicketAssignmentDbService.addUserToTicket(ticket.id, user.id, isOwner, role, hours);
        const message = `Added user ${user.name} to ${taggedAsset.name} on ticket "${ticket.name}" with ${remainingForecast} hours forecast this month.`;

        return {
            assetId: ticket.assetId,
            assetName: taggedAsset.name,
            ticketName: ticket.name,
            userName: users[0].name,
            remainingForecast,
            message
        }
    }

    async commentOnTicket(ticketName: string, userName: string, commentText: string): Promise<ApiAddCommentToTicketResponse> {
        let tickets = await this.getApiTickets(ticketName, "", "");
        let users = await UserApiService.getApiUsers(userName, "", "", "", "", "");

        if (tickets.length === 0) {
            throw new HttpError(404, `Ticket not found: ${ticketName}`);
        } else if (tickets.length > 1) {
            throw new HttpError(406, `Multiple tickets found with the name: ${ticketName}`);
        } else if (users.length === 0) {
            throw new HttpError(404, `User not found: ${userName}`);
        } else if (users.length > 1) {
            throw new HttpError(406, `Multiple users found with the name: ${userName}`);
        }
        const ticket = tickets[0];
        const user = users[0];

        const taggedAsset = await AssetApiService.getApiAssetById(ticket.assetId);

        // add comment to ticket
        const success = await TicketCommentDbService.addCommentToTicket(ticket.id, user.id, commentText);
        const message = `Added comment by ${user.name} to ${taggedAsset.name} on ticket "${ticket.name}"`;

        return {
            assetId: ticket.assetId,
            assetName: taggedAsset.name,
            ticketName: ticket.name,
            userName: users[0].name,
            message
        }
    }
}

export default new TicketApiService();
