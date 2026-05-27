import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import { IVendorDetail } from './types/vendor';

export const getVendorDetail = (): RequestPromise<IVendorDetail> => {
  return request(`/api/vendor-portal/vendor/detail`, {
    method: 'get',
  });
};

export const getVendorDefaultSubCategory = (): RequestPromise<string[]> => {
  return request(`/api/vendor-portal/vendor/default-sub-category`, {
    method: 'get',
  });
};
