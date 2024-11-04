export interface Location {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
}

export interface HoursEntry {
    month: number;
    year: number;
    hours: number;
}

export interface Unit {
    id: string;                 //unique ID of the unit
    name: string;               //name of the unit
    location: Location;         //location of the unit
    unitContact: string;        //unit contact name 
    unitContactEmail: string;   //unit contact email
}

export interface Asset {
    id: string;             //unique ID of the asset
    name: string;           //name of the asset
    description: string;    //description of the asset
    acquisitionDate: Date;  //date on which asset was purchased or acquired
    status: string;         //current status of the asset; active, under maintenance, retired
    photoUrl: string;       //photo url of the asset
}

export interface UnitAssetAllocation {
    id: string;                 //allocation ID is "unitId,assetId"
    unitId: string;             //ID of the unit
    assetId: string;            //ID of the asset allocated to the unit
}

export interface User {
    id: string;                 //unique ID of the user
    name: string;               //user name
    email: string;              //email of the user
    phone: string;              //phone no. of the user
    photoUrl: string;           //user photo url
    location: Location;         //location where user is based
    relationType: string;       //whether user is employee, consultant or partner
    skills: string[];           //skillset of the user
    certifications: string[];   //certifications acquired by the user
    roles: string[];            //roles of the user
}

export interface Ticket {
    id: string;             //unique ID of the ticket 
    name: string;           //name of ticket
    description: string;    //ticket description
    status: string;         //current status of the ticket; open, in progress, closed
    priority: string;       //whether resolution is required on priority; low, medium, high
    photoUrl: string;       //photo url of the ticket
    ownerId: string;        //ticket owner user ID
    assetId: string;        //ID of the related asset
}

export interface TicketAssignment {
    id: string;                 //assignment ID is "ticketid,userid"
    ticketId: string;           //ID of the ticket
    userId: string;             //ID of the user assigned to the ticket
    isOwner: boolean;           //is this user owner of the ticket
    role: string;               //role of the user
    billable: boolean;          //user is billable or not
    rate: number;               //rate of the user if user is billable
    forecast: HoursEntry [];    //forecasted hours of the assigned user on ticket
    actual: HoursEntry[];       //actual hours spent by the assigned user on ticket
}

export interface TicketComment {
    id: string;             //comment ID is "ticketId, userId, number"
    ticketId: string;       //ID of related ticket
    userId: string;         //ID of the user who made the comment 
    commentText: string;    //comment text
}

export interface TicketHistory {
    id: string;             //assignment ID is "ticketid, number"
    ticketId: string;       //ID of the related ticket 
    statusChange: string;   //new status
    changedBy: string;      //ID of the user who made the change.
}
