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
exports.tickets = void 0;
const functions_1 = require("@azure/functions");
const TicketApiService_1 = __importDefault(require("../services/TicketApiService"));
const Utilities_1 = require("../services/Utilities");
const IdentityService_1 = __importDefault(require("../services/IdentityService"));
function tickets(req, context) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    return __awaiter(this, void 0, void 0, function* () {
        context.log("HTTP trigger function tickets processed a request.");
        // Initialize response.
        const res = {
            status: 200,
            jsonBody: {
                results: [],
            },
        };
        try {
            // Will throw an exception if the request is not valid
            const userInfo = yield IdentityService_1.default.validateRequest(req);
            const id = (_b = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            let body = null;
            switch (req.method) {
                case "GET": {
                    let ticketName = ((_c = req.query.get("ticketName")) === null || _c === void 0 ? void 0 : _c.toString().toLowerCase()) || "";
                    let userName = ((_d = req.query.get("userName")) === null || _d === void 0 ? void 0 : _d.toString().toLowerCase()) || "";
                    let ownerName = ((_e = req.query.get("ownerName")) === null || _e === void 0 ? void 0 : _e.toString().toLowerCase()) || "";
                    console.log(`➡️ GET /api/tickets: request for ticketName=${ticketName}, userName=${userName}, ownerName=${ownerName}, id=${id}`);
                    ticketName = (0, Utilities_1.cleanUpParameter)("ticketName", ticketName);
                    userName = (0, Utilities_1.cleanUpParameter)("userName", userName);
                    ownerName = (0, Utilities_1.cleanUpParameter)("ownerName", ownerName);
                    if (id) {
                        const result = yield TicketApiService_1.default.getApiTicketById(id);
                        res.jsonBody.results = [result];
                        console.log(`   ✅ GET /api/tickets: response status ${res.status}; 1 tickets returned`);
                        return res;
                    }
                    // Use current user if the ticket name is user_profile
                    if (ticketName.includes('user_profile')) {
                        const result = yield TicketApiService_1.default.getApiTickets("", userInfo.name, "");
                        res.jsonBody.results = result;
                        console.log(`   ✅ GET /api/tickets for current user response status ${res.status}; ${result.length} tickets returned`);
                        return res;
                    }
                    const result = yield TicketApiService_1.default.getApiTickets(ticketName, userName, ownerName);
                    res.jsonBody.results = result;
                    console.log(`   ✅ GET /api/tickets: response status ${res.status}; ${result.length} tickets returned`);
                    return res;
                }
                case "POST": {
                    switch (id.toLocaleLowerCase()) {
                        case "create": {
                            try {
                                const bd = yield req.text();
                                body = JSON.parse(bd);
                            }
                            catch (error) {
                                throw new Utilities_1.HttpError(400, `No body to process this request.`);
                            }
                            if (body) {
                                const ticketName = (0, Utilities_1.cleanUpParameter)("ticketName", body["ticketName"]);
                                if (!ticketName) {
                                    throw new Utilities_1.HttpError(400, `Missing ticket name`);
                                }
                                const description = body["description"];
                                if (!description) {
                                    throw new Utilities_1.HttpError(400, `Missing ticket description`);
                                }
                                const ownerName = (0, Utilities_1.cleanUpParameter)("ownerName", ((_f = body["ownerName"]) === null || _f === void 0 ? void 0 : _f.toString()) || "");
                                if (!ownerName) {
                                    throw new Utilities_1.HttpError(400, `Missing ticket owner name`);
                                }
                                const assetName = (0, Utilities_1.cleanUpParameter)("assetName", body["assetName"]);
                                if (!assetName) {
                                    throw new Utilities_1.HttpError(400, `assetName is required`);
                                }
                                let priority = (0, Utilities_1.cleanUpParameter)("priority", ((_g = body["priority"]) === null || _g === void 0 ? void 0 : _g.toString()) || "low");
                                let status = "new";
                                console.log(`➡️ POST /api/tickets: create request, ticketName=${ticketName}, ownerName=${ownerName}, assetName=${assetName}, priority=${priority}`);
                                const result = yield TicketApiService_1.default.createTicket(ticketName, description, ownerName, assetName, priority, status);
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
                            }
                            else {
                                throw new Utilities_1.HttpError(400, `Missing request body`);
                            }
                            return res;
                        }
                        case "update": {
                            try {
                                const bd = yield req.text();
                                body = JSON.parse(bd);
                            }
                            catch (error) {
                                throw new Utilities_1.HttpError(400, `No body to process this request.`);
                            }
                            if (body) {
                                const ticketName = (0, Utilities_1.cleanUpParameter)("ticketName", body["ticketName"]);
                                if (!ticketName) {
                                    throw new Utilities_1.HttpError(400, `Missing ticket name`);
                                }
                                let description = body["description"];
                                let ownerName = body["ownerName"] && (0, Utilities_1.cleanUpParameter)("ownerName", body["ownerName"]);
                                let assetName = body["assetName"] && (0, Utilities_1.cleanUpParameter)("assetName", body["assetName"]);
                                let priority = body["priority"] && (0, Utilities_1.cleanUpParameter)("priority", body["priority"]);
                                let status = body["status"] && (0, Utilities_1.cleanUpParameter)("status", body["status"]);
                                console.log(`➡️ POST /api/tickets: create request, ticketName=${ticketName}, ownerName=${ownerName}, assetName=${assetName}, priority=${priority}`);
                                const result = yield TicketApiService_1.default.updateTicket(ticketName, description, ownerName, assetName, priority, status);
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
                            }
                            else {
                                throw new Utilities_1.HttpError(400, `Missing request body`);
                            }
                            return res;
                        }
                        case "assignuser": {
                            try {
                                const bd = yield req.text();
                                body = JSON.parse(bd);
                            }
                            catch (error) {
                                throw new Utilities_1.HttpError(400, `No body to process this request.`);
                            }
                            if (body) {
                                const ticketName = (0, Utilities_1.cleanUpParameter)("ticketName", body["ticketName"]);
                                if (!ticketName) {
                                    throw new Utilities_1.HttpError(400, `Missing ticket name`);
                                }
                                const userName = (0, Utilities_1.cleanUpParameter)("userName", ((_h = body["userName"]) === null || _h === void 0 ? void 0 : _h.toString()) || "");
                                if (!userName) {
                                    throw new Utilities_1.HttpError(400, `Missing user name`);
                                }
                                const isOwnerFlag = (0, Utilities_1.cleanUpParameter)("isOwner", ((_j = body["isOwner"]) === null || _j === void 0 ? void 0 : _j.toString()) || "");
                                let isOwner = false;
                                if (isOwnerFlag === "") {
                                    throw new Utilities_1.HttpError(400, `Missing owner flag`);
                                }
                                else {
                                    isOwner = (isOwnerFlag.toLowerCase() === "true");
                                }
                                const role = (0, Utilities_1.cleanUpParameter)("Role", body["role"]);
                                if (!role) {
                                    throw new Utilities_1.HttpError(400, `Missing role`);
                                }
                                let forecast = body["forecast"];
                                if (!forecast) {
                                    forecast = 0;
                                    //throw new HttpError(400, `Missing forecast this month`);
                                }
                                console.log(`➡️ POST /api/tickets: assignuser request, ticketName=${ticketName}, userName=${userName}, isOwner=${isOwner}, role=${role}, forecast=${forecast}`);
                                const result = yield TicketApiService_1.default.addUserToTicket(ticketName, userName, isOwner, role, forecast);
                                res.jsonBody.results = {
                                    status: 200,
                                    assetName: result.assetName,
                                    ticketName: result.ticketName,
                                    userName: result.userName,
                                    remainingForecast: result.remainingForecast,
                                    message: result.message
                                };
                                console.log(`   ✅ POST /api/tickets: response status ${res.status} - ${result.message}`);
                            }
                            else {
                                throw new Utilities_1.HttpError(400, `Missing request body`);
                            }
                            return res;
                        }
                        case "comment": {
                            try {
                                const bd = yield req.text();
                                body = JSON.parse(bd);
                            }
                            catch (error) {
                                throw new Utilities_1.HttpError(400, `No body to process this request.`);
                            }
                            if (body) {
                                const ticketName = (0, Utilities_1.cleanUpParameter)("ticketName", body["ticketName"]);
                                if (!ticketName) {
                                    throw new Utilities_1.HttpError(400, `Missing ticket name`);
                                }
                                const userName = (0, Utilities_1.cleanUpParameter)("userName", ((_k = body["userName"]) === null || _k === void 0 ? void 0 : _k.toString()) || "");
                                if (!userName) {
                                    throw new Utilities_1.HttpError(400, `Missing user name`);
                                }
                                const commentText = body["commentText"];
                                if (!commentText) {
                                    throw new Utilities_1.HttpError(400, `Missing comment Text`);
                                }
                                console.log(`➡️ POST /api/tickets: comment request, ticketName=${ticketName}, userName=${userName}, commentText=${commentText}`);
                                const result = yield TicketApiService_1.default.commentOnTicket(ticketName, userName, commentText);
                                res.jsonBody.results = {
                                    status: 200,
                                    assetName: result.assetName,
                                    ticketName: result.ticketName,
                                    userName: result.userName,
                                    message: result.message
                                };
                                console.log(`   ✅ POST /api/tickets: response status ${res.status} - ${result.message}`);
                            }
                            else {
                                throw new Utilities_1.HttpError(400, `Missing request body`);
                            }
                            return res;
                        }
                        default: {
                            throw new Utilities_1.HttpError(400, `Invalid command: ${id}`);
                        }
                    }
                }
                default: {
                    throw new Error(`Method not allowed: ${req.method}`);
                }
            }
        }
        catch (error) {
            const status = error.status || ((_l = error.response) === null || _l === void 0 ? void 0 : _l.status) || 500;
            console.log(`   ⛔ Returning error status code ${status}: ${error.message}`);
            res.status = status;
            res.jsonBody.results = {
                status: status,
                message: error.message
            };
            return res;
        }
    });
}
exports.tickets = tickets;
functions_1.app.http("tickets", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "tickets/{*id}",
    handler: tickets,
});
//# sourceMappingURL=tickets.js.map