"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TicketDbService_1 = __importDefault(require("./TicketDbService"));
const TicketAssignmentDbService_1 = __importDefault(require("./TicketAssignmentDbService"));
const TicketCommentDbService_1 = __importDefault(require("./TicketCommentDbService"));
const UserDbService_1 = __importDefault(require("./UserDbService"));
const AssetApiService_1 = __importDefault(require("./AssetApiService"));
const UserApiService_1 = __importDefault(require("./UserApiService"));
const Utilities_1 = require("./Utilities");
class TicketApiService {
    getApiTicketById(ticketId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield TicketDbService_1.default.getTicketById(ticketId);
            let assignments = yield TicketAssignmentDbService_1.default.getTicketAssignments();
            const result = yield this.getApiTicket(ticket, assignments);
            return result;
        });
    }
    getApiTickets(ticketOrAssetName, userName, ownerName) {
        return __awaiter(this, void 0, void 0, function* () {
            let assets = yield AssetApiService_1.default.getApiAssets(ticketOrAssetName);
            let tickets = yield TicketDbService_1.default.getTickets();
            let assignments = yield TicketAssignmentDbService_1.default.getTicketAssignments();
            const assetId = assets.length === 1 ? assets[0].id : undefined;
            // Filter on base properties
            if (ownerName) {
                let users = yield UserApiService_1.default.getApiUsers(ownerName, "", "", "", "", "");
                const ownerId = users.length === 1 ? users[0].id : undefined;
                tickets = tickets.filter((p) => {
                    return p.ownerId.includes(ownerId);
                });
            }
            // Filter on base properties
            if (ticketOrAssetName) {
                tickets = tickets.filter((p) => {
                    var _a;
                    const name = (_a = p.name) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    return name.includes(ticketOrAssetName.toLowerCase()) || p.assetId.includes(assetId);
                });
            }
            //remove duplicates
            tickets = tickets.filter((ticket, index, self) => index === self.findIndex((p) => (p.id === ticket.id)));
            // Augment the base properties with assignment information
            let result = yield Promise.all(tickets.map((p) => this.getApiTicket(p, assignments)));
            // Filter on augmented properties
            if (result && userName) {
                result = result.filter((p) => {
                    const name = userName.toLowerCase();
                    return p.users.find((n) => n.userName.toLowerCase().includes(name));
                });
            }
            ;
            return result;
        });
    }
    // Augment a ticket to get an ApiTicket
    getApiTicket(ticket, assignments) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = ticket;
            assignments = assignments.filter((a) => a.ticketId === ticket.id);
            result.users = [];
            result.forecastThisMonth = 0;
            result.forecastNextMonth = 0;
            result.actualLastMonth = 0;
            result.actualThisMonth = 0;
            for (let assignment of assignments) {
                const user = yield UserDbService_1.default.getUserById(assignment.userId);
                const { lastMonthHours: forecastLastMonth, thisMonthHours: forecastThisMonth, nextMonthHours: forecastNextMonth } = this.findHours(assignment.forecast);
                const { lastMonthHours: actualLastMonth, thisMonthHours: actualThisMonth, nextMonthHours: actualNextMonth } = this.findHours(assignment.actual);
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
        });
    }
    // Extract this and next month's hours from an array of HoursEntry
    findHours(hours) {
        var _a, _b, _c;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        const nextMonth = thisMonth === 11 ? 0 : thisMonth + 1;
        const nextYear = thisMonth === 11 ? thisYear + 1 : thisYear;
        const result = {
            lastMonthHours: ((_a = hours.find((h) => h.month === lastMonth + 1 && h.year === lastYear)) === null || _a === void 0 ? void 0 : _a.hours) || 0,
            thisMonthHours: ((_b = hours.find((h) => h.month === thisMonth + 1 && h.year === thisYear)) === null || _b === void 0 ? void 0 : _b.hours) || 0,
            nextMonthHours: ((_c = hours.find((h) => h.month === nextMonth + 1 && h.year === nextYear)) === null || _c === void 0 ? void 0 : _c.hours) || 0
        };
        return result;
    }
    createTicket(ticketName, description, ownerName, assetName, priority, status, photoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let tickets = yield this.getApiTickets(ticketName, "", "");
            let users = yield UserApiService_1.default.getApiUsers(ownerName, "", "", "", "", "");
            let assets = yield AssetApiService_1.default.getApiAssets(assetName);
            if (tickets.length > 0) {
                throw new Utilities_1.HttpError(406, `Ticket already exists with the name: ${ticketName}`);
            }
            else if (users.length === 0) {
                throw new Utilities_1.HttpError(404, `User not found: ${ownerName}`);
            }
            else if (users.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple users found with the name: ${ownerName}`);
            }
            else if (assets.length === 0) {
                throw new Utilities_1.HttpError(404, `Asset not found: ${assetName}`);
            }
            else if (assets.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple assets found with the name: ${assetName}`);
            }
            const user = users[0];
            const asset = assets[0];
            const ticket = yield TicketDbService_1.default.createTicket(ticketName, description, user.id, asset.id, priority, status, photoUrl);
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
            };
        });
    }
    updateTicket(ticketName, description, ownerName, assetName, priority, status) {
        return __awaiter(this, void 0, void 0, function* () {
            let tickets = yield this.getApiTickets(ticketName, "", "");
            let users = yield UserApiService_1.default.getApiUsers(ownerName, "", "", "", "", "");
            let assets = yield AssetApiService_1.default.getApiAssets(assetName);
            if (tickets.length === 0) {
                throw new Utilities_1.HttpError(404, `Ticket not found: ${ticketName}`);
            }
            else if (tickets.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple tickets found with the name: ${ticketName}`);
            }
            else if (ownerName && users.length === 0) {
                throw new Utilities_1.HttpError(404, `User not found: ${ownerName}`);
            }
            else if (ownerName && users.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple users found with the name: ${ownerName}`);
            }
            else if (assetName && assets.length === 0) {
                throw new Utilities_1.HttpError(404, `Asset not found: ${assetName}`);
            }
            else if (assetName && assets.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple assets found with the name: ${assetName}`);
            }
            const user = users[0];
            const asset = assets[0];
            const ownerId = ownerName ? user.id : undefined;
            const assetId = assetName ? asset.id : undefined;
            const ticket = yield TicketDbService_1.default.updateTicket(tickets[0].id, ticketName, description, ownerId, assetId, priority, status);
            const taggedAsset = yield AssetApiService_1.default.getApiAssetById(ticket.assetId);
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
            };
        });
    }
    addUserToTicket(ticketName, userName, isOwner, role, hours) {
        return __awaiter(this, void 0, void 0, function* () {
            let tickets = yield this.getApiTickets(ticketName, "", "");
            let users = yield UserApiService_1.default.getApiUsers(userName, "", "", "", "", "");
            if (tickets.length === 0) {
                throw new Utilities_1.HttpError(404, `Ticket not found: ${ticketName}`);
            }
            else if (tickets.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple tickets found with the name: ${ticketName}`);
            }
            else if (users.length === 0) {
                throw new Utilities_1.HttpError(404, `User not found: ${userName}`);
            }
            else if (users.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple users found with the name: ${userName}`);
            }
            const ticket = tickets[0];
            const user = users[0];
            const taggedAsset = yield AssetApiService_1.default.getApiAssetById(ticket.assetId);
            // Always charge to the current month
            const remainingForecast = yield TicketAssignmentDbService_1.default.addUserToTicket(ticket.id, user.id, isOwner, role, hours);
            const message = `Added user ${user.name} to ${taggedAsset.name} on ticket "${ticket.name}" with ${remainingForecast} hours forecast this month.`;
            return {
                assetId: ticket.assetId,
                assetName: taggedAsset.name,
                ticketName: ticket.name,
                userName: users[0].name,
                remainingForecast,
                message
            };
        });
    }
    commentOnTicket(ticketName, userName, commentText) {
        return __awaiter(this, void 0, void 0, function* () {
            let tickets = yield this.getApiTickets(ticketName, "", "");
            let users = yield UserApiService_1.default.getApiUsers(userName, "", "", "", "", "");
            if (tickets.length === 0) {
                throw new Utilities_1.HttpError(404, `Ticket not found: ${ticketName}`);
            }
            else if (tickets.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple tickets found with the name: ${ticketName}`);
            }
            else if (users.length === 0) {
                throw new Utilities_1.HttpError(404, `User not found: ${userName}`);
            }
            else if (users.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple users found with the name: ${userName}`);
            }
            const ticket = tickets[0];
            const user = users[0];
            const taggedAsset = yield AssetApiService_1.default.getApiAssetById(ticket.assetId);
            // add comment to ticket
            const success = yield TicketCommentDbService_1.default.addCommentToTicket(ticket.id, user.id, commentText);
            const message = `Added comment by ${user.name} to ${taggedAsset.name} on ticket "${ticket.name}"`;
            return {
                assetId: ticket.assetId,
                assetName: taggedAsset.name,
                ticketName: ticket.name,
                userName: users[0].name,
                message
            };
        });
    }
}
exports.default = new TicketApiService();
//# sourceMappingURL=TicketApiService.js.map