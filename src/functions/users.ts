import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import UserApiService from "../services/UserApiService";
import { ApiUser, ErrorResult } from "../model/apiModel";
import { cleanUpParameter } from "../services/Utilities";
import IdentityService from "../services/IdentityService";

/**
 * This function handles the HTTP request and returns the user information.
 *
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response containing the user information.
 */

// Define a Response interface.
interface Response extends HttpResponseInit {
    status: number;
    jsonBody: {
      results: ApiUser[] | ErrorResult;
    };
  }
export async function users(
  req: HttpRequest,
  context: InvocationContext
): Promise<Response> {
  context.log("HTTP trigger function users processed a request.");

   // Initialize response.
   const res: Response = {
    status: 200,
    jsonBody: {
      results: [],
    },
  };
  try {
    // Will throw an exception if the request is not valid
    await IdentityService.validateRequest(req);

    // Get the input parameters
    let userName = req.query.get("userName")?.toString().toLowerCase() || "";
    let ticketName = req.query.get("ticketName")?.toString().toLowerCase() || "";
    let skill = req.query.get("skill")?.toString().toLowerCase() || "";
    let certification = req.query.get("certification")?.toString().toLowerCase() || "";
    let role = req.query.get("role")?.toString().toLowerCase() || "";
    let hoursAvailable = req.query.get("hoursAvailable")?.toString().toLowerCase() || "";

    const id = req.params?.id?.toLowerCase();

    if (id) {
      console.log(`➡️ GET /api/users/${id}: request for user ${id}`);
      const result = await UserApiService.getApiUserById(id);
      res.jsonBody.results = [result];
      console.log(`   ✅ GET /api/users/${id}: response status 1 user returned`);
      return res;
    }

    console.log(`➡️ GET /api/users: request for userName=${userName}, ticketName=${ticketName}, skill=${skill}, certification=${certification}, role=${role}, hoursAvailable=${hoursAvailable}`);

    // *** Tweak parameters for the AI ***
    userName = cleanUpParameter("userName", userName);
    ticketName = cleanUpParameter("ticketName", ticketName);
    skill = cleanUpParameter("skill", skill);
    certification = cleanUpParameter("certification", certification);
    role = cleanUpParameter("role", role);
    hoursAvailable = cleanUpParameter("hoursAvailable", hoursAvailable);
    
    const result = await UserApiService.getApiUsers(
      userName, ticketName, skill, certification, role, hoursAvailable
    );
    res.jsonBody.results = result;
    console.log(`   ✅ GET /api/users: response status ${res.status}; ${result.length} users returned`);
    return res;

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

app.http("users", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/{*id}",
  handler: users,
});
