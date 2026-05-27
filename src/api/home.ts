import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import { ITruckTypeYearItem, IWaybillTrendStatistics } from './types/home';

export const getWaybillTrendStatistics = (params: {
  startDate: string;
  endDate: string;
}): RequestPromise<IWaybillTrendStatistics> => {
  return request(`/api/vendor-portal/statistic/waybill-trend`, {
    method: 'post',
    data: params,
  });
};

export const getTruckTypeYear = (): RequestPromise<ITruckTypeYearItem[]> => {
  return request(`/api/vendor-portal/statistic/truckType/year`, {
    method: 'get',
  });
};
