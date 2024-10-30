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
const AssetDbService_1 = __importDefault(require("./AssetDbService"));
class AssetApiService {
    getApiAssetById(assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const asset = yield AssetDbService_1.default.getAssetById(assetId);
            const result = yield this.getApiAsset(asset);
            return result;
        });
    }
    getApiAssets(assetName) {
        return __awaiter(this, void 0, void 0, function* () {
            let assets = yield AssetDbService_1.default.getAssets();
            // Filter on base properties
            if (assetName) {
                assets = assets.filter((p) => {
                    var _a;
                    const name = (_a = p.name) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    return name.includes(assetName.toLowerCase());
                });
            }
            //remove duplicates
            assets = assets.filter((asset, index, self) => index === self.findIndex((p) => (p.id === asset.id)));
            // Augment the base properties with ticket information if required
            let result = yield Promise.all(assets.map((p) => this.getApiAsset(p)));
            return result;
        });
    }
    // Augment asset to get an ApiAsset if required
    getApiAsset(asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = asset;
            return result;
        });
    }
}
exports.default = new AssetApiService();
//# sourceMappingURL=AssetApiService.js.map