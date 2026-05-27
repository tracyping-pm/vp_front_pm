import { RequestPromise } from '@/api/types/common';
import {
  IDestinationInTransitItem,
  ILatesExportRecord,
  IListAllShippingRecordPayload,
  IListShippingRecordResp,
  ILocationRecord,
  IRouteInTransitItem,
  IShippingRecordItem,
  ISpecificWaybillInfo,
  IWaybillBasicInfoResp,
  IWaybillListFee,
  IWaybillListItem,
  IWaybillListPayload,
  IWaybillListPodResp,
  IWaybillRouteResp,
  IWaybillStatisticsTotalQuantityResp,
} from '@/api/types/waybill';
import { FILE_UPLOAD_TIMEOUT } from '@/constants';
import { request } from '@umijs/max';

export const waybillRoute = (params: {
  id: number;
}): RequestPromise<IWaybillRouteResp> => {
  return request(`/api/vendor-portal/waybill/route`, {
    method: 'post',
    data: params,
  });
};

export const waybillList = (
  params: IWaybillListPayload,
): RequestPromise<PaginationResponse<IWaybillListItem>> => {
  return request(`/api/vendor-portal/waybill/list`, {
    method: 'post',
    data: params,
  });
};

export const waybillListShippingRecord = (params: {
  waybillId: number;
  plateNumber: string;
  hasGps: 0 | 1;
}): RequestPromise<IListShippingRecordResp> => {
  return request(`/api/vendor-portal/waybill/listShippingRecord`, {
    method: 'post',
    data: params,
  });
};

export const waybillListPod = (params: {
  id: number;
}): RequestPromise<IWaybillListPodResp> => {
  return request(`/api/vendor-portal/waybill/listPod`, {
    method: 'post',
    data: params,
  });
};

export const waybillEditPod = (params: FormData): RequestPromise<null> => {
  return request(`/api/vendor-portal/waybill/editPod`, {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const waybillBasicInfo = (params: {
  id: number;
}): RequestPromise<IWaybillBasicInfoResp> => {
  return request(`/api/vendor-portal/waybill/basicInfo`, {
    method: 'post',
    data: params,
  });
};

export const waybillFeeDetail = (params: {
  id: number;
}): RequestPromise<IWaybillListFee> => {
  return request('/api/vendor-portal/waybill/listFee', {
    method: 'post',
    data: params,
  });
};
export const CheckExportWaybill = (params: {
  ids: number[];
}): RequestPromise<{ code: number; remainCount: number }> => {
  return request('/api/vendor-portal/waybill/checkExportWaybill', {
    method: 'post',
    data: params,
  });
};
// 下载
export const ExportWaybill = (params: {
  ids: number[];
}): RequestPromise<null> => {
  return request('/api/vendor-portal/waybill/exportWaybill', {
    method: 'post',
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};
// 查看最近五条数据
export const LatestExportRecord = (): RequestPromise<ILatesExportRecord[]> => {
  return request('/api/vendor-portal/waybill/latestExportRecord', {
    method: 'post',
    data: {},
  });
};
// 点击列表下载
export const DownloadExport = (params: {
  id: number;
  spreadsheetId: string;
}): RequestPromise<string> => {
  return request('/api/vendor-portal/waybill/downloadExport', {
    method: 'post',
    data: params,
  });
};

export const waybillPod = (params: FormData): RequestPromise<null> => {
  return request('/api/vendor-portal/waybill/editPod', {
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: params,
    timeout: FILE_UPLOAD_TIMEOUT,
  });
};

export const getWaybillStatisticsTotalQuantity =
  (): RequestPromise<IWaybillStatisticsTotalQuantityResp> => {
    return request(`/api/vendor-portal/statistic/total-quantity`, {
      method: 'get',
    });
  };

export const listAllLocation = (): RequestPromise<ILocationRecord[]> => {
  return request(`/api/vendor-portal/statistic/listAllLocation`, {
    method: 'post',
  });
};

export const listSpecificWaybillInfo = (params: {
  id: number;
}): RequestPromise<ISpecificWaybillInfo> => {
  return request(`/api/vendor-portal/statistic/listSpecificWaybillInfo`, {
    method: 'post',
    data: params,
  });
};

export const getMapJsonStr = (params: {
  id: number;
}): RequestPromise<string> => {
  return request(`/api/vendor-portal/statistic/listMapJsonStr`, {
    method: 'post',
    data: params,
  });
};

export const listAllShippingRecord = (
  params: IListAllShippingRecordPayload,
): RequestPromise<PaginationResponse<IShippingRecordItem>> => {
  return request(`/api/vendor-portal/waybill/listAllShippingRecord`, {
    method: 'post',
    data: params,
  });
};

export const waybillDeletePod = (params: {
  waybillId: number;
  deletedFileMaterialIdList: number[];
}): RequestPromise<null> => {
  return request(`/api/vendor-portal/waybill/deletePod`, {
    method: 'post',
    data: params,
  });
};

export const getRouteInTransitDetail = (params: {
  ids: number[];
}): RequestPromise<IRouteInTransitItem[]> => {
  return request(`/api/vendor-portal/waybill/getRouteInTransitDetail`, {
    method: 'post',
    data: params,
  });
};

export const getDestinationInTransit = (): RequestPromise<
  IDestinationInTransitItem[]
> => {
  return request(`/api/vendor-portal/waybill/getDestinationInTransit`, {
    method: 'post',
  });
};
