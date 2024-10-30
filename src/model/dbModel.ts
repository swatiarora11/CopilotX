import { TableEntity } from "@azure/data-tables";
import { Unit, Asset, UnitAssetAllocation}  from "./baseModel";
import { User, Ticket, TicketComment, TicketAssignment, TicketHistory } from "./baseModel";

export interface DbEntity extends TableEntity {
    etag: string;
    partitionKey: string;
    rowKey: string;
    timestamp: Date;
}

export interface DbUnit extends DbEntity, Unit { }

export interface DbAsset extends DbEntity, Asset { }

export interface DbUnitAssetAllocation extends DbEntity, UnitAssetAllocation { }

export interface DbUser extends DbEntity, User { } 

export interface DbTicket extends DbEntity, Ticket { }

export interface DbTicketAssignment extends DbEntity, TicketAssignment { }

export interface DbTicketComment extends DbEntity, TicketComment { } 

export interface DbTicketHistory extends DbEntity, TicketHistory { }