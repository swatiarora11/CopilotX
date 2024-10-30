import { User, HoursEntry, TicketAssignment } from '../model/baseModel';
import { ApiUser, ApiWorkOnTicketResponse } from '../model/apiModel';
import TicketDbService from './TicketDbService';
import TicketAssignmentDbService from './TicketAssignmentDbService';
import UserDbService from './UserDbService';
import { HttpError } from './Utilities';
import TicketApiService from './TicketApiService';
import AssetApiService from './AssetApiService';

const AVAILABLE_HOURS_PER_MONTH = 160;

class UserApiService {

    async getApiUserById(userId: string): Promise<ApiUser> {

        let result = null;
        let user = await UserDbService.getUserById(userId);
        if (user) {
            let assignments = await TicketAssignmentDbService.getTicketAssignments();
            result = await this.getApiUserForBaseUser(user, assignments);
        }
        return result;
    }

    async getApiUsers(
        userName: string, ticketName: string, skill: string,
        certification: string, role: string, hoursAvailable: string): Promise<ApiUser[]> {

        let users = await UserDbService.getUsers();
        let assignments = await TicketAssignmentDbService.getTicketAssignments();

        // Filter on base properties
        if (userName) {
            users = users.filter(
                (c) => c.name.toLowerCase().includes(userName.toLocaleLowerCase()));
        }
        if (skill) {
            users = users.filter(
                (c) => c.skills.find((s) => s.toLowerCase().includes(skill.toLocaleLowerCase())));
        }
        if (certification) {
            users = users.filter(
                (c) => c.certifications.find((s) => s.toLowerCase().includes(certification.toLocaleLowerCase())));
        }
        if (role) {
            users = users.filter(
                (c) => c.roles.find((s) => s.toLowerCase().includes(role)));
        }

        // Augment the base properties with assignment information
        let result = await Promise.all(users.map((c) => this.getApiUserForBaseUser(c, assignments)));

        // Filter on ticket name
        if (result && ticketName) {
            result = result.filter(
                (c) => {
                    let ticket = c.tickets.find((p) => {
                        let x = p.ticketName.toLowerCase() + p.assetName.toLowerCase();
                        return x.includes(ticketName);
                    });
                    return ticket;
                });
        };
        // Filter on available hours
        if (result && hoursAvailable) {
            result = result.filter(
                (c) => {
                    let availableHours = AVAILABLE_HOURS_PER_MONTH * 2 - c.forecastThisMonth - c.forecastNextMonth;
                    return availableHours >= parseInt(hoursAvailable);
                });
        };

        return result;
    }

    public async createApiUser(user: User): Promise<ApiUser> {
        await UserDbService.createUser(user);
        const assignments = await TicketAssignmentDbService.getTicketAssignments();

        const newApiUser = 
            this.getApiUserForBaseUser(user, assignments);
        return newApiUser;
    }

    // Augment a base user to get an ApiUser
    async getApiUserForBaseUser(user: User, assignments: TicketAssignment[]): Promise<ApiUser> {

        const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            photoUrl: user.photoUrl,
            location: user.location,
            relationType: user.relationType,
            skills: user.skills,
            certifications: user.certifications,
            roles: user.roles,
            tickets: [],
            forecastThisMonth: 0,
            forecastNextMonth: 0,
            actualLastMonth: 0,
            actualThisMonth: 0
        }
        assignments = assignments.filter((a) => a.userId === user.id);

        result.forecastThisMonth = 0;
        result.forecastNextMonth = 0;
        result.actualLastMonth = 0;
        result.actualThisMonth = 0;

        for (let assignment of assignments) {
            const ticket = await TicketDbService.getTicketById(assignment.ticketId);
            const taggedAsset = await AssetApiService.getApiAssetById(ticket.assetId);

            const { lastMonthHours: forecastLastMonth,
                thisMonthHours: forecastThisMonth,
                nextMonthHours: forecastNextMonth } = this.findHours(assignment.forecast);
            const { lastMonthHours: actualLastMonth,
                thisMonthHours: actualThisMonth,
                nextMonthHours: actualNextMonth } = this.findHours(assignment.actual);

            result.tickets.push({
                ticketName: ticket.name,
                ticketDescription: ticket.description,
                ticketStatus: ticket.status,
                ticketPriority: ticket.priority,
                ticketOwnerId: ticket.ownerId,
                assetName: taggedAsset.name,                
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

    async workOnTicket(ticketName: string, userId: string, hours: number): Promise<ApiWorkOnTicketResponse> {
        let tickets = await TicketApiService.getApiTickets(ticketName, "", "");
        if (tickets.length === 0) {
            throw new HttpError(404, `Ticket not found: ${ticketName}`);
        } else if (tickets.length > 1) {
            throw new HttpError(406, `Multiple tickets found with the name: ${ticketName}`);
        } else {
            const ticket = tickets[0];
            // Always charge to the current month
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            const remainingForecast = await TicketAssignmentDbService.workOnTicket(ticket.id, userId, month, year, hours);
            let message = "";
            if (remainingForecast < 0) {
                message = `Worked ${hours} hours to ${ticket.assetName} on ticket "${ticket.name}". You are ${-remainingForecast} hours over your forecast this month.`;
            } else {
                message = `Worked ${hours} hours to ${ticket.assetName} on ticket "${ticket.name}". You have ${remainingForecast} hours remaining this month.`;
            }
            return {
                assetName: ticket.assetName,
                ticketName: ticket.name,
                remainingForecast,
                message
            };
        }
    }
}

export default new UserApiService();
