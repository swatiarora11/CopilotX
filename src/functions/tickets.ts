import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import TicketApiService from "../services/TicketApiService";
import { ApiTicket, ApiAddUserToTicketResponse, ApiAddCommentToTicketResponse, ErrorResult } from "../model/apiModel";
import { ApiCreateTicketResponse, ApiUpdateTicketResponse} from "../model/apiModel";
import { HttpError, cleanUpParameter } from "../services/Utilities";
import IdentityService from "../services/IdentityService";

/**
 * This function handles the HTTP request and returns the ticket information.
 *
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response containing the ticket information.
 */

// Define a Response interface.
interface Response extends HttpResponseInit {
    status: number;
    jsonBody: {
        results: ApiTicket[] | ApiAddUserToTicketResponse | ApiAddCommentToTicketResponse
        | ApiCreateTicketResponse | ApiUpdateTicketResponse
        | ErrorResult;
    };
}
export async function tickets(
    req: HttpRequest,
    context: InvocationContext
): Promise<Response> {
    context.log("HTTP trigger function tickets processed a request.");
    // Initialize response.
    const res: Response = {
        status: 200,
        jsonBody: {
            results: [],
        },
    };

    try {

        // Will throw an exception if the request is not valid
        const userInfo = await IdentityService.validateRequest(req);

        const id = req.params?.id?.toLowerCase();
        let body = null;
        switch (req.method) {
            case "GET": {

                let ticketName = req.query.get("ticketName")?.toString().toLowerCase() || "";
                let userName = req.query.get("userName")?.toString().toLowerCase() || "";
                let ownerName = req.query.get("ownerName")?.toString().toLowerCase() || "";

                console.log(`➡️ GET /api/tickets: request for ticketName=${ticketName}, userName=${userName}, ownerName=${ownerName}, id=${id}`);

                ticketName = cleanUpParameter("ticketName", ticketName);
                userName = cleanUpParameter("userName", userName);
                ownerName = cleanUpParameter("ownerName", ownerName);

                if (id) {
                    const result = await TicketApiService.getApiTicketById(id);
                    res.jsonBody.results = [result];
                    console.log(`   ✅ GET /api/tickets: response status ${res.status}; 1 tickets returned`);
                    return res;
                }

                // Use current user if the ticket name is user_profile
                if (ticketName.includes('user_profile')) {
                    const result = await TicketApiService.getApiTickets("", userInfo.name, "");
                    res.jsonBody.results = result;
                    console.log(`   ✅ GET /api/tickets for current user response status ${res.status}; ${result.length} tickets returned`);
                    return res;
                }

                const result = await TicketApiService.getApiTickets(ticketName, userName, ownerName);
                res.jsonBody.results = result;
                console.log(`   ✅ GET /api/tickets: response status ${res.status}; ${result.length} tickets returned`);
                return res;
            }
            case "POST": {
                switch (id.toLocaleLowerCase()) {
                    case "create": {
                        try {
                            const bd = await req.text();
                            body = JSON.parse(bd);
                        } catch (error) {
                            throw new HttpError(400, `No body to process this request.`);
                        }
                        if (body) {
                            const ticketName = cleanUpParameter("ticketName", body["ticketName"]);
                            if (!ticketName) {
                                throw new HttpError(400, `Missing ticket name`);
                            }
                            const description = body["description"];
                            if (!description) {
                                throw new HttpError(400, `Missing ticket description`);
                            }
                            const ownerName = cleanUpParameter("ownerName", body["ownerName"]?.toString() || "");
                            if (!ownerName) {
                                throw new HttpError(400, `Missing ticket owner name`);
                            }                       
                            const assetName = cleanUpParameter("assetName", body["assetName"]);
                            if (!assetName) {
                                throw new HttpError(400, `assetName is required`);
                            }
                            let priority = cleanUpParameter("priority", body["priority"]?.toString() || "low");
                            let status = "new";
                            let photoUrl = "";

                            console.log(`➡️ POST /api/tickets: create request, ticketName=${ticketName}, ownerName=${ownerName}, assetName=${assetName}, priority=${priority}`);
                            const result = await TicketApiService.createTicket
                                (ticketName, description, ownerName, assetName, priority, status, photoUrl);

                            res.jsonBody.results = {
                                status: 200,
                                assetName: result.assetName,
                                ticketName: result.ticketName,
                                ownerName: result.ownerName,
                                ticketStatus: result.ticketStatus,
                                priority: result.priority,
                                message: result.message                          
                            };

                            console.log(`   ✅ POST /api/tickets: response status ${res.status} - ${result.message}`);
                        } else {
                            throw new HttpError(400, `Missing request body`);
                        }
                        return res;
                    }
                    case "update": {
                        try {
                            const bd = await req.text();
                            body = JSON.parse(bd);
                        } catch (error) {
                            throw new HttpError(400, `No body to process this request.`);
                        }
                        if (body) {
                            const ticketName = cleanUpParameter("ticketName", body["ticketName"]);
                            if (!ticketName) {
                                throw new HttpError(400, `Missing ticket name`);
                            }
                            let description = body["description"]
                            let ownerName = body["ownerName"] && cleanUpParameter("ownerName", body["ownerName"]);
                            let assetName = body["assetName"] && cleanUpParameter("assetName", body["assetName"]);
                            let priority = body["priority"] && cleanUpParameter("priority", body["priority"]);
                            let status = body["status"] && cleanUpParameter("status", body["status"]);

                            console.log(`➡️ POST /api/tickets: create request, ticketName=${ticketName}, ownerName=${ownerName}, assetName=${assetName}, priority=${priority}`);
                            const result = await TicketApiService.updateTicket
                                (ticketName, description, ownerName, assetName, priority, status);

                            res.jsonBody.results = {
                                status: 200,
                                assetName: result.assetName,
                                ticketName: result.ticketName,
                                ownerName: result.ownerName,
                                ticketStatus: result.ticketStatus,
                                priority: result.priority,
                                message: result.message                          
                            };

                            console.log(`   ✅ POST /api/tickets: response status ${res.status} - ${result.message}`);
                        } else {
                            throw new HttpError(400, `Missing request body`);
                        }
                        return res;
                    }
                    case "assignuser": {
                        try {
                            const bd = await req.text();
                            body = JSON.parse(bd);
                        } catch (error) {
                            throw new HttpError(400, `No body to process this request.`);
                        }
                        if (body) {
                            const ticketName = cleanUpParameter("ticketName", body["ticketName"]);
                            if (!ticketName) {
                                throw new HttpError(400, `Missing ticket name`);
                            }
                            const userName = cleanUpParameter("userName", body["userName"]?.toString() || "");
                            if (!userName) {
                                throw new HttpError(400, `Missing user name`);
                            }
                            const isOwnerFlag = cleanUpParameter("isOwner", body["isOwner"]?.toString() || "");
                            let isOwner = false;
                            if (isOwnerFlag === "") {
                                throw new HttpError(400, `Missing owner flag`);
                            } else {
                                isOwner = (isOwnerFlag.toLowerCase() === "true");
                            }
                            const role = cleanUpParameter("Role", body["role"]);
                            if (!role) {
                                throw new HttpError(400, `Missing role`);
                            }
                            let forecast = body["forecast"];
                            if (!forecast) {
                                forecast = 0;
                                //throw new HttpError(400, `Missing forecast this month`);
                            }
                            console.log(`➡️ POST /api/tickets: assignuser request, ticketName=${ticketName}, userName=${userName}, isOwner=${isOwner}, role=${role}, forecast=${forecast}`);
                            const result = await TicketApiService.addUserToTicket
                                (ticketName, userName, isOwner, role, forecast);

                            res.jsonBody.results = {
                                status: 200,
                                assetName: result.assetName,
                                ticketName: result.ticketName,
                                userName: result.userName,
                                remainingForecast: result.remainingForecast,
                                message: result.message
                            };

                            console.log(`   ✅ POST /api/tickets: response status ${res.status} - ${result.message}`);
                        } else {
                            throw new HttpError(400, `Missing request body`);
                        }
                        return res;
                    }
                    case "comment": {
                        try {
                            const bd = await req.text();
                            body = JSON.parse(bd);
                        } catch (error) {
                            throw new HttpError(400, `No body to process this request.`);
                        }
                        if (body) {
                            const ticketName = cleanUpParameter("ticketName", body["ticketName"]);
                            if (!ticketName) {
                                throw new HttpError(400, `Missing ticket name`);
                            }
                            const userName = cleanUpParameter("userName", body["userName"]?.toString() || "");
                            if (!userName) {
                                throw new HttpError(400, `Missing user name`);
                            }
                            const commentText = body["commentText"];
                            if (!commentText) {
                                throw new HttpError(400, `Missing comment Text`);
                            }
                            console.log(`➡️ POST /api/tickets: comment request, ticketName=${ticketName}, userName=${userName}, commentText=${commentText}`);
                            const result = await TicketApiService.commentOnTicket
                                (ticketName, userName, commentText);

                            res.jsonBody.results = {
                                status: 200,
                                assetName: result.assetName,
                                ticketName: result.ticketName,
                                userName: result.userName,
                                message: result.message
                            };

                            console.log(`   ✅ POST /api/tickets: response status ${res.status} - ${result.message}`);
                        } else {
                            throw new HttpError(400, `Missing request body`);
                        }
                        return res;
                    }
                    default: {
                        throw new HttpError(400, `Invalid command: ${id}`);
                    }
                }
            }
            default: {
                throw new Error(`Method not allowed: ${req.method}`);
            }
        }

    } catch (error) {

        const status = <number>error.status || <number>error.response?.status || 500;
        console.log(`   ⛔ Returning error status code ${status}: ${error.message}`);

        res.status = status;
        res.jsonBody.results = {
            status: status,
            message: error.message
        };
        return res;
    }
}

app.http("tickets", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "tickets/{*id}",
    handler: tickets,
});