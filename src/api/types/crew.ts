import {
  CrewStatusEnum,
  EnumTransportationStatus,
  VendorTruckStatusEnum,
} from '@/enums';
import { IAccreditationCategoryItem } from './accred';

export interface ICrewListPayload {
  pageNum?: number;
  pageSize?: number;
  id?: number;
  name?: string;
  driverFlag?: boolean;
  helperFlag?: boolean;
  statusList?: VendorTruckStatusEnum[];
  transportationStatusList?: EnumTransportationStatus[];
  phoneCodeId?: number;
  phoneNum?: string;
  licenseNumber?: string;
  vendorId?: number;
  updatedTimeStart?: string;
  updatedTimeEnd?: string;
  validityPeriodFrom?: number;
  validityPeriodTo?: number;
}

export interface ICrewListItemVendorItem {
  vendorId: number;
  vendorName: string;
  vendorTag: string;
}

export interface ICrewListItem {
  id: number;
  name: string;
  driverFlag: true;
  helperFlag: true;
  status: VendorTruckStatusEnum;
  transportationStatus: EnumTransportationStatus;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber: string;
  validityPeriod: number;
  updatedAt: string;
  vendorList: ICrewListItemVendorItem[];
}

export interface ICrewDetail {
  id: number;
  name: string;
  driverFlag: true;
  helperFlag: true;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber: string;
  accreditationCategoryList: IAccreditationCategoryItem[];
  status: CrewStatusEnum;
  blockReason: string;
  transportationStatus: EnumTransportationStatus;
  //   validityPeriod: number;
  updatedAt: string;
}
