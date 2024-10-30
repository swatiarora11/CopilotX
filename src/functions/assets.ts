import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import AssetApiService from "../services/AssetApiService";
import { ApiAsset, ErrorResult } from "../model/apiModel";
import { HttpError, cleanUpParameter } from "../services/Utilities";

/**
 * This function handles the HTTP request and returns the asset information.
 *
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response containing the asset information.
 */

// Define a Response interface.
interface Response extends HttpResponseInit {
    status: number;
    jsonBody: {
        results: ApiAsset[] | ErrorResult;
    };
}
export async function assets(
    req: HttpRequest,
    context: InvocationContext
): Promise<Response> {
    context.log("HTTP trigger function assets processed a request.");
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

                let assetName = req.query.get("assetName")?.toString().toLowerCase() || "";
                console.log(`➡️ GET /api/assets: request for assetName=${assetName}, id=${id}`);
                assetName = cleanUpParameter("assetName", assetName);

                if (id) {
                    const result = await AssetApiService.getApiAssetById(id);
                    res.jsonBody.results = [result];
                    console.log(`   ✅ GET /api/assets: response status ${res.status}; 1 assets returned`);
                    return res;
                }

                const result = await AssetApiService.getApiAssets(assetName);
                res.jsonBody.results = result;
                console.log(`   ✅ GET /api/assets: response status ${res.status}; ${result.length} assets returned`);
                return res;
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

app.http("assets", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "assets/{*id}",
    handler: assets,
});