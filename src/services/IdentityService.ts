import { HttpRequest } from "@azure/functions";
import { User } from '../model/baseModel';
import { ApiUser } from '../model/apiModel';

// This is a DEMO ONLY identity solution.
import UserApiService from "./UserApiService";

class Identity {
    private requestNumber = 1;  // Number the requests for logging purposes


    public async validateRequest(req: HttpRequest): Promise<ApiUser> {

        // Default user used for unauthenticated testing
        let userId = "1";
        let userName = "Avery Howard";
        let userEmail = "avery@treyresearch.com";

        ////////////////////////////////////////////////////////TODO

        // Get the record for this user; create one if necessary
        let user: ApiUser = null;
        try {
            user = await UserApiService.getApiUserById(userId);
        }
        catch (ex) {
            if (ex.status !== 404) {
                throw ex;
            }
            // User was not found, so we'll create one below
            user = null;
        }
        if (!user) user = await this.createUser(userId, userName, userEmail);

        return user;
    }

    private async createUser(userId: string, userName: string,
        userEmail: string): Promise<ApiUser> {

        // Create a new consultant record for this user with default values
        const user: User = {
            id: userId,
            name: userName,
            email: userEmail,
            phone: "1-555-123-4567",
            photoUrl: "https://microsoft.github.io/copilot-camp/demo-assets/images/consultants/Unknown.jpg",
            location: {
                street: "One Memorial Drive",
                city: "Cambridge",
                state: "MA",
                country: "USA",
                postalCode: "02142",
                latitude: 42.361366,
                longitude: -71.081257
            },
            relationType: "employee",
            skills: ["JavaScript", "TypeScript"],
            certifications: ["Azure Development"],
            roles: ["Architect", "Project Lead"]
        };
        const result = await UserApiService.createApiUser(user);
        return result;
    }
}

export default new Identity();






