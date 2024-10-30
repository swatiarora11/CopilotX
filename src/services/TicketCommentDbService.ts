import DbService from './DbService';
import { DbTicketComment } from '../model/dbModel';
import { TicketComment } from '../model/baseModel';
import { HttpError } from './Utilities';

const TABLE_NAME = "TicketComment";

class TicketCommentDbService {

    // NOTE: TicketComments are READ-WRITE so disable local caching
    private dbService = new DbService<DbTicketComment>(false);

    async getTicketComments(): Promise<TicketComment[]> {
        const comments = await this.dbService.getEntities(TABLE_NAME) as DbTicketComment[];
        const result = comments.map((e) => this.convertDbTicketComment(e));
        return result;
    }

    async addCommentToTicket(ticketId: string, userId: string, commentText: string): Promise<boolean> {
        //const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
        const timestamp = Date.now();
        const commentId = `${ticketId},${userId},${timestamp}`;
    
        try {
            const newTicketComment: DbTicketComment = {
                etag: "",
                partitionKey: TABLE_NAME,
                rowKey: commentId,
                timestamp: new Date(),
                id: commentId,
                ticketId: ticketId,
                userId: userId,
                commentText: commentText
            };
            await this.dbService.createEntity(TABLE_NAME, newTicketComment.id, newTicketComment);
            return true;
        } catch (e) {
            throw new HttpError(500, "Unable to add comment");
        }
    }

    private convertDbTicketComment(dbTicketComment: DbTicketComment): TicketComment {
        const result: TicketComment = {
            id: dbTicketComment.id,
            ticketId: dbTicketComment.ticketId,
            userId: dbTicketComment.userId,
            commentText: dbTicketComment.commentText
        };

        return result;
    }
}

export default new TicketCommentDbService();
