import { request } from '@umijs/max';
import { IEmailLogin } from './types/auth';
import { RequestPromise } from './types/common';

export const emailLogin = (params: IEmailLogin): RequestPromise<Token> => {
  return request(`/api/vendor-portal/auth/email-login`, {
    method: 'post',
    data: params,
    // skipErrorHandler: true,
  });
};

export const authLogout = (): RequestPromise<any> => {
  return request(`/api/vendor-portal/user/logout`, {
    method: 'post',
  });
};

// export const logout = () => {
//   const lang = localStorage.i18nextLng;
//   Cookie.remove(TOKEN_KEY);
//   localStorage.clear();
//   localStorage.setItem('i18nextLng', lang);
//   history.replace(PATHS.LOGIN);
// };
