import DbService from './DbService';
import { DbUser } from '../model/dbModel';
import { User } from '../model/baseModel';

const TABLE_NAME = "User";

class UserDbService {

    // NOTE: Users are READ ONLY in this demo app, so we are free to cache them in memory.
    private dbService = new DbService<DbUser>(true);

    async getUserById(id: string): Promise<User> {
        const user = await this.dbService.getEntityByRowKey(TABLE_NAME, id) as DbUser;
        return user;
    }

    async getUsers(): Promise<User[]> {
        const users = await this.dbService.getEntities(TABLE_NAME) as DbUser[];
        return users;
    }

    async createUser(user: User): Promise<User> {

        const newDbUser: DbUser =
        {
            ...user,
            etag: "",
            partitionKey: TABLE_NAME,
            rowKey: user.id,
            timestamp: new Date()
        };
        await this.dbService.createEntity(TABLE_NAME, newDbUser.id, newDbUser)

        console.log (`Added new user ${newDbUser.name} (${newDbUser.id}) to the User table`);
        return null;
    }

}

export default new UserDbService();
