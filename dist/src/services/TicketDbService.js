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
const TABLE_NAME = "Ticket";
class TicketDbService {
    constructor() {
        // NOTE: Tickets are READ ONLY in this demo app, so we are free to cache them in memory.
        this.dbService = new DbService_1.default(true);
    }
    getTicketById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticket = yield this.dbService.getEntityByRowKey(TABLE_NAME, id);
            return this.convertDbTicket(ticket);
        });
    }
    getTickets() {
        return __awaiter(this, void 0, void 0, function* () {
            const tickets = yield this.dbService.getEntities(TABLE_NAME);
            return tickets.map((p) => this.convertDbTicket(p));
        });
    }
    createTicket(ticketName, description, ownerId, assetId, priority, status, photoUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Retrieve all tickets to find the highest ticket ID
                const tickets = yield this.dbService.getEntities(TABLE_NAME);
                // Determine the highest ticket ID
                let highestTicketId = 0;
                if (tickets && tickets.length > 0) {
                    highestTicketId = Math.max(...tickets.map((ticket) => parseInt(ticket.id, 10)));
                }
                // Create a new ticket ID by incrementing the highest ticket ID
                const newTicketId = (highestTicketId + 1).toString();
                // Construct the new ticket object
                const newTicket = {
                    etag: "",
                    partitionKey: TABLE_NAME,
                    rowKey: newTicketId,
                    timestamp: new Date(),
                    id: newTicketId,
                    name: ticketName,
                    description: description,
                    status: status,
                    priority: priority,
                    photoUrl: photoUrl,
                    ownerId: ownerId,
                    assetId: assetId
                };
                // Insert the new ticket into the database
                yield this.dbService.createEntity(TABLE_NAME, newTicket.id, newTicket);
                return newTicket;
            }
            catch (e) {
                throw new Utilities_1.HttpError(500, "Unable to create ticket");
            }
        });
    }
    updateTicket(ticketId, ticketName, description, ownerId, assetId, priority, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Retrieve the existing ticket by ticketId
                const existingTicket = yield this.dbService.getEntityByRowKey(TABLE_NAME, ticketId);
                if (!existingTicket) {
                    throw new Utilities_1.HttpError(404, "Ticket not found");
                }
                // Update the fields only if they are provided
                const updatedTicket = Object.assign(Object.assign({}, existingTicket), { name: ticketName !== null && ticketName !== void 0 ? ticketName : existingTicket.name, description: description !== null && description !== void 0 ? description : existingTicket.description, ownerId: ownerId !== null && ownerId !== void 0 ? ownerId : existingTicket.ownerId, assetId: assetId !== null && assetId !== void 0 ? assetId : existingTicket.assetId, status: status !== null && status !== void 0 ? status : existingTicket.status, priority: priority !== null && priority !== void 0 ? priority : existingTicket.priority, timestamp: new Date() // Update timestamp to current time
                 });
                // Save the updated ticket to the database
                yield this.dbService.updateEntity(TABLE_NAME, updatedTicket);
                return updatedTicket;
            }
            catch (e) {
                throw new Utilities_1.HttpError(500, "Unable to update ticket");
            }
        });
    }
    convertDbTicket(dbTicket) {
        const result = {
            id: dbTicket.id,
            name: dbTicket.name,
            description: dbTicket.description,
            status: dbTicket.status,
            priority: dbTicket.priority,
            photoUrl: dbTicket.photoUrl,
            ownerId: dbTicket.ownerId,
            assetId: dbTicket.assetId
        };
        return result;
    }
}
exports.default = new TicketDbService();
//# sourceMappingURL=TicketDbService.js.map