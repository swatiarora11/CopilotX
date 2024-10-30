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
const Utilities_1 = require("./Utilities");
const TABLE_NAME = "UnitAssetAssignment";
class UnitAssetAssignmentDbService {
    constructor() {
        // NOTE: UnitAssetAssignments are READ-WRITE so disable local caching
        this.dbService = new DbService_1.default(false);
    }
    getUnitAssetAssignments() {
        return __awaiter(this, void 0, void 0, function* () {
            const assignments = yield this.dbService.getEntities(TABLE_NAME);
            const result = assignments.map((e) => this.convertDbUnitAssetAssignment(e));
            return result;
        });
    }
    addAssetToUnit(unitId, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            let dbUnitAssetAssignment = null;
            try {
                dbUnitAssetAssignment = (yield this.dbService.getEntityByRowKey(TABLE_NAME, unitId + "," + assetId));
            }
            catch (_a) { }
            if (dbUnitAssetAssignment) {
                throw new Utilities_1.HttpError(403, "UnitAssetAssignment already exists");
            }
            try {
                const newUnitAssetAssignment = {
                    etag: "",
                    partitionKey: TABLE_NAME,
                    rowKey: unitId + "," + assetId,
                    timestamp: new Date(),
                    id: unitId + "," + assetId,
                    unitId: unitId,
                    assetId: assetId
                };
                yield this.dbService.createEntity(TABLE_NAME, newUnitAssetAssignment.id, newUnitAssetAssignment);
                return true;
            }
            catch (e) {
                throw new Utilities_1.HttpError(500, "Unable to add assignment");
            }
        });
    }
    convertDbUnitAssetAssignment(dbUnitAssetAssignment) {
        const result = {
            id: dbUnitAssetAssignment.id,
            unitId: dbUnitAssetAssignment.unitId,
            assetId: dbUnitAssetAssignment.assetId
        };
        return result;
    }
}
exports.default = new UnitAssetAssignmentDbService();
//# sourceMappingURL=UnitAssetAssignmentDbService.js.map