import DbService from './DbService';
import { DbAsset } from '../model/dbModel';
import { Asset } from '../model/baseModel';

const TABLE_NAME = "Asset";

class AssetDbService {

    // NOTE: Assets are READ ONLY in this demo app, so we are free to cache them in memory.
    private dbService = new DbService<DbAsset>(true);

    async getAssetById(id: string): Promise<Asset> {
        const asset = await this.dbService.getEntityByRowKey(TABLE_NAME, id) as DbAsset;
        return this.convertDbAsset(asset);
    }

    async getAssets(): Promise<Asset[]> {
        const assets = await this.dbService.getEntities(TABLE_NAME) as DbAsset[];
        return assets.map<Asset>((p) => this.convertDbAsset(p));
    }

    private convertDbAsset(dbAsset: DbAsset): Asset {
        const result = {
            id: dbAsset.id,
            name: dbAsset.name,
            description: dbAsset.description,
            acquisitionDate: dbAsset.acquisitionDate,
            status: dbAsset.status,
            unitId: dbAsset.unitId,
            photoUrl: this.getPhotoUrl(dbAsset)
        };
        return result;
    }

    private getPhotoUrl(asset: Asset): string {
        let companyNameKabobCase = asset.name.toLowerCase().replace(/ /g, "-");
        return `https://microsoft.github.io/copilot-camp/demo-assets/images/maps/${companyNameKabobCase}.jpg`;
    }
}

export default new AssetDbService();
