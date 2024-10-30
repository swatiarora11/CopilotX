import { Location, Unit, Asset, User, Ticket } from "./baseModel";

export interface ErrorResult {
    status: number;
    message: string;
}

//#region GET requests for /units --------------------
export interface ApiAsset extends Asset {
    tickets: ApiTicket[];
}

// Returned by all /api/units GET requests
export interface ApiUnit extends Unit {
    assets: ApiAsset[];
}
//#endregion

//#region POST request to /api/units/addAsset---
export interface ApiAddAssetToUnitRequest {
    unitName: string;
    assetName: string;
}
export interface ApiAddAssetToUnitResponse {
    unitName: string;
    assetName: string;
    message: string;
}
//#endregion

//#region GET requests for /tickets --------------------
export interface ApiTicketUser {
    userName: string;
    userLocation: Location;
    role: string;
    forecastThisMonth: number;
    forecastNextMonth: number;
    actualLastMonth: number;
    actualThisMonth: number;
}

// Returned by all /api/tickets GET requests
export interface ApiTicket extends Ticket {
    assetName: string;
    users: ApiTicketUser[];
    forecastThisMonth: number;
    forecastNextMonth: number;
    actualLastMonth: number;
    actualThisMonth: number;
}
//#endregion

//#region GET requests for /me and /users ---

// Information about a ticket that a user is assigned to
export interface ApiUserTicket {
    ticketName: string;
    ticketDescription: string;
    assetLocation: Location;
    assetName: string;
    role: string;
    forecastThisMonth: number;
    forecastNextMonth: number;
    actualLastMonth: number;
    actualThisMonth: number;
}

// Returned by all /api/users GET requests
export interface ApiUser extends User {
    tickets: ApiUserTicket[];
    forecastThisMonth: number;
    forecastNextMonth: number;
    actualLastMonth: number;
    actualThisMonth: number;
}
//#endregion

//#region POST request to /api/tickets/create---
export interface ApiCreateTicketRequest {
    assetName: string;
    ticketName: string;
    description: string;
    status: string;
    priority: number;
    photoUrl: string;
}

export interface ApiCreateTicketResponse {
    assetId: string;
    assetName: string;
    ticketName: string;
    ownerName: string;
    ticketStatus: string;
    priority: string;  
    message: string;
}
//#endregion

//#region POST request to /api/tickets/update---
export interface ApiUpdateTicketRequest {
    assetName: string;
    ticketName: string;
    description: string;
    status: string;
    priority: number;
    photoUrl: string;
}

export interface ApiUpdateTicketResponse {
    assetId: string;
    assetName: string;
    ticketName: string;
    ownerName: string;
    ticketDescription: string;
    ticketStatus: string;
    priority: string;  
    message: string;
}
//#endregion

//#region POST request to /api/me/workOnTicket ---
export interface ApiWorkOnTicketRequest {
    ticketName: string;
    hours: number;
}
export interface ApiWorkOnTicketResponse {
    assetName: string;
    ticketName: string;
    remainingForecast: number;
    message: string;
}
//#endregion

//#region POST request to /api/tickets/assignUser---
export interface ApiAddUserToTicketRequest {
    ticketName: string;
    userName: string;
    role: string;
    hours: number;
}
export interface ApiAddUserToTicketResponse {
    assetId: string;
    assetName: string;
    ticketName: string;
    userName: string;
    remainingForecast: number;
    message: string;
}
//#endregion

//#region POST request to /api/tickets/comment---
export interface ApiAddCommentToTicketRequest {
    ticketName: string;
    userName: string;
    commentText: string;
}
export interface ApiAddCommentToTicketResponse {
    assetId: string;
    assetName: string;
    ticketName: string;
    userName: string;
    message: string;
}
//#endregion