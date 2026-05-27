import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import { IChangePassword, IVendorId } from './types/user';

export const changePassword = (
  params: IChangePassword,
): RequestPromise<any> => {
  return request(`/api/vendor-portal/user/change-password`, {
    method: 'post',
    data: params,
  });
};

export const getUserInfo = (): RequestPromise<UserInfo> => {
  return request(`/api/vendor-portal/user/info`, {
    method: 'get',
    // skipErrorHandler: true,
  });
};

export const changeLastSelection = (params: IVendorId): RequestPromise<any> => {
  return request(`/api/vendor-portal/user/change-last-selection`, {
    method: 'post',
    data: params,
  });
};
