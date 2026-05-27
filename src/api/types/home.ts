export interface IWaybillTrendStatistics {
  timeArr: string[];
  deliveredWaybills: number[];
  canceledWaybills: number[];
  abnormalWaybills: number[];
}

export interface ITruckTypeYearItem {
  name: string;
  num: number;
}
