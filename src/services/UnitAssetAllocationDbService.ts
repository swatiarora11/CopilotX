import DbService from './DbService';
import { DbUnitAssetAllocation as DbUnitAssetAllocation } from '../model/dbModel';
import { UnitAssetAllocation } from '../model/baseModel';
import { HttpError } from './Utilities';

const TABLE_NAME = "UnitAssetAllocation";

class UnitAssetAllocationDbService {

    // NOTE: UnitAssetAllocations are READ-WRITE so disable local caching
    private dbService = new DbService<DbUnitAssetAllocation>(false);

    async getUnitAssetAllocations(): Promise<UnitAssetAllocation[]> {
        const assignments = await this.dbService.getEntities(TABLE_NAME) as DbUnitAssetAllocation[];
        const result = assignments.map((e) => this.convertDbUnitAssetAllocation(e));
        return result;
    }

    async addAssetToUnit(unitId: string, assetId: string): Promise<boolean> {

        let dbUnitAssetAllocation = null;
        try {
            dbUnitAssetAllocation = await this.dbService.getEntityByRowKey(TABLE_NAME, unitId + "," + assetId) as DbUnitAssetAllocation;
        } catch { }

        if (dbUnitAssetAllocation) {
            throw new HttpError(403, "UnitAssetAllocation already exists");
        }

        try {
            const newUnitAssetAllocation: DbUnitAssetAllocation = {
                etag: "",
                partitionKey: TABLE_NAME,
                rowKey: unitId + "," + assetId,
                timestamp: new Date(),
                id: unitId + "," + assetId,
                unitId: unitId,
                assetId: assetId
            };

            await this.dbService.createEntity(TABLE_NAME, newUnitAssetAllocation.id, newUnitAssetAllocation)

            return true;
        } catch (e) {
            throw new HttpError(500, "Unable to add asset");
        }
    }

    private convertDbUnitAssetAllocation(dbUnitAssetAllocation: DbUnitAssetAllocation): UnitAssetAllocation {
        const result: UnitAssetAllocation = {
            id: dbUnitAssetAllocation.id,
            unitId: dbUnitAssetAllocation.unitId,
            assetId: dbUnitAssetAllocation.assetId
        };

        return result;
    }
}

export default new UnitAssetAllocationDbService();
