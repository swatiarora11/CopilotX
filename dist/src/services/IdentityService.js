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
// This is a DEMO ONLY identity solution.
const UserApiService_1 = __importDefault(require("./UserApiService"));
class Identity {
    constructor() {
        this.requestNumber = 1; // Number the requests for logging purposes
    }
    validateRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Default user used for unauthenticated testing
            let userId = "1";
            let userName = "Avery Howard";
            let userEmail = "avery@treyresearch.com";
            ////////////////////////////////////////////////////////TODO
            // Get the record for this user; create one if necessary
            let user = null;
            try {
                user = yield UserApiService_1.default.getApiUserById(userId);
            }
            catch (ex) {
                if (ex.status !== 404) {
                    throw ex;
                }
                // User was not found, so we'll create one below
                user = null;
            }
            if (!user)
                user = yield this.createUser(userId, userName, userEmail);
            return user;
        });
    }
    createUser(userId, userName, userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new consultant record for this user with default values
            const user = {
                id: userId,
                name: userName,
                email: userEmail,
                phone: "1-555-123-4567",
                photoUrl: "https://microsoft.github.io/copilot-camp/demo-assets/images/consultants/Unknown.jpg",
                location: {
                    street: "One Memorial Drive",
                    city: "Cambridge",
                    state: "MA",
                    country: "USA",
                    postalCode: "02142",
                    latitude: 42.361366,
                    longitude: -71.081257
                },
                relationType: "employee",
                skills: ["JavaScript", "TypeScript"],
                certifications: ["Azure Development"],
                roles: ["Architect", "Project Lead"]
            };
            const result = yield UserApiService_1.default.createApiUser(user);
            return result;
        });
    }
}
exports.default = new Identity();
//# sourceMappingURL=IdentityService.js.map