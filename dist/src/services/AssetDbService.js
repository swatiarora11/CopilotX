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
const TABLE_NAME = "Asset";
class AssetDbService {
    constructor() {
        // NOTE: Assets are READ ONLY in this demo app, so we are free to cache them in memory.
        this.dbService = new DbService_1.default(true);
    }
    getAssetById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield this.dbService.getEntityByRowKey(TABLE_NAME, id);
            return this.convertDbAsset(asset);
        });
    }
    getAssets() {
        return __awaiter(this, void 0, void 0, function* () {
            const assets = yield this.dbService.getEntities(TABLE_NAME);
            return assets.map((p) => this.convertDbAsset(p));
        });
    }
    convertDbAsset(dbAsset) {
        const result = {
            id: dbAsset.id,
            name: dbAsset.name,
            description: dbAsset.description,
            acquisitionDate: dbAsset.acquisitionDate,
            status: dbAsset.status,
            unitId: dbAsset.unitId,
            photoUrl: this.getPhotoUrl(dbAsset)
        };
        return result;
    }
    getPhotoUrl(asset) {
        let companyNameKabobCase = asset.name.toLowerCase().replace(/ /g, "-");
        return `https://microsoft.github.io/copilot-camp/demo-assets/images/maps/${companyNameKabobCase}.jpg`;
    }
}
exports.default = new AssetDbService();
//# sourceMappingURL=AssetDbService.js.map