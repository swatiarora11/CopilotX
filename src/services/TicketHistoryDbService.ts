import DbService from './DbService';
import { DbTicketHistory } from '../model/dbModel';
import { TicketHistory } from '../model/baseModel';
import { HttpError } from './Utilities';

const TABLE_NAME = "TicketHistory";

class TicketHistoryDbService {

    // NOTE: TicketHistorys are READ-WRITE so disable local caching
    private dbService = new DbService<DbTicketHistory>(false);

    async getTicketHistory(): Promise<TicketHistory[]> {
        const history = await this.dbService.getEntities(TABLE_NAME) as DbTicketHistory[];
        const result = history.map((e) => this.convertDbTicketHistory(e));
        return result;
    }

    async logTicket(ticketId: string, status: string, userId: string): Promise<string> {
        //const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
        const timestamp = Date.now();
        const commentId = `${ticketId},${timestamp}`;
    
        try {
            const newTicketHistory: DbTicketHistory = {
                etag: "",
                partitionKey: TABLE_NAME,
                rowKey: commentId,
                timestamp: new Date(),
                id: commentId,
                ticketId: ticketId,
                statusChange: status,
                changedBy: userId
            };
            
            await this.dbService.createEntity(TABLE_NAME, newTicketHistory.id, newTicketHistory);
            return ticketId;
        } catch (e) {
            throw new HttpError(500, "Unable to log ticket");
        }
    }

    private convertDbTicketHistory(dbTicketHistory: DbTicketHistory): TicketHistory {
        const result: TicketHistory = {
            id: dbTicketHistory.id,
            ticketId: dbTicketHistory.ticketId,
            statusChange: dbTicketHistory.statusChange,            
            changedBy: dbTicketHistory.changedBy
        };

        return result;
    }
}

export default new TicketHistoryDbService();
