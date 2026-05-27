import Cookie from 'js-cookie';
import { TOKEN_KEY } from '@/constants';

const LOCAL_DEV_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
export const LOCAL_DEV_TOKEN = 'local-dev-token';

export const isLocalDevHost = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return LOCAL_DEV_HOSTS.has(window.location.hostname);
};

export const ensureLocalDevCookie = () => {
  if (!isLocalDevHost()) {
    return;
  }

  if (!Cookie.get(TOKEN_KEY)) {
    Cookie.set(TOKEN_KEY, LOCAL_DEV_TOKEN, {
      expires: 7,
      sameSite: 'Lax',
    });
  }
};
