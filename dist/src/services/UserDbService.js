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
const DbService_1 = __importDefault(require("./DbService"));
const TABLE_NAME = "User";
class UserDbService {
    constructor() {
        // NOTE: Users are READ ONLY in this demo app, so we are free to cache them in memory.
        this.dbService = new DbService_1.default(true);
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.dbService.getEntityByRowKey(TABLE_NAME, id);
            return user;
        });
    }
    getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.dbService.getEntities(TABLE_NAME);
            return users;
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newDbUser = Object.assign(Object.assign({}, user), { etag: "", partitionKey: TABLE_NAME, rowKey: user.id, timestamp: new Date() });
            yield this.dbService.createEntity(TABLE_NAME, newDbUser.id, newDbUser);
            console.log(`Added new user ${newDbUser.name} (${newDbUser.id}) to the User table`);
            return null;
        });
    }
}
exports.default = new UserDbService();
//# sourceMappingURL=UserDbService.js.map