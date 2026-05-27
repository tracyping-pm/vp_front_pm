import { RequestPromise } from '@/api/types/common';
import { request } from '@umijs/max';
import { IAccredCrewDetail } from './types/accred';
import { ICrewDetail, ICrewListItem, ICrewListPayload } from './types/crew';
import { IDefaultCategory } from './types/truck';
export const getCrewDefaultCategory = (params: {
  driverFlag: boolean;
}): RequestPromise<IDefaultCategory> => {
  return request(
    `/api/vendor-portal/crew/default-category?driverFlag=${params.driverFlag}`,
    {
      method: 'get',
    },
  );
};

export const queryCrewDetailByIdNumber = (params: {
  idNumber: string;
}): RequestPromise<IAccredCrewDetail> => {
  return request(
    `/api/vendor-portal/crew/query-id-number?idNumber=${params.idNumber}`,
    {
      method: 'post',
    },
  );
};

export const crewList = (
  params: ICrewListPayload,
): RequestPromise<PaginationResponse<ICrewListItem[]>> => {
  return request(`/api/vendor-portal/crew/list`, {
    method: 'post',
    data: params,
  });
};

export const crewDetail = (params: {
  id: number;
}): RequestPromise<ICrewDetail> => {
  return request(`/api/vendor-portal/crew/detail`, {
    method: 'post',
    data: params,
  });
};
