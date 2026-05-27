import { VendorTypeEnum } from '@/enums';
import { IAccreditationCategoryItem } from './accred';

export interface IVendorDetail {
  vendorName: string;
  vendorType: VendorTypeEnum;
  countryName: string;
  pad: number;
  padName: string;
  sad: number;
  sadName: string;
  tad: number;
  tadName: string;
  accreditationCategoryList: IAccreditationCategoryItem[];
}
