import DbService from './DbService';
import { DbUnit } from '../model/dbModel';
import { Unit } from '../model/baseModel';

const TABLE_NAME = "Unit";

class UnitDbService {

    // NOTE: Units are READ ONLY in this demo app, so we are free to cache them in memory.
    private dbService = new DbService<DbUnit>(true);

    async getUnitById(id: string): Promise<Unit> {
        const unit = await this.dbService.getEntityByRowKey(TABLE_NAME, id) as DbUnit;
        return this.convertDbUnit(unit);
    }

    async getUnits(): Promise<Unit[]> {
        const units = await this.dbService.getEntities(TABLE_NAME) as DbUnit[];
        return units.map<Unit>((p) => this.convertDbUnit(p));
    }

    private convertDbUnit(dbUnit: DbUnit): Unit {
        const result = {
            id: dbUnit.id,
            name: dbUnit.name,
            location: dbUnit.location,
            unitContact: dbUnit.unitContact,
            unitContactEmail: dbUnit.unitContactEmail
        };
        return result;
    }
}

export default new UnitDbService();
