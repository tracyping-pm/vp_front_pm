import { EnumNewsType } from '@/enums';
import { request } from '@umijs/max';
import { RequestPromise } from './types/common';
import { INewsRes, IUnReadNewsRes } from './types/news';

export const msgList = (params: {
  pageNum: number;
  pageSize: number;
  type: EnumNewsType;
}): RequestPromise<INewsRes> => {
  return request(`/api/vendor-portal/msg/list`, {
    method: 'post',
    data: params,
  });
};

export const msgRead = (params: { id: number }): RequestPromise<null> => {
  return request(`/api/vendor-portal/msg/read`, {
    method: 'post',
    data: params,
  });
};

export const msgUnreadCount = (): RequestPromise<IUnReadNewsRes> => {
  return request(`/api/vendor-portal/msg/unreadCount`, {
    method: 'get',
  });
};

export const msgReadAll = (): RequestPromise<null> => {
  return request(`/api/vendor-portal/msg/readAll`, {
    method: 'get',
  });
};
