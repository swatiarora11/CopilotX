import { Unit, UnitAssetAllocation } from '../model/baseModel';
import { ApiUnit, ApiAddAssetToUnitResponse } from '../model/apiModel';
import UnitDbService from './UnitDbService';
import UnitAssetAllocationDbService from './UnitAssetAllocationDbService';
import AssetDbService from './AssetDbService';
import AssetApiService from './AssetApiService';
import { HttpError } from './Utilities';

class UnitApiService {

    async getApiUnitById(unitId: string): Promise<ApiUnit> {
        const unit = await UnitDbService.getUnitById(unitId);
        let allocations = await UnitAssetAllocationDbService.getUnitAssetAllocations();

        const result = await this.getApiUnit(unit, allocations);
        return result;
    }

    async getApiUnits(unitName: string, assetName: string): Promise<ApiUnit[]> {

        let units = await UnitDbService.getUnits();
        let allocations = await UnitAssetAllocationDbService.getUnitAssetAllocations();

        // Filter on base properties
        if (unitName) {
            units = units.filter(
                (p) => {
                    const name = p.name?.toLowerCase();
                    return name.includes(unitName.toLowerCase());
                });
        }
        //remove duplicates
        units = units.filter(
            (unit, index, self) => 
                index === self.findIndex((p) => (
                    p.id === unit.id
                ))
        );

        // Augment the base properties with asset allocation information
        let result = await Promise.all(units.map((p) => this.getApiUnit(p, allocations)));

        // Filter on augmented properties
        if (result && assetName) {
            result = result.filter(
                (p) => {
                    const name = assetName.toLowerCase();
                    return p.assets.find((n) => n.name.toLowerCase().includes(name));
                });
        };

        return result;
    }

    // Augment a unit to get an ApiUnit
    async getApiUnit(unit: Unit, allocations: UnitAssetAllocation[]): Promise<ApiUnit> {

        const result = unit as ApiUnit;
        allocations = allocations.filter((a) => a.unitId === unit.id);

        result.assets = [];

        for (let allocation of allocations) {
            const asset = await AssetDbService.getAssetById(allocation.assetId);
            result.assets.push({
                id: asset.id,
                name: asset.name,
                description: asset.description,
                acquisitionDate: asset.acquisitionDate,
                status: asset.status,
                photoUrl: asset.photoUrl,
                tickets: []
            });
        }
        return result;
    }

    async addAssetToUnit(unitName: string, assetName: string): Promise<ApiAddAssetToUnitResponse> {
        let units = await this.getApiUnits(unitName, "");
        let assets = await AssetApiService.getApiAssets(assetName);

        if (units.length === 0) {
            throw new HttpError(404, `Unit not found: ${unitName}`);
        } else if (units.length > 1) {
            throw new HttpError(406, `Multiple units found with the name: ${unitName}`);
        } else if (assets.length === 0) {
            throw new HttpError(404, `Asset not found: ${assetName}`);
        } else if (assets.length > 1) {
            throw new HttpError(406, `Multiple assignments found with the name: ${assetName}`);
        }
        const unit = units[0];
        const asset = assets[0];

        const success = await UnitAssetAllocationDbService.addAssetToUnit(unit.id, asset.id);
        const message = `Added asset ${asset.name} to unit ${unit.name}`;

        return {
            unitName: unit.name,
            assetName: assets[0].name,
            message
        }
    }
}

export default new UnitApiService();
