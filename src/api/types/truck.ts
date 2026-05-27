import {
  EnumTransportationStatus,
  OwnershipStatusEnum,
  VendorTruckCodingDayEnum,
  VendorTruckStatusEnum,
  VendorTruckVanTypeEnum,
} from '@/enums';
import { IAccreditationCategoryItem } from './accred';

export interface ITruckParams {
  pageNum?: number;
  pageSize?: number;
  plateNumber?: string;
  truckType?: number;
  ownership?: OwnershipStatusEnum;
  status?: VendorTruckStatusEnum;
  transportationStatus?: EnumTransportationStatus;
  updatedAtStart?: string;
  updatedAtEnd?: string;
  validityPeriodFrom?: number;
  validityPeriodTo?: number;
}

export interface ITruckListItem {
  id: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  vanType: VendorTruckVanTypeEnum;
  registrationNumber: number;
  grossCapacity: number;
  netCapacity: number;
  volume: number;
  model: string;
  status: VendorTruckStatusEnum;
  transportationStatus: EnumTransportationStatus;
  ownership: OwnershipStatusEnum;
  updatedAt: string;
  validityPeriod: number;
}
export interface ITruckTypeListItem {
  country: number;
  deleted: number;
  id: number;
  name: string;
}

export interface ITruckDetail {
  id: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  vanType: VendorTruckVanTypeEnum;
  status: VendorTruckStatusEnum;
  transportationStatus: EnumTransportationStatus;
  registrationNumber: string;
  grossCapacity: number;
  netCapacity: number;
  volume: number;
  model: string;
  codingDay: VendorTruckCodingDayEnum;
  ownership: OwnershipStatusEnum;
  updatedAt: string;
  accreditationCategoryList: IAccreditationCategoryItem[];
}

export interface IDefaultCategory {
  id: string;
  fileCategory: string;
  required: boolean;
}
