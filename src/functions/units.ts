import { Path, GET, POST } from 'typescript-rest';
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import UnitApiService from "../services/UnitApiService";
import { ApiUnit, ApiAddAssetToUnitResponse, ErrorResult } from "../model/apiModel";
import { HttpError, cleanUpParameter } from "../services/Utilities";

/**
 * This function handles the HTTP request and returns the unit information.
 *
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response containing the unit information.
 */

// Define a Response interface.
interface Response extends HttpResponseInit {
    status: number;
    jsonBody: {
        results: ApiUnit[] | ApiAddAssetToUnitResponse | ErrorResult;
    };
}
export async function units(
    req: HttpRequest,
    context: InvocationContext
): Promise<Response> {
    context.log("HTTP trigger function units processed a request.");
    // Initialize response.
    const res: Response = {
        status: 200,
        jsonBody: {
            results: [],
        },
    };

    try {
        const id = req.params?.id?.toLowerCase();
        let body = null;
        switch (req.method) {
            case "GET": {

                let unitName = req.query.get("unitName")?.toString().toLowerCase() || "";
                let assetName = req.query.get("assetName")?.toString().toLowerCase() || "";

                console.log(`➡️ GET /api/units: request for unitName=${unitName}, assetName=${assetName}, id=${id}`);

                unitName = cleanUpParameter("unitName", unitName);
                assetName = cleanUpParameter("assetName", assetName);

                if (id) {
                    const result = await UnitApiService.getApiUnitById(id);
                    res.jsonBody.results = [result];
                    console.log(`   ✅ GET /api/units: response status ${res.status}; 1 units returned`);
                    return res;
                }

                const result = await UnitApiService.getApiUnits(unitName, assetName);
                res.jsonBody.results = result;
                console.log(`   ✅ GET /api/units: response status ${res.status}; ${result.length} units returned`);
                return res;
            }
            case "POST": {
                switch (id.toLocaleLowerCase()) {
                    case "addasset": {
                        try {
                            const bd = await req.text();
                            body = JSON.parse(bd);
                        } catch (error) {
                            throw new HttpError(400, `No body to process this request.`);
                        }
                        if (body) {
                            const unitName = cleanUpParameter("unitName", body["unitName"]);
                            if (!unitName) {
                                throw new HttpError(400, `Missing unit name`);
                            }
                            const assetName = cleanUpParameter("assetName", body["assetName"]?.toString() || "");
                            if (!assetName) {
                                throw new HttpError(400, `Missing asset name`);
                            }
                            console.log(`➡️ POST /api/units: addasset request, unitName=${unitName}, assetName=${assetName}`);
                            const result = await UnitApiService.addAssetToUnit(unitName, assetName);

                            res.jsonBody.results = {
                                status: 200,
                                unitName: result.unitName,                                
                                assetName: result.assetName,
                                message: result.message
                            };

                            console.log(`   ✅ POST /api/units: response status ${res.status} - ${result.message}`);
                        } else {
                            throw new HttpError(400, `Missing request body`);
                        }
                        return res;
                    }
                    default: {
                        throw new HttpError(400, `Invalid command: ${id}`);
                    }
                }
            }
            default: {
                throw new Error(`Method not allowed: ${req.method}`);
            }
        }

    } catch (error) {

        const status = <number>error.status || <number>error.response?.status || 500;
        console.log(`   ⛔ Returning error status code ${status}: ${error.message}`);

        res.status = status;
        res.jsonBody.results = {
            status: status,
            message: error.message
        };
        return res;
    }
}

app.http("units", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "units/{*id}",
    handler: units,
});