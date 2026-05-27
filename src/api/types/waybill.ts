import { WaybillStatusEnum } from '@/enums';
import { ICommonMaterial } from './common';

export interface IHelperItem {
  id: number;
  helperName: string;
  helperPhoneNumber: string;
}

export interface IWaybillBasicInfoResp {
  id: number;
  status: WaybillStatusEnum;
  preStatus: WaybillStatusEnum | null;
  positionTime: string;
  completionTime: string;
  createdAt: string;
  waybillNumber: string;
  customerName: string;
  dispatcherName: string;
  dispatcherId: number;
  plateNumber: string;
  truckId: number;
  driverName: string;
  driverId: number;
  helpers: IHelperItem[];
  customerCodeVos: ICustomerCodeVosItem[];
  hasGps: 0 | 1;
}

export interface IWaybillListFee {
  country: number;
  waybillId: number;
  waybillReceivableAmount: number;
  basicAmountReceivable: number;
  additionalAmountReceivable: number;
  percentageOfPaidInAdvance: number;
  percentageOfHandlingFee: number;
  percentageOfRegularPayments: number;
  amountOfPaymentAdvance: number;
  amountOfHandlingFee: number;
  amountOfRegularPayments: number;
  percentagePaymentAdvance: number;
  demurrage: number;
  addtlDrop: number;
  boomTruck: number;
  manpower: number;
  backload: number;
  other: number;
}

export interface IWaybillListPayload {
  pageNum: number;
  current: number;
  pageSize: number;
  status: WaybillStatusEnum;
  positionTimeStart: string;
  positionTimeEnd: string;
  truckId: number;
  plateNumber: number;
  driverName: string;
  customerId: number;
  customerCode: string;
  waybillId: number;
}

export interface IWaybillListItem {
  id: number;
  waybillNumber: string;
  status: WaybillStatusEnum;
  projectId: number;
  positionTime: string;
  waybillReceivableAmount: number;
  plateNumber: string;
  truckId: number;
  driverName: string;
  driverId: number;
  dispatcherName: string;
  dispatcherId: number;
  createdAt: string;
}

export interface IAddress {
  id: number;
  padId: number;
  padName: string;
  sadId: number;
  sadName: string;
  tadId: number;
  tadName: string;
  address: string;
  lat: number;
  lng: number;
  sort: number;

  [key: string]: unknown;
}

export interface IWaybillRouteResp {
  routeCode: string;
  origins: IAddress[];
  destinations: IAddress[];
}

export interface ITruckHistoryVoListItem {
  deviceDate: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
}

export interface IShippingRecordVoListItem {
  shippingRecordId: number;
  action: string;
  time: string;
  lng: number;
  lat: number;
  mapAddress: string;
}

export interface IListShippingRecordResp {
  waybillId: number;
  mapJsonStr: string;
  truckHistoryVoList: ITruckHistoryVoListItem[];
  shippingRecordVoList: IShippingRecordVoListItem[];
  callFmsFailed: boolean;
}

export interface IPodItem {
  waybillPodId: number;
  podType: string;
  description: string;
  generateType: string;
  materialVoList: ICommonMaterial[];
}

export interface IWaybillListPodResp {
  waybillId: number;
  podList: IPodItem[];
}

export interface IWaybillListFeeResp {
  waybillId: number;
  waybillReceivableAmount: number;
  basicAmountReceivable: number;
  additionalAmountReceivable: number;
  percentageOfPaidInAdvance: number;
  percentageOfHandlingFee: number;
  percentageOfRegularPayments: number;
  amountOfPaymentAdvance: number;
  amountOfHandlingFee: number;
  amountOfRegularPayments: number;
  demurrage: number;
  addtlDrop: number;
  boomTruck: number;
  manpower: number;
  backload: number;
  other: number;
}

export interface ILatesExportRecord {
  id: number;
  status: string;
  fileName: string;
  spreadsheetId: string;
}

export interface IWaybillStatisticsTotalQuantityResp {
  waybillNum: number;
  deliveredWaybillNum: number;
  truckNum: number;
  crewNum: number;
}

export interface ILocationRecord {
  waybillId: number;
  locationTime: string;
  lat: number;
  lng: number;
  mapAddress: string;
}

export interface ISpecificWaybillInfo {
  waybillId: number;
  locationTime: string;
  waybillNumber: string;
  firstOrigin: string;
  lastDestination: string;
  shippingRecordAction: string;
  lat: number;
  lng: number;
  mapAddress: string;
}

export interface IListAllShippingRecordPayload {
  pageNum: number;
  pageSize: number;
}

export interface IDestinationInTransitItem {
  lat: number;
  lng: number;
  labels: string;
  trucks: number;
  destinationAddress: string;
  waybillIds: number[];
}

export interface IShippingRecordItem {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  wayBillId: number;
  action: string;
  time: string;
  lng: number;
  lat: number;
  mapAddress: string;
  note: string;
  obtainLocationWay: string;
  deleted: boolean;
}

export interface IRouteInTransitItem {
  waybillId: number;
  originAddress: string;
  lat: number;
  lng: number;
  mapJson: string;
  plateNumber: string;
  truckLat: number;
  truckLng: number;
  shippingRecords: IShippingRecordItem[];
}

export interface ICustomerCodeVosItem {
  customerCodeId: number;
  customerCodeType: string;
  number: string;
}
