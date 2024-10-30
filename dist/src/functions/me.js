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
exports.me = void 0;
const functions_1 = require("@azure/functions");
const UserApiService_1 = __importDefault(require("../services/UserApiService"));
const Utilities_1 = require("../services/Utilities");
const IdentityService_1 = __importDefault(require("../services/IdentityService"));
function me(req, context) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        context.log("HTTP trigger function me processed a request.");
        // Initialize response.
        const res = {
            status: 200,
            jsonBody: {
                results: [],
            },
        };
        try {
            const me = yield IdentityService_1.default.validateRequest(req);
            const command = (_a = req.params.command) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            let body = null;
            switch (req.method) {
                case "GET": {
                    if (command) {
                        throw new Utilities_1.HttpError(400, `Invalid command: ${command}`);
                    }
                    console.log(`➡️ GET /api/me request`);
                    const result = [me];
                    res.jsonBody.results = result;
                    console.log(`   ✅ GET /me response status ${res.status}; ${result.length} users returned`);
                    return res;
                }
                case "POST": {
                    const me = yield IdentityService_1.default.validateRequest(req);
                    switch (command) {
                        case "workonticket": {
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
                                const hours = body["hours"];
                                if (!hours) {
                                    throw new Utilities_1.HttpError(400, `Missing hours`);
                                }
                                if (typeof hours !== 'number' || hours < 0 || hours > 24) {
                                    throw new Utilities_1.HttpError(400, `Invalid hours: ${hours}`);
                                }
                                console.log(`➡️ POST /api/me/workonticket request for ticket ${ticketName}, hours ${hours}`);
                                const result = yield UserApiService_1.default.workOnTicket(ticketName, me.id, hours);
                                res.jsonBody.results = {
                                    status: 200,
                                    assetName: result.assetName,
                                    ticketName: result.ticketName,
                                    remainingForecast: result.remainingForecast,
                                    message: result.message
                                };
                                console.log(`   ✅ POST /api/me/chargetime response status ${res.status}; ${result.message}`);
                            }
                            else {
                                throw new Utilities_1.HttpError(400, `Missing request body`);
                            }
                            return res;
                        }
                        default: {
                            throw new Utilities_1.HttpError(400, `Invalid command: ${command}`);
                        }
                    }
                }
                default:
                    throw new Utilities_1.HttpError(405, `Method not allowed: ${req.method}`);
            }
        }
        catch (error) {
            const status = error.status || ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500;
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
exports.me = me;
functions_1.app.http("me", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "me/{*command}",
    handler: me,
});
//# sourceMappingURL=me.js.map