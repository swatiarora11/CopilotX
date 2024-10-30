import { Asset } from '../model/baseModel';
import { ApiAsset } from '../model/apiModel';
import AssetDbService from './AssetDbService';

class AssetApiService {

    async getApiAssetById(assetId: string): Promise<ApiAsset> {
        const asset = await AssetDbService.getAssetById(assetId);
        const result = await this.getApiAsset(asset);
        return result;
    }

    async getApiAssets(assetName: string): Promise<ApiAsset[]> {

        let assets = await AssetDbService.getAssets();

        // Filter on base properties
        if (assetName) {
            assets = assets.filter(
                (p) => {
                    const name = p.name?.toLowerCase();
                    return name.includes(assetName.toLowerCase());
                });
        }
        //remove duplicates
        assets = assets.filter(
            (asset, index, self) => 
                index === self.findIndex((p) => (
                    p.id === asset.id
                ))
        );

        // Augment the base properties with ticket information if required
        let result = await Promise.all(assets.map((p) => this.getApiAsset(p)));
        return result;
    }

    // Augment asset to get an ApiAsset if required
    async getApiAsset(asset: Asset): Promise<ApiAsset> {
        const result = asset as ApiAsset;
        return result;
    }
}

export default new AssetApiService();
