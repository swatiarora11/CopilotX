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
const UnitDbService_1 = __importDefault(require("./UnitDbService"));
const UnitAssetAllocationDbService_1 = __importDefault(require("./UnitAssetAllocationDbService"));
const AssetDbService_1 = __importDefault(require("./AssetDbService"));
const AssetApiService_1 = __importDefault(require("./AssetApiService"));
const Utilities_1 = require("./Utilities");
class UnitApiService {
    getApiUnitById(unitId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unit = yield UnitDbService_1.default.getUnitById(unitId);
            let allocations = yield UnitAssetAllocationDbService_1.default.getUnitAssetAllocations();
            const result = yield this.getApiUnit(unit, allocations);
            return result;
        });
    }
    getApiUnits(unitName, assetName) {
        return __awaiter(this, void 0, void 0, function* () {
            let units = yield UnitDbService_1.default.getUnits();
            let allocations = yield UnitAssetAllocationDbService_1.default.getUnitAssetAllocations();
            // Filter on base properties
            if (unitName) {
                units = units.filter((p) => {
                    var _a;
                    const name = (_a = p.name) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    return name.includes(unitName.toLowerCase());
                });
            }
            //remove duplicates
            units = units.filter((unit, index, self) => index === self.findIndex((p) => (p.id === unit.id)));
            // Augment the base properties with asset allocation information
            let result = yield Promise.all(units.map((p) => this.getApiUnit(p, allocations)));
            // Filter on augmented properties
            if (result && assetName) {
                result = result.filter((p) => {
                    const name = assetName.toLowerCase();
                    return p.assets.find((n) => n.name.toLowerCase().includes(name));
                });
            }
            ;
            return result;
        });
    }
    // Augment a unit to get an ApiUnit
    getApiUnit(unit, allocations) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = unit;
            allocations = allocations.filter((a) => a.unitId === unit.id);
            result.assets = [];
            for (let allocation of allocations) {
                const asset = yield AssetDbService_1.default.getAssetById(allocation.assetId);
                result.assets.push({
                    id: asset.id,
                    name: asset.name,
                    description: asset.description,
                    acquisitionDate: asset.acquisitionDate,
                    status: asset.status,
                    photoUrl: asset.photoUrl,
                    tickets: []
                });
            }
            return result;
        });
    }
    addAssetToUnit(unitName, assetName) {
        return __awaiter(this, void 0, void 0, function* () {
            let units = yield this.getApiUnits(unitName, "");
            let assets = yield AssetApiService_1.default.getApiAssets(assetName);
            if (units.length === 0) {
                throw new Utilities_1.HttpError(404, `Unit not found: ${unitName}`);
            }
            else if (units.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple units found with the name: ${unitName}`);
            }
            else if (assets.length === 0) {
                throw new Utilities_1.HttpError(404, `Asset not found: ${assetName}`);
            }
            else if (assets.length > 1) {
                throw new Utilities_1.HttpError(406, `Multiple assignments found with the name: ${assetName}`);
            }
            const unit = units[0];
            const asset = assets[0];
            const success = yield UnitAssetAllocationDbService_1.default.addAssetToUnit(unit.id, asset.id);
            const message = `Added asset ${asset.name} to unit ${unit.name}`;
            return {
                unitName: unit.name,
                assetName: assets[0].name,
                message
            };
        });
    }
}
exports.default = new UnitApiService();
//# sourceMappingURL=UnitApiService.js.map