import {
  EnumAccredType,
  EnumVendorAccredStatus,
  OwnershipStatusEnum,
  VendorTruckCodingDayEnum,
  VendorTruckVanTypeEnum,
  VendorTypeEnum,
} from '@/enums';

export interface IAccredListPaylod {
  pageNum?: number;
  pageSize?: number;
  statusList?: EnumVendorAccredStatus[];
  typeList?: EnumAccredType[];
  objectName?: string;
  updatedAtStart?: string;
  updatedAtEnd?: string;
}

export interface IAccredListItem {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  number: string;
  status: EnumVendorAccredStatus;
  type: EnumAccredType;
  vendorId: number;
  objectId: number;
  objectName: string;
  countryId: number;
  deleted: boolean;
}

export interface IAccredDocumentItem {
  fileCategory: string;
  subFileCategory?: string;
  validDateStart?: string;
  validDateEnd?: string;
  validIndefinitely?: boolean;
  materialIdList?: number[];
}

export interface IAccredTruckInfo {
  plateNumber: string;
  truckType: number;
  vanType?: VendorTruckVanTypeEnum;
  registrationNumber?: string;
  grossCapacity?: number;
  netCapacity?: number;
  volume?: number;
  model?: string;
  vendorId?: number;
  codingDay?: VendorTruckCodingDayEnum;
  ownership?: OwnershipStatusEnum;
  documentList?: IAccredDocumentItem[];
  truckId?: number;
}

export interface IAccredTruckUpdateDraftPayload {
  accredId: number;
  accredTruckId: number;
  plateNumber: string;
  truckType: number;
  vanType?: VendorTruckVanTypeEnum;
  registrationNumber?: string;
  grossCapacity?: number;
  netCapacity?: number;
  volume?: number;
  model?: string;
  vendorId?: number;
  codingDay?: VendorTruckCodingDayEnum;
  ownership?: OwnershipStatusEnum;
}

export interface IAccreditationMaterialItem {
  fileAccreditationId: number;
  fileMaterialId: number;
  fileDriveId: string;
  fileName: string;
  fileType: string;
  fileMimeType: string;
  fileThumbnailUrl: string;
}

export interface IAccreditationCategoryItem {
  categoryAccreditationId: number;
  categoryMaterialId: number;
  fileCategory: string;
  subFileCategory?: string;
  defaultCategory: boolean;
  required: boolean;
  validDateStart: string;
  validDateEnd: string;
  validIndefinitely: boolean;
  accreditationMaterialList: IAccreditationMaterialItem[];
  id: string;
}

export interface IAccredTruckDetail {
  id: number;
  number: string;
  status: EnumVendorAccredStatus;
  type: EnumAccredType;
  objectName: string;
  rejectReason: string;
  updatedAt: string;
  accreditationCategoryList: IAccreditationCategoryItem[];
  accredTruckId: number;
  plateNumber: string;
  truckType: number;
  truckTypeName: string;
  vanType: VendorTruckVanTypeEnum;
  registrationNumber: string;
  grossCapacity: number;
  netCapacity: number;
  volume: number;
  codingDay: string;
  model: string;
  ownership: string;
}

export interface IAccredVendorInfo {
  pad: number;
  sad?: number;
  tad?: number;
  vendorType: VendorTypeEnum;
  documentList?: IAccredDocumentItem[];
}

export interface IAccredVendorUpdateDraftPayload {
  accredId: number;
  accredVendorId?: number;
  pad: number;
  sad?: number;
  tad?: number;
  vendorType: VendorTypeEnum;
}

export interface IAccredVendorDetail {
  id: number;
  number: string;
  status: EnumVendorAccredStatus;
  type: EnumAccredType;
  objectName: string;
  rejectReason: string;
  updatedAt: string;
  accreditationCategoryList: IAccreditationCategoryItem[];
  accredVendorId: number;
  countryName: string;
  pad: number;
  padName: string;
  sad: number;
  sadName: string;
  tad: number;
  tadName: string;
}

export interface IAccredCrewPayload {
  name: string;
  driverFlag: boolean;
  helperFlag: boolean;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber?: string;
  documentList?: IAccredDocumentItem[];
  vendorId?: number;
  crewId?: number;
}

export interface IAccredCrewUpdateDraftPayload {
  accredId: number;
  accredCrewId: number;
  name: string;
  driverFlag: boolean;
  helperFlag: boolean;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber?: string;
}

export interface IAccredCrewDetail {
  id: number;
  name: string;
  number: string;
  status: EnumVendorAccredStatus;
  type: EnumAccredType;
  objectName: string;
  rejectReason: string;
  updatedAt: string;
  driverFlag: boolean;
  helperFlag: boolean;
  idNumber: string;
  phoneCode: string;
  phoneCodeId: number;
  phoneNum: string;
  licenseNumber: string;
  accreditationCategoryList: IAccreditationCategoryItem[];
  accredCrewId: number;
}

export interface IAccredMaterialUpdatePayload extends IAccredDocumentItem {
  id: number;
}
