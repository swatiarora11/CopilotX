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
const TABLE_NAME = "Unit";
class UnitDbService {
    constructor() {
        // NOTE: Units are READ ONLY in this demo app, so we are free to cache them in memory.
        this.dbService = new DbService_1.default(true);
    }
    getUnitById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const unit = yield this.dbService.getEntityByRowKey(TABLE_NAME, id);
            return this.convertDbUnit(unit);
        });
    }
    getUnits() {
        return __awaiter(this, void 0, void 0, function* () {
            const units = yield this.dbService.getEntities(TABLE_NAME);
            return units.map((p) => this.convertDbUnit(p));
        });
    }
    convertDbUnit(dbUnit) {
        const result = {
            id: dbUnit.id,
            name: dbUnit.name,
            location: dbUnit.location,
            unitContact: dbUnit.unitContact,
            unitContactEmail: dbUnit.unitContactEmail
        };
        return result;
    }
}
exports.default = new UnitDbService();
//# sourceMappingURL=UnitDbService.js.map