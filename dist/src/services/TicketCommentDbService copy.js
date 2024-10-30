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
const TABLE_NAME = "TicketComment";
class TicketCommentDbService {
    constructor() {
        // NOTE: TicketComments are READ-WRITE so disable local caching
        this.dbService = new DbService_1.default(false);
    }
    getTicketComments() {
        return __awaiter(this, void 0, void 0, function* () {
            const comments = yield this.dbService.getEntities(TABLE_NAME);
            const result = comments.map((e) => this.convertDbTicketComment(e));
            return result;
        });
    }
    addCommentToTicket(ticketId, userId, commentText) {
        return __awaiter(this, void 0, void 0, function* () {
            //const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
            const timestamp = Date.now();
            const commentId = `${ticketId},${userId},${timestamp}`;
            try {
                const newTicketComment = {
                    etag: "",
                    partitionKey: TABLE_NAME,
                    rowKey: commentId,
                    timestamp: new Date(),
                    id: commentId,
                    ticketId: ticketId,
                    userId: userId,
                    commentText: commentText
                };
                yield this.dbService.createEntity(TABLE_NAME, newTicketComment.id, newTicketComment);
                return commentText;
            }
            catch (e) {
                throw new Utilities_1.HttpError(500, "Unable to add assignment");
            }
        });
    }
    convertDbTicketComment(dbTicketComment) {
        const result = {
            id: dbTicketComment.id,
            ticketId: dbTicketComment.ticketId,
            userId: dbTicketComment.userId,
            commentText: dbTicketComment.commentText
        };
        return result;
    }
}
exports.default = new TicketCommentDbService();
//# sourceMappingURL=TicketCommentDbService%20copy.js.map