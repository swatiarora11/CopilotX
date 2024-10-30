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
exports.units = void 0;
const functions_1 = require("@azure/functions");
const UnitApiService_1 = __importDefault(require("../services/UnitApiService"));
const Utilities_1 = require("../services/Utilities");
function units(req, context) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        context.log("HTTP trigger function units processed a request.");
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
                    let unitName = ((_c = req.query.get("unitName")) === null || _c === void 0 ? void 0 : _c.toString().toLowerCase()) || "";
                    let assetName = ((_d = req.query.get("assetName")) === null || _d === void 0 ? void 0 : _d.toString().toLowerCase()) || "";
                    console.log(`➡️ GET /api/units: request for unitName=${unitName}, assetName=${assetName}, id=${id}`);
                    unitName = (0, Utilities_1.cleanUpParameter)("unitName", unitName);
                    assetName = (0, Utilities_1.cleanUpParameter)("assetName", assetName);
                    if (id) {
                        const result = yield UnitApiService_1.default.getApiUnitById(id);
                        res.jsonBody.results = [result];
                        console.log(`   ✅ GET /api/units: response status ${res.status}; 1 units returned`);
                        return res;
                    }
                    const result = yield UnitApiService_1.default.getApiUnits(unitName, assetName);
                    res.jsonBody.results = result;
                    console.log(`   ✅ GET /api/units: response status ${res.status}; ${result.length} units returned`);
                    return res;
                }
                case "POST": {
                    switch (id.toLocaleLowerCase()) {
                        case "addasset": {
                            try {
                                const bd = yield req.text();
                                body = JSON.parse(bd);
                            }
                            catch (error) {
                                throw new Utilities_1.HttpError(400, `No body to process this request.`);
                            }
                            if (body) {
                                const unitName = (0, Utilities_1.cleanUpParameter)("unitName", body["unitName"]);
                                if (!unitName) {
                                    throw new Utilities_1.HttpError(400, `Missing unit name`);
                                }
                                const assetName = (0, Utilities_1.cleanUpParameter)("assetName", ((_e = body["assetName"]) === null || _e === void 0 ? void 0 : _e.toString()) || "");
                                if (!assetName) {
                                    throw new Utilities_1.HttpError(400, `Missing asset name`);
                                }
                                console.log(`➡️ POST /api/units: addasset request, unitName=${unitName}, assetName=${assetName}`);
                                const result = yield UnitApiService_1.default.addAssetToUnit(unitName, assetName);
                                res.jsonBody.results = {
                                    status: 200,
                                    unitName: result.unitName,
                                    assetName: result.assetName,
                                    message: result.message
                                };
                                console.log(`   ✅ POST /api/units: response status ${res.status} - ${result.message}`);
                            }
                            else {
                                throw new Utilities_1.HttpError(400, `Missing request body`);
                            }
                            return res;
                        }
                        default: {
                            throw new Utilities_1.HttpError(400, `Invalid command: ${id}`);
                        }
                    }
                }
                default: {
                    throw new Error(`Method not allowed: ${req.method}`);
                }
            }
        }
        catch (error) {
            const status = error.status || ((_f = error.response) === null || _f === void 0 ? void 0 : _f.status) || 500;
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
exports.units = units;
functions_1.app.http("units", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "units/{*id}",
    handler: units,
});
//# sourceMappingURL=units.js.map