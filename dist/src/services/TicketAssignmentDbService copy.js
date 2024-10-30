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
const DbService_1 = __importDefault(require("./DbService"));
const Utilities_1 = require("./Utilities");
const TABLE_NAME = "TicketAssignment";
class TicketAssignmentDbService {
    constructor() {
        // NOTE: TicketAssignments are READ-WRITE so disable local caching
        this.dbService = new DbService_1.default(false);
    }
    getTicketAssignments() {
        return __awaiter(this, void 0, void 0, function* () {
            const assignments = yield this.dbService.getEntities(TABLE_NAME);
            const result = assignments.map((e) => this.convertDbTicketAssignment(e));
            return result;
        });
    }
    workOnTicket(ticketId, userId, month, year, hours) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dbTicketAssignment = yield this.dbService.getEntityByRowKey(TABLE_NAME, ticketId + "," + userId);
                if (!dbTicketAssignment) {
                    throw new Utilities_1.HttpError(404, "TicketAssignment not found");
                }
                // Add the hours delivered
                if (!dbTicketAssignment.delivered) {
                    dbTicketAssignment.delivered = [{ month: month, year: year, hours: hours }];
                }
                else {
                    let a = dbTicketAssignment.actual.find(d => d.month === month && d.year === year);
                    if (a) {
                        a.hours += hours;
                    }
                    else {
                        dbTicketAssignment.actual.push({ month, year, hours });
                    }
                }
                dbTicketAssignment.actual.sort((a, b) => a.year - b.year || a.month - b.month);
                // Subtract the hours from the forecast
                let remainingForecast = -hours;
                if (!dbTicketAssignment.forecast) {
                    dbTicketAssignment.forecast = [{ month: month, year: year, hours: -hours }];
                }
                else {
                    let a = dbTicketAssignment.forecast.find(d => d.month === month && d.year === year);
                    if (a) {
                        a.hours -= hours;
                        remainingForecast = a.hours;
                    }
                    else {
                        dbTicketAssignment.forecast.push({ month: month, year: year, hours: -hours });
                    }
                }
                dbTicketAssignment.forecast.sort((a, b) => a.year - b.year || a.month - b.month);
                yield this.dbService.updateEntity(TABLE_NAME, dbTicketAssignment);
                return remainingForecast;
            }
            catch (e) {
                throw new Utilities_1.HttpError(404, "TicketAssignment not found");
            }
        });
    }
    addUserToTicket(ticketId, userId, isOwner, role, hours) {
        return __awaiter(this, void 0, void 0, function* () {
            const month = new Date().getMonth() + 1;
            const year = new Date().getFullYear();
            let dbTicketAssignment = null;
            try {
                dbTicketAssignment = (yield this.dbService.getEntityByRowKey(TABLE_NAME, ticketId + "," + userId));
            }
            catch (_a) { }
            if (dbTicketAssignment) {
                throw new Utilities_1.HttpError(403, "TicketAssignment already exists");
            }
            try {
                const newTicketAssignment = {
                    etag: "",
                    partitionKey: TABLE_NAME,
                    rowKey: ticketId + "," + userId,
                    timestamp: new Date(),
                    id: ticketId + "," + userId,
                    ticketId: ticketId,
                    userId: userId,
                    isOwner: isOwner,
                    role: role,
                    billable: true,
                    rate: 100,
                    forecast: [{ month: month, year: year, hours: hours }],
                    actual: []
                };
                yield this.dbService.createEntity(TABLE_NAME, newTicketAssignment.id, newTicketAssignment);
                return hours;
            }
            catch (e) {
                throw new Utilities_1.HttpError(500, "Unable to add assignment");
            }
        });
    }
    convertDbTicketAssignment(dbTicketAssignment) {
        const result = {
            id: dbTicketAssignment.id,
            ticketId: dbTicketAssignment.ticketId,
            userId: dbTicketAssignment.userId,
            isOwner: dbTicketAssignment.isOwner,
            role: dbTicketAssignment.role,
            billable: dbTicketAssignment.billable,
            rate: dbTicketAssignment.rate,
            forecast: dbTicketAssignment.forecast,
            actual: dbTicketAssignment.actual
        };
        return result;
    }
}
exports.default = new TicketAssignmentDbService();
//# sourceMappingURL=TicketAssignmentDbService%20copy.js.map