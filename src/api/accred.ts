import { RequestPromise } from '@/api/types/common';
import { request } from '@umijs/max';
import {
  IAccredCrewDetail,
  IAccredCrewPayload,
  IAccredCrewUpdateDraftPayload,
  IAccredListItem,
  IAccredListPaylod,
  IAccredMaterialUpdatePayload,
  IAccredTruckDetail,
  IAccredTruckInfo,
  IAccredTruckUpdateDraftPayload,
  IAccredVendorDetail,
  IAccredVendorInfo,
  IAccredVendorUpdateDraftPayload,
} from './types/accred';

export const accredList = (
  params: IAccredListPaylod,
): RequestPromise<PaginationResponse<IAccredListItem>> => {
  return request(`/api/vendor-portal/accred/list`, {
    method: 'post',
    data: params,
  });
};

export const accredWithDraw = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/withdraw`, {
    method: 'post',
    data: params,
  });
};

export const accredSubmitDraft = (params: {
  id: number;
}): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/submit-draft`, {
    method: 'post',
    data: params,
  });
};

export const accredDelete = (params: { id: number }): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/delete`, {
    method: 'post',
    data: params,
  });
};

export const accredTruckDetail = (params: {
  id: number;
}): RequestPromise<IAccredTruckDetail> => {
  return request(`/api/vendor-portal/accred/truck/detail`, {
    method: 'post',
    data: params,
  });
};

export const accredTruckSubmit = (
  params: IAccredTruckInfo,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/truck/submit`, {
    method: 'post',
    data: params,
  });
};

export const accredTruckSaveDraft = (
  params: IAccredTruckInfo,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/truck/save-draft`, {
    method: 'post',
    data: params,
  });
};

export const accredTruckUpdateDraft = (
  params: IAccredTruckUpdateDraftPayload,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/truck/update-draft`, {
    method: 'post',
    data: params,
  });
};

export const accredVendorSubmit = (
  params: IAccredVendorInfo,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/vendor/submit`, {
    method: 'post',
    data: params,
  });
};

export const accredVendorSaveDraft = (
  params: IAccredVendorInfo,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/vendor/save-draft`, {
    method: 'post',
    data: params,
  });
};

export const accredVendorUpdateDraft = (
  params: IAccredVendorUpdateDraftPayload,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/vendor/update-draft`, {
    method: 'post',
    data: params,
  });
};

export const accredVendorDetail = (params: {
  id: number;
}): RequestPromise<IAccredVendorDetail> => {
  return request(`/api/vendor-portal/accred/vendor/detail`, {
    method: 'post',
    data: params,
  });
};

export const accredCrewSubmit = (
  params: IAccredCrewPayload,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/crew/submit`, {
    method: 'post',
    data: params,
  });
};

export const accredCrewSaveDraft = (
  params: IAccredCrewPayload,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/crew/save-draft`, {
    method: 'post',
    data: params,
  });
};

export const accredCrewUpdateDraft = (
  params: IAccredCrewUpdateDraftPayload,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/crew/update-draft`, {
    method: 'post',
    data: params,
  });
};

export const accredCrewDetail = (params: {
  id: number;
}): RequestPromise<IAccredCrewDetail> => {
  return request(`/api/vendor-portal/accred/crew/detail`, {
    method: 'post',
    data: params,
  });
};

export const accredMaterialUpdate = (
  params: IAccredMaterialUpdatePayload,
): RequestPromise<null> => {
  return request(`/api/vendor-portal/accred/material/update`, {
    method: 'post',
    data: params,
  });
};
