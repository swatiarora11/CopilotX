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
const TABLE_NAME = "TicketHistory";
class TicketHistoryDbService {
    constructor() {
        // NOTE: TicketHistorys are READ-WRITE so disable local caching
        this.dbService = new DbService_1.default(false);
    }
    getTicketHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            const history = yield this.dbService.getEntities(TABLE_NAME);
            const result = history.map((e) => this.convertDbTicketHistory(e));
            return result;
        });
    }
    logTicket(ticketId, status, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            //const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
            const timestamp = Date.now();
            const commentId = `${ticketId},${timestamp}`;
            try {
                const newTicketHistory = {
                    etag: "",
                    partitionKey: TABLE_NAME,
                    rowKey: commentId,
                    timestamp: new Date(),
                    id: commentId,
                    ticketId: ticketId,
                    statusChange: status,
                    changedBy: userId
                };
                yield this.dbService.createEntity(TABLE_NAME, newTicketHistory.id, newTicketHistory);
                return ticketId;
            }
            catch (e) {
                throw new Utilities_1.HttpError(500, "Unable to log ticket");
            }
        });
    }
    convertDbTicketHistory(dbTicketHistory) {
        const result = {
            id: dbTicketHistory.id,
            ticketId: dbTicketHistory.ticketId,
            statusChange: dbTicketHistory.statusChange,
            changedBy: dbTicketHistory.changedBy
        };
        return result;
    }
}
exports.default = new TicketHistoryDbService();
//# sourceMappingURL=TicketHistoryDbService.js.map