import { RequestPromise } from '@/api/types/common';
import {
  IDefaultCategory,
  ITruckDetail,
  ITruckListItem,
  ITruckParams,
  ITruckTypeListItem,
} from '@/api/types/truck';
import { request } from '@umijs/max';

export const truckList = (
  params: ITruckParams,
): RequestPromise<PaginationResponse<ITruckListItem>> => {
  return request(`/api/vendor-portal/truck/list`, {
    method: 'post',
    data: params,
  });
};

export const truckDetail = (params: {
  id: number;
}): RequestPromise<ITruckDetail> => {
  return request(`/api/vendor-portal/truck/detail`, {
    method: 'post',
    data: params,
  });
};
export const getTruckTypeList = (): RequestPromise<ITruckTypeListItem[]> => {
  return request(`/api/vendor-portal/waybill/truckType`, {
    method: 'get',
  });
};

export const getTruckDefaultCategory = (params: {
  truckTypeId: number;
}): RequestPromise<IDefaultCategory[]> => {
  return request(
    `/api/vendor-portal/truck/default-category?truckTypeId=${params.truckTypeId}`,
    {
      method: 'get',
    },
  );
};

export const queryTruckDetailByPlateNo = (params: {
  plateNumber: string;
}): RequestPromise<ITruckDetail> => {
  return request(
    `/api/vendor-portal/truck/query-plate-no?plateNumber=${params.plateNumber}`,
    {
      method: 'post',
    },
  );
};
