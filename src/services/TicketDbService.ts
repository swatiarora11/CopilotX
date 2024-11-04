import DbService from './DbService';
import { DbTicket } from '../model/dbModel';
import { Ticket } from '../model/baseModel';
import { HttpError } from './Utilities';

const TABLE_NAME = "Ticket";

class TicketDbService {

    // NOTE: Tickets are READ ONLY in this demo app, so we are free to cache them in memory.
    private dbService = new DbService<DbTicket>(true);

    async getTicketById(id: string): Promise<Ticket> {
        const ticket = await this.dbService.getEntityByRowKey(TABLE_NAME, id) as DbTicket;
        return this.convertDbTicket(ticket);
    }

    async getTickets(): Promise<Ticket[]> {
        const tickets = await this.dbService.getEntities(TABLE_NAME) as DbTicket[];
        return tickets.map<Ticket>((p) => this.convertDbTicket(p));
    }

    async createTicket(ticketName: string, description: string, ownerId: string
        , assetId: string, priority: string, status: string, photoUrl: string): Promise<Ticket> {
    
        try {
            // Retrieve all tickets to find the highest ticket ID
            const tickets = await this.dbService.getEntities(TABLE_NAME);
            
            // Determine the highest ticket ID
            let highestTicketId = 0;
            if (tickets && tickets.length > 0) {
                highestTicketId = Math.max(...tickets.map((ticket: DbTicket) => parseInt(ticket.id, 10)));
            }
    
            // Create a new ticket ID by incrementing the highest ticket ID
            const newTicketId = (highestTicketId + 1).toString();
    
            // Construct the new ticket object
            const newTicket: DbTicket = {
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
            await this.dbService.createEntity(TABLE_NAME, newTicket.id, newTicket);
            return newTicket;

        } catch (e) {
            throw new HttpError(500, "Unable to create ticket");
        }
    }    

    async updateTicket(ticketId: string, ticketName: string, description?: string
        , ownerId?: string, assetId?: string, priority?: string, status?: string): Promise<Ticket> {
    
        try {
            // Retrieve the existing ticket by ticketId
            const existingTicket = await this.dbService.getEntityByRowKey(TABLE_NAME, ticketId) as DbTicket;
    
            if (!existingTicket) {
                throw new HttpError(404, "Ticket not found");
            }
    
            // Update the fields only if they are provided
            const updatedTicket: DbTicket = {
                ...existingTicket,  // Retain existing properties
                name: ticketName ?? existingTicket.name,
                description: description ?? existingTicket.description,
                ownerId: ownerId ?? existingTicket.ownerId,
                assetId: assetId ?? existingTicket.assetId,
                status: status ?? existingTicket.status,
                priority: priority ?? existingTicket.priority,
                timestamp: new Date()  // Update timestamp to current time
            };
    
            // Save the updated ticket to the database
            await this.dbService.updateEntity(TABLE_NAME, updatedTicket);
    
            return updatedTicket;
    
        } catch (e) {
            throw new HttpError(500, "Unable to update ticket");
        }
    }    

    private convertDbTicket(dbTicket: DbTicket): Ticket {
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

export default new TicketDbService();
