export enum AccountStatusEnum {
  INACTIVE = 'Inactive',
  ACTIVATED = 'Activated',
  SUSPENDED = 'Suspended',
}

export const AccountStatusEnumText = {
  [AccountStatusEnum.INACTIVE]: 'Inactive',
  [AccountStatusEnum.ACTIVATED]: 'Activated',
  [AccountStatusEnum.SUSPENDED]: 'Suspended',
};

export const AccountStatusEnumColor = {
  [AccountStatusEnum.INACTIVE]: '#B9B9B9',
  [AccountStatusEnum.ACTIVATED]: '#52C41A',
  [AccountStatusEnum.SUSPENDED]: '#F28532',
};

export enum CountryMapEnum {
  Philippines = 1,
  Thailand,
}

// https://inteluck.atlassian.net/wiki/spaces/CPT/pages/458686502#3%EF%BC%89Region
export const CountryEnumLabelListMap = {
  [CountryMapEnum.Philippines]: [
    'Country',
    'Region',
    'Province',
    'Municipality/City',
  ],
  [CountryMapEnum.Thailand]: ['Country', 'Changwat', 'Amphoe', 'Tambon'],
};

export enum DataPermissionTypeEnum {
  SelfAndSubordinates = 'SelfAndSubordinates',
  Department = 'Department',
  DepartmentAndSubordinateDepartments = 'DepartmentAndSubordinateDepartments',
  CompanyWide = 'CompanyWide',
}

export const DataPermissionTypeEnumToText = {
  [DataPermissionTypeEnum.SelfAndSubordinates]: 'Self And Subordinates',
  [DataPermissionTypeEnum.Department]: 'Department',
  [DataPermissionTypeEnum.DepartmentAndSubordinateDepartments]:
    'Department And Subordinate Departments',
  [DataPermissionTypeEnum.CompanyWide]: 'CompanyWide',
};

export enum FieldQueryHighlightTypeEnum {
  COUNTRY = 'Country',
  ONLY_COUNTRY = 'OnlyCountry',
  USER_ROLE = 'UserRole',
  VENDOR_PORTAL = 'VendorPortal',
  ALL = 'All',
  None = 'None',
  VENDOR = 'Vendor',
}

export enum FieldQueryHighlightUniqueLogicEnum {
  WITH_PROJECT_CUSTOMER_TAG = 1,
  CAPACITY_POOL_VENDOR_DISABLED,
  CREATE_CONTRACT_VNEDOR_CHOOSE,
  CAPACITY_POOL_TRUCKS_PLATE_NUMBER,
  CP_VP_INTERNAL_TAG,
}

export enum RouteBillingModeEnum {
  ROUTE_BILLING = 'Route Pricing(By Route)',
  MILEAGE_BILLING = 'Mileage Pricing(By Distance)',
}

export const RouteBillingModeEnumText = {
  [RouteBillingModeEnum.ROUTE_BILLING]: 'Route Pricing(By Route)',
  [RouteBillingModeEnum.MILEAGE_BILLING]: 'Mileage Pricing(By Distance)',
};

export const CountryCurrencyEnumText: Record<any, string> = {
  1: '₱',
  2: '฿',
};

export const CountryRegionNameText: Record<any, string[]> = {
  1: ['Region', 'Province', 'Municipality/City'],
  2: ['Changwat', 'Amphoe', 'Tambon'],
};

export enum WaybillDispatchTypeEnum {
  STANDARD_DISPATCH = 'Standard Dispatch',
  TEMPORARY_DISPATCH = 'Temporary Dispatch',
}

export const WaybillDispatchTypeEnumText = {
  [WaybillDispatchTypeEnum.STANDARD_DISPATCH]: 'Standard Dispatch',
  [WaybillDispatchTypeEnum.TEMPORARY_DISPATCH]: 'Temporary Dispatch',
};

export enum WaybillStatusEnum {
  PLANNING = 'Planning',
  PENDING = 'Pending',
  IN_TRANSIT = 'In Transit',
  ABNORMAL = 'Abnormal',
  CANCELED = 'Canceled',
  DELIVERED = 'Delivered',
  COMPLETED = 'Completed',
}

export const WaybillStatusEnumText = {
  // [WaybillStatusEnum.PLANNING]: 'Planning',
  [WaybillStatusEnum.PENDING]: 'Pending',
  [WaybillStatusEnum.IN_TRANSIT]: 'In Transit',
  [WaybillStatusEnum.ABNORMAL]: 'Abnormal',
  [WaybillStatusEnum.CANCELED]: 'Canceled',
  [WaybillStatusEnum.DELIVERED]: 'Delivered',
  [WaybillStatusEnum.COMPLETED]: 'Completed',
};

export const SHOW_WAYBILL_POD = [
  WaybillStatusEnum.IN_TRANSIT,
  WaybillStatusEnum.DELIVERED,
  WaybillStatusEnum.COMPLETED,
];

export const WaybillStatusEnumIcon: Record<any, string> = {
  [WaybillStatusEnum.PLANNING]: '#CACACA',
  [WaybillStatusEnum.PENDING]: '#183C9A',
  [WaybillStatusEnum.IN_TRANSIT]: '#009688',
  [WaybillStatusEnum.ABNORMAL]: '#CACACA',
  [WaybillStatusEnum.CANCELED]: '#E73030',
  [WaybillStatusEnum.DELIVERED]: '#4285F4',
  [WaybillStatusEnum.COMPLETED]: '#52C41A',
};

export const WaybillStatusEnumTextColor = {
  [WaybillStatusEnum.PLANNING]: '#722ED1',
  [WaybillStatusEnum.PENDING]: '#009688',
  [WaybillStatusEnum.IN_TRANSIT]: '#13C2C2',
  [WaybillStatusEnum.ABNORMAL]: '#F5222D ',
  [WaybillStatusEnum.CANCELED]: '#CACACA ',
  [WaybillStatusEnum.DELIVERED]: '#2F54EB',
  [WaybillStatusEnum.COMPLETED]: '#52C41A',
};

export enum WaybillReasonEnum {
  NULL = '',
  CANCEL = 'cancel',
  ABNORMAL = 'abnormal',
}

export const SHOW_MANAGE_POD = [
  WaybillStatusEnum.IN_TRANSIT,
  WaybillStatusEnum.DELIVERED,
  WaybillStatusEnum.COMPLETED,
];

export const SHOW_POD_CARD = [
  WaybillStatusEnum.DELIVERED,
  WaybillStatusEnum.COMPLETED,
  WaybillStatusEnum.CANCELED,
];

export const CANCEL_SHOW_POD = [
  WaybillStatusEnum.PENDING,
  WaybillStatusEnum.IN_TRANSIT,
];

export const SHOW_BILLING_EDIT = [
  WaybillStatusEnum.PLANNING,
  WaybillStatusEnum.PENDING,
  WaybillStatusEnum.IN_TRANSIT,
  WaybillStatusEnum.DELIVERED,
];

export enum VendorTruckStatusEnum {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited',
  INACTIVE = 'Inactive',
  // INUSE = 'In Use',
  // OUTOfUSE = 'Out of Use',
}

export const VendorTruckStatusEnumText = {
  [VendorTruckStatusEnum.UNACCREDITED]: 'Unaccredited',
  [VendorTruckStatusEnum.ACCREDITED]: 'Accredited',
  [VendorTruckStatusEnum.INACTIVE]: 'Inactive',
  // [VendorTruckStatusEnum.INUSE]: 'In Use',
  // [VendorTruckStatusEnum.OUTOfUSE]: 'Out of Use',
};

export enum VendorTruckStatusView {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited & available',
  INUSE = 'In transit',
  OUTOfUSE = 'Unavailable',
}

export const VendorTruckStatusViewEnumText = {
  [VendorTruckStatusEnum.UNACCREDITED]: 'Unaccredited',
  [VendorTruckStatusEnum.ACCREDITED]: 'Accredited & available',
  // [VendorTruckStatusEnum.INUSE]: 'In transit',
  // [VendorTruckStatusEnum.OUTOfUSE]: 'Unavailable',
};

export enum OwnershipStatusEnum {
  OWNEDTRUCK = 'Owned Truck',
  NONOWNEDTRUCK = 'Non-Owned Truck',
}

export const OwnershipStatusEnumText = {
  [OwnershipStatusEnum.OWNEDTRUCK]: 'Owned Truck',
  [OwnershipStatusEnum.NONOWNEDTRUCK]: 'Non-Owned Truck',
};

export const VendorTruckStatusEnumColor = {
  [VendorTruckStatusEnum.UNACCREDITED]: '#2F54EB',
  [VendorTruckStatusEnum.ACCREDITED]: '#52C41A',
  [VendorTruckStatusEnum.INACTIVE]: '#FF4D4F',
  // [VendorTruckStatusEnum.INUSE]: '#009688',
  // [VendorTruckStatusEnum.OUTOfUSE]: '#FF4D4F',
};

export enum CrewStatusEnum {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited',
  INACTIVE = 'Inactive',
  BLOCKED = 'Blocked',
}

export const CrewStatusEnumText = {
  [CrewStatusEnum.UNACCREDITED]: 'Unaccredited',
  [CrewStatusEnum.ACCREDITED]: 'Accredited',
  [CrewStatusEnum.INACTIVE]: 'Inactive',
  [CrewStatusEnum.BLOCKED]: 'Blocked',
};

export const CrewStatusEnumColor = {
  [CrewStatusEnum.UNACCREDITED]: '#2F54EB',
  [CrewStatusEnum.ACCREDITED]: '#52C41A',
  [CrewStatusEnum.INACTIVE]: '#FF4D4F',
  [CrewStatusEnum.BLOCKED]: '#D9D9D9',
};

export enum CustomerSizeEnum {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  GIANT = 'Giant',
}

export const CustomerSizeEnumText = {
  [CustomerSizeEnum.SMALL]: 'Small',
  [CustomerSizeEnum.MEDIUM]: 'Medium',
  [CustomerSizeEnum.LARGE]: 'Large',
  [CustomerSizeEnum.GIANT]: 'Giant',
};

export enum VendorDriveStatusEnum {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited',
  BLOCKED = 'Blocked',
}

export const VendorDriveStatusEnumText = {
  [VendorDriveStatusEnum.UNACCREDITED]: 'Unaccredited',
  [VendorDriveStatusEnum.ACCREDITED]: 'Accredited',
  [VendorDriveStatusEnum.BLOCKED]: 'Blocked',
};

export const VendorDriveStatusEnumColor = {
  [VendorDriveStatusEnum.UNACCREDITED]: '#F28532',
  [VendorDriveStatusEnum.ACCREDITED]: '#52C41A',
  [VendorDriveStatusEnum.BLOCKED]: '#FF4D4F',
};

export enum VendorHelperStatusEnum {
  NORMAL = 'Normal',
  BLOCKED = 'Blocked',
}

export const VendorHelperStatusEnumText = {
  [VendorHelperStatusEnum.NORMAL]: 'Normal',
  [VendorHelperStatusEnum.BLOCKED]: 'Blocked',
};

export const VendorHelperStatusEnumColor = {
  [VendorHelperStatusEnum.NORMAL]: '#52C41A',
  [VendorHelperStatusEnum.BLOCKED]: '#FF4D4F',
};

export enum DownLoadStatusEnum {
  COMPLETED = 'Completed',
  EXPORTING = 'Exporting',
  EXCEPTION = 'Exception',
}

export enum EnumVendorAccreditationStatus {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited',
  BLOCKED = 'Blocked',
  TERMINATED = 'Terminated',
}

export const EnumVendorAccreditationStatusColor = {
  [EnumVendorAccreditationStatus.UNACCREDITED]: '#2F54EB',
  [EnumVendorAccreditationStatus.ACCREDITED]: '#52C41A',
  [EnumVendorAccreditationStatus.BLOCKED]: '#FF4D4F',
  [EnumVendorAccreditationStatus.TERMINATED]: '#FF4D4F',
};

export enum EnumVendorAccredStatus {
  START = 'start',
  DRAFT = 'draft',
  UNDER_REVIEW = 'underReview',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const EnumVendorAccredStatusText = {
  [EnumVendorAccredStatus.START]: 'Start',
  [EnumVendorAccredStatus.DRAFT]: 'Draft',
  [EnumVendorAccredStatus.UNDER_REVIEW]: 'Under Review',
  [EnumVendorAccredStatus.APPROVED]: 'Approved',
  [EnumVendorAccredStatus.REJECTED]: 'Rejected',
};

export const EnumVendorAccredNoStartStatusText = {
  [EnumVendorAccredStatus.DRAFT]: 'Draft',
  [EnumVendorAccredStatus.UNDER_REVIEW]: 'Under Review',
  [EnumVendorAccredStatus.APPROVED]: 'Approved',
  [EnumVendorAccredStatus.REJECTED]: 'Rejected',
};

export const EnumVendorAccredStatusTextColor = {
  [EnumVendorAccredStatus.START]: '#2F54EB',
  [EnumVendorAccredStatus.DRAFT]: '#2F54EB',
  [EnumVendorAccredStatus.UNDER_REVIEW]: '#009688',
  [EnumVendorAccredStatus.APPROVED]: '#52C41A',
  [EnumVendorAccredStatus.REJECTED]: '#FF4D4F',
};

export enum EnumAccredType {
  VENDOR = 'Vendor',
  TRUCK = 'Truck',
  CREW = 'Crew',
}

export const EnumAccredTypeText = {
  [EnumAccredType.VENDOR]: 'Vendor',
  [EnumAccredType.TRUCK]: 'Truck',
  [EnumAccredType.CREW]: 'Crew',
};

export enum EnumAccredCrewType {
  MODIFY = 'MODIFY',
  NEW = 'NEW',
}

export const EnumAccredCrewTypeText = {
  [EnumAccredCrewType.MODIFY]: 'Modify',
  [EnumAccredCrewType.NEW]: 'Add a New',
};

export enum VendorTruckVanTypeEnum {
  DRY = 'Dry',
  REEFER = 'Reefer',
}

export const VendorTruckVanTypeEnumText = {
  [VendorTruckVanTypeEnum.DRY]: 'Dry',
  [VendorTruckVanTypeEnum.REEFER]: 'Reefer',
};

export enum VendorTruckCodingDayEnum {
  NA = 'NA',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export const VendorTruckCodingDayEnumText = {
  [VendorTruckCodingDayEnum.NA]: 'NA',
  [VendorTruckCodingDayEnum.MONDAY]: 'Monday',
  [VendorTruckCodingDayEnum.TUESDAY]: 'Tuesday',
  [VendorTruckCodingDayEnum.WEDNESDAY]: 'Wednesday',
  [VendorTruckCodingDayEnum.THURSDAY]: 'Thursday',
  [VendorTruckCodingDayEnum.FRIDAY]: 'Friday',
  [VendorTruckCodingDayEnum.SATURDAY]: 'Saturday',
  [VendorTruckCodingDayEnum.SUNDAY]: 'Sunday',
};

export enum UploadPathTypeEnum {
  TRANSMITTAL = 'TRANSMITTAL',
  WAYBILL_POD = 'WAYBILL_POD',
  LEAD_LOGO = 'LEAD_LOGO',
  OPPORTUNITY_FOLLOW_UP = 'OPPORTUNITY_FOLLOW_UP',
  STATEMENT_RECEIPT = 'STATEMENT_RECEIPT',
  STATEMENT_PROOF = 'STATEMENT_PROOF',
  STATEMENT_INVOICE = 'STATEMENT_INVOICE',
  CONTRACT = 'CONTRACT',
  SUBTASK = 'SUBTASK',
  VENDOR = 'VENDOR',
  TRUCK = 'TRUCK',
  CREW = 'CREW',
}

export enum VendorTypeEnum {
  CORPORATE = 'Corporate',
  INDIVIDUAL = 'Individual',
}

export const VendorTypeEnumText = {
  [VendorTypeEnum.CORPORATE]: 'Corporate',
  [VendorTypeEnum.INDIVIDUAL]: 'Individual',
};

export interface IPhoneSelectOptionsItem {
  label: string;
  show: string;
  value: number;
}

export enum EnumTransportationStatus {
  TRANSIT = 'Transit',
  AVAILABLE = 'Available',
}

export const EnumTransportationStatusText = {
  [EnumTransportationStatus.TRANSIT]: 'Transit',
  [EnumTransportationStatus.AVAILABLE]: 'Available',
};

export const EnumTransportationStatusColor = {
  [EnumTransportationStatus.TRANSIT]: '#52C41A',
  [EnumTransportationStatus.AVAILABLE]: '#009688',
};

export enum EnumNewsType {
  Application = 'Application',
  Expiration = 'Expiration',
}
