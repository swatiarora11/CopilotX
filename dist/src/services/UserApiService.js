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
const UserDbService_1 = __importDefault(require("./UserDbService"));
const Utilities_1 = require("./Utilities");
const TicketApiService_1 = __importDefault(require("./TicketApiService"));
const AssetApiService_1 = __importDefault(require("./AssetApiService"));
const AVAILABLE_HOURS_PER_MONTH = 160;
class UserApiService {
    getApiUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            let user = yield UserDbService_1.default.getUserById(userId);
            if (user) {
                let assignments = yield TicketAssignmentDbService_1.default.getTicketAssignments();
                result = yield this.getApiUserForBaseUser(user, assignments);
            }
            return result;
        });
    }
    getApiUsers(userName, ticketName, skill, certification, role, hoursAvailable) {
        return __awaiter(this, void 0, void 0, function* () {
            let users = yield UserDbService_1.default.getUsers();
            let assignments = yield TicketAssignmentDbService_1.default.getTicketAssignments();
            // Filter on base properties
            if (userName) {
                users = users.filter((c) => c.name.toLowerCase().includes(userName.toLocaleLowerCase()));
            }
            if (skill) {
                users = users.filter((c) => c.skills.find((s) => s.toLowerCase().includes(skill.toLocaleLowerCase())));
            }
            if (certification) {
                users = users.filter((c) => c.certifications.find((s) => s.toLowerCase().includes(certification.toLocaleLowerCase())));
            }
            if (role) {
                users = users.filter((c) => c.roles.find((s) => s.toLowerCase().includes(role)));
            }
            // Augment the base properties with assignment information
            let result = yield Promise.all(users.map((c) => this.getApiUserForBaseUser(c, assignments)));
            // Filter on ticket name
            if (result && ticketName) {
                result = result.filter((c) => {
                    let ticket = c.tickets.find((p) => {
                        let x = p.ticketName.toLowerCase() + p.assetName.toLowerCase();
                        return x.includes(ticketName);
                    });
                    return ticket;
                });
            }
            ;
            // Filter on available hours
            if (result && hoursAvailable) {
                result = result.filter((c) => {
                    let availableHours = AVAILABLE_HOURS_PER_MONTH * 2 - c.forecastThisMonth - c.forecastNextMonth;
                    return availableHours >= parseInt(hoursAvailable);
                });
            }
            ;
            return result;
        });
    }
    createApiUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield UserDbService_1.default.createUser(user);
            const assignments = yield TicketAssignmentDbService_1.default.getTicketAssignments();
            const newApiUser = this.getApiUserForBaseUser(user, assignments);
            return newApiUser;
        });
    }
    // Augment a base user to get an ApiUser
    getApiUserForBaseUser(user, assignments) {
        return __awaiter(this, void 0, void 0, function* () {
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
            };
            assignments = assignments.filter((a) => a.userId === user.id);
            result.forecastThisMonth = 0;
            result.forecastNextMonth = 0;
            result.actualLastMonth = 0;
            result.actualThisMonth = 0;
            for (let assignment of assignments) {
                const ticket = yield TicketDbService_1.default.getTicketById(assignment.ticketId);
                const taggedAsset = yield AssetApiService_1.default.getApiAssetById(ticket.assetId);
                const { lastMonthHours: forecastLastMonth, thisMonthHours: forecastThisMonth, nextMonthHours: forecastNextMonth } = this.findHours(assignment.forecast);
                const { lastMonthHours: actualLastMonth, thisMonthHours: actualThisMonth, nextMonthHours: actualNextMonth } = this.findHours(assignment.actual);
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
    workOnTicket(ticketName, userId, hours) {
        return __awaiter(this, void 0, void 0, function* () {
            let tickets = yield TicketApiService_1.default.getApiTickets(ticketName, "", "");
            if (tickets.length === 0) {
                throw new Utilities_1.HttpError(404, `Ticket not found: ${ticketName}`);
            }
            else if (tickets.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple tickets found with the name: ${ticketName}`);
            }
            else {
                const ticket = tickets[0];
                // Always charge to the current month
                const month = new Date().getMonth() + 1;
                const year = new Date().getFullYear();
                const remainingForecast = yield TicketAssignmentDbService_1.default.workOnTicket(ticket.id, userId, month, year, hours);
                let message = "";
                if (remainingForecast < 0) {
                    message = `Worked ${hours} hours to ${ticket.assetName} on ticket "${ticket.name}". You are ${-remainingForecast} hours over your forecast this month.`;
                }
                else {
                    message = `Worked ${hours} hours to ${ticket.assetName} on ticket "${ticket.name}". You have ${remainingForecast} hours remaining this month.`;
                }
                return {
                    assetName: ticket.assetName,
                    ticketName: ticket.name,
                    remainingForecast,
                    message
                };
            }
        });
    }
}
exports.default = new UserApiService();
//# sourceMappingURL=UserApiService.js.map