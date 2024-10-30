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
exports.users = void 0;
const functions_1 = require("@azure/functions");
const UserApiService_1 = __importDefault(require("../services/UserApiService"));
const Utilities_1 = require("../services/Utilities");
const IdentityService_1 = __importDefault(require("../services/IdentityService"));
function users(req, context) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __awaiter(this, void 0, void 0, function* () {
        context.log("HTTP trigger function users processed a request.");
        // Initialize response.
        const res = {
            status: 200,
            jsonBody: {
                results: [],
            },
        };
        try {
            // Will throw an exception if the request is not valid
            yield IdentityService_1.default.validateRequest(req);
            // Get the input parameters
            let userName = ((_a = req.query.get("userName")) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase()) || "";
            let ticketName = ((_b = req.query.get("ticketName")) === null || _b === void 0 ? void 0 : _b.toString().toLowerCase()) || "";
            let skill = ((_c = req.query.get("skill")) === null || _c === void 0 ? void 0 : _c.toString().toLowerCase()) || "";
            let certification = ((_d = req.query.get("certification")) === null || _d === void 0 ? void 0 : _d.toString().toLowerCase()) || "";
            let role = ((_e = req.query.get("role")) === null || _e === void 0 ? void 0 : _e.toString().toLowerCase()) || "";
            let hoursAvailable = ((_f = req.query.get("hoursAvailable")) === null || _f === void 0 ? void 0 : _f.toString().toLowerCase()) || "";
            const id = (_h = (_g = req.params) === null || _g === void 0 ? void 0 : _g.id) === null || _h === void 0 ? void 0 : _h.toLowerCase();
            if (id) {
                console.log(`➡️ GET /api/users/${id}: request for user ${id}`);
                const result = yield UserApiService_1.default.getApiUserById(id);
                res.jsonBody.results = [result];
                console.log(`   ✅ GET /api/users/${id}: response status 1 user returned`);
                return res;
            }
            console.log(`➡️ GET /api/users: request for userName=${userName}, ticketName=${ticketName}, skill=${skill}, certification=${certification}, role=${role}, hoursAvailable=${hoursAvailable}`);
            // *** Tweak parameters for the AI ***
            userName = (0, Utilities_1.cleanUpParameter)("userName", userName);
            ticketName = (0, Utilities_1.cleanUpParameter)("ticketName", ticketName);
            skill = (0, Utilities_1.cleanUpParameter)("skill", skill);
            certification = (0, Utilities_1.cleanUpParameter)("certification", certification);
            role = (0, Utilities_1.cleanUpParameter)("role", role);
            hoursAvailable = (0, Utilities_1.cleanUpParameter)("hoursAvailable", hoursAvailable);
            const result = yield UserApiService_1.default.getApiUsers(userName, ticketName, skill, certification, role, hoursAvailable);
            res.jsonBody.results = result;
            console.log(`   ✅ GET /api/users: response status ${res.status}; ${result.length} users returned`);
            return res;
        }
        catch (error) {
            const status = error.status || ((_j = error.response) === null || _j === void 0 ? void 0 : _j.status) || 500;
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
exports.users = users;
functions_1.app.http("users", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "users/{*id}",
    handler: users,
});
//# sourceMappingURL=users.js.map