import DbService from './DbService';
import { DbTicketAssignment } from '../model/dbModel';
import { TicketAssignment } from '../model/baseModel';
import { HttpError } from './Utilities';

const TABLE_NAME = "TicketAssignment";

class TicketAssignmentDbService {

    // NOTE: TicketAssignments are READ-WRITE so disable local caching
    private dbService = new DbService<DbTicketAssignment>(false);

    async getTicketAssignments(): Promise<TicketAssignment[]> {
        const assignments = await this.dbService.getEntities(TABLE_NAME) as DbTicketAssignment[];
        const result = assignments.map((e) => this.convertDbTicketAssignment(e));
        return result;
    }

    async workOnTicket(ticketId: string, userId: string, month: number, year: number, hours: number): Promise<number> {
        try {
            const dbTicketAssignment = await this.dbService.getEntityByRowKey(TABLE_NAME, ticketId + "," + userId) as DbTicketAssignment;
            if (!dbTicketAssignment) {
                throw new HttpError(404, "TicketAssignment not found");
            }
            // Add the hours delivered
            if (!dbTicketAssignment.actual) {
                dbTicketAssignment.actual = [{ month: month, year: year, hours: hours }];
            } else {
                let a = dbTicketAssignment.actual.find(d => d.month === month && d.year === year);
                if (a) {
                    a.hours += hours;
                } else {
                    dbTicketAssignment.actual.push({ month, year, hours });
                }
            }
            dbTicketAssignment.actual.sort((a, b) => a.year - b.year || a.month - b.month);

            // Subtract the hours from the forecast
            let remainingForecast = -hours;
            if (!dbTicketAssignment.forecast) {
                dbTicketAssignment.forecast = [{ month: month, year: year, hours: -hours }];
            } else {
                let a = dbTicketAssignment.forecast.find(d => d.month === month && d.year === year);
                if (a) {
                    a.hours -= hours;
                    remainingForecast = a.hours;
                } else {
                    dbTicketAssignment.forecast.push({ month: month, year: year, hours: -hours });
                }
            }
            dbTicketAssignment.forecast.sort((a, b) => a.year - b.year || a.month - b.month);

            await this.dbService.updateEntity(TABLE_NAME, dbTicketAssignment)

            return remainingForecast;
        } catch (e) {
            throw new HttpError(404, "TicketAssignment not found");
        }
    }

    async addUserToTicket(ticketId: string, userId: string, isOwner: boolean, role: string, hours: number): Promise<number> {

        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        let dbTicketAssignment = null;
        try {
            dbTicketAssignment = await this.dbService.getEntityByRowKey(TABLE_NAME, ticketId + "," + userId) as DbTicketAssignment;
        } catch { }

        if (dbTicketAssignment) {
            throw new HttpError(403, "TicketAssignment already exists");
        }

        try {
            const newTicketAssignment: DbTicketAssignment = {
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

            await this.dbService.createEntity(TABLE_NAME, newTicketAssignment.id, newTicketAssignment)

            return hours;
        } catch (e) {
            throw new HttpError(500, "Unable to add user assignment");
        }
    }

    private convertDbTicketAssignment(dbTicketAssignment: DbTicketAssignment): TicketAssignment {
        const result: TicketAssignment = {
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

export default new TicketAssignmentDbService();
