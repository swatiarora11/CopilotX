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
exports.assets = void 0;
const functions_1 = require("@azure/functions");
const AssetApiService_1 = __importDefault(require("../services/AssetApiService"));
const Utilities_1 = require("../services/Utilities");
function assets(req, context) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        context.log("HTTP trigger function assets processed a request.");
        // Initialize response.
        const res = {
            status: 200,
            jsonBody: {
                results: [],
            },
        };
        try {
            const id = (_b = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            let body = null;
            switch (req.method) {
                case "GET": {
                    let assetName = ((_c = req.query.get("assetName")) === null || _c === void 0 ? void 0 : _c.toString().toLowerCase()) || "";
                    console.log(`➡️ GET /api/assets: request for assetName=${assetName}, id=${id}`);
                    assetName = (0, Utilities_1.cleanUpParameter)("assetName", assetName);
                    if (id) {
                        const result = yield AssetApiService_1.default.getApiAssetById(id);
                        res.jsonBody.results = [result];
                        console.log(`   ✅ GET /api/assets: response status ${res.status}; 1 assets returned`);
                        return res;
                    }
                    const result = yield AssetApiService_1.default.getApiAssets(assetName);
                    res.jsonBody.results = result;
                    console.log(`   ✅ GET /api/assets: response status ${res.status}; ${result.length} assets returned`);
                    return res;
                }
                default: {
                    throw new Error(`Method not allowed: ${req.method}`);
                }
            }
        }
        catch (error) {
            const status = error.status || ((_d = error.response) === null || _d === void 0 ? void 0 : _d.status) || 500;
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
exports.assets = assets;
functions_1.app.http("assets", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "assets/{*id}",
    handler: assets,
});
//# sourceMappingURL=assets.js.map