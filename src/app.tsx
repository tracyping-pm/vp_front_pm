// 运行时配置

import {
  AccountBookOutlined,
  ExclamationCircleFilled,
  FileTextOutlined,
  HomeOutlined,
  MoneyCollectOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import { MenuDataItem } from '@ant-design/pro-components';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Link, RequestConfig, RunTimeLayoutConfig, history } from '@umijs/max';
import 'animate.css';
import {
  App,
  Button,
  ConfigProvider,
  notification,
  message as toast,
} from 'antd';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import Cookie from 'js-cookie';
import queryString from 'query-string';
import React from 'react';
import { ReactComponent as IconCrew } from '../public/svg/menu/crew.svg';
import { ReactComponent as IconPermission } from '../public/svg/menu/permission.svg';
import { ReactComponent as IconTrucks } from '../public/svg/menu/trucks.svg';
import {
  ReactComponent as IconAccred,
  ReactComponent as IconWaybills,
} from '../public/svg/menu/waybills.svg';
import { getUserInfo } from './api/user';
import CustomErrorBoundary from './components/CustomErrorBoundary';
import PageHeader from './components/PageLayout/components/Header';
import { PATHS, TOKEN_KEY } from './constants';
import { PubSubProvider } from './context/pubsub';
import { AccountStatusEnum } from './enums';
import NoFoundPage from './pages/403';
import './theme/font.less';
import './theme/map.less';
import {
  proLayoutToken,
  tableStyleConfig,
  themeConfig,
} from './theme/themeConfig';
import { ensureLocalDevCookie, isLocalDevHost } from './utils/localDev';
import './theme/variables.less';

dayjs.extend(weekday);
dayjs.extend(localeData);
ensureLocalDevCookie();

const menuIconList = [
  {
    icon: <HomeOutlined style={{ fontSize: 16, padding: '2px' }} />,
    key: 'home',
  },
  {
    icon: <IconWaybills />,
    key: 'waybills',
  },
  {
    icon: <IconTrucks />,
    key: 'trucks',
  },
  {
    icon: <IconCrew />,
    key: 'crew',
  },
  {
    icon: <IconPermission />,
    key: 'permission',
  },
  {
    icon: <IconAccred />,
    key: 'accred',
  },
  {
    icon: <SnippetsOutlined style={{ fontSize: 16, padding: '2px' }} />,
    key: 'claim',
  },
  {
    icon: <MoneyCollectOutlined style={{ fontSize: 16, padding: '2px' }} />,
    key: 'payment',
  },
  {
    icon: <FileTextOutlined style={{ fontSize: 16, padding: '2px' }} />,
    key: 'billing',
  },
  {
    icon: <AccountBookOutlined style={{ fontSize: 16, padding: '2px' }} />,
    key: 'finance',
  },
];

console.log('🌞🌞UMI_ENV: ', UMI_ENV);
const timeout = UMI_ENV === 'dev' ? 60000 : 30000; // ms

// import defaultSettings from '../config/defaultSettings';

/** 获取用户信息比较慢的时候会展示一个 loading */
// export const initialStateConfig = {
//   loading: <PageLoading />,
// };

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{
  name: string;
  currentUser?: UserInfo;
  fetchUserInfo?: () => Promise<UserInfo | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfo();
      if (res.code === 200) {
        return res.data;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  };

  const currentUser = await fetchUserInfo();
  return {
    name: 'inteluck tms vendor',
    fetchUserInfo,
    currentUser,
    // settings: defaultSettings,
  };
}

// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  const onPageChange = () => {
    if (isLocalDevHost()) {
      return;
    }

    // 如果没有登录，重定向到 login
    if (!Cookie.get(TOKEN_KEY) && !initialState?.currentUser) {
      return history.push(PATHS.LOGIN);
    }

    const currentUser = initialState?.currentUser;
    // const rolesLen = currentUser?.roles?.length ?? 0;
    // if (rolesLen > 1) {
    //   if (!currentUser?.lastLoginUserRoleId) {
    //     // 如果不用重置密码，并且没有选择角色，则跳转到选择角色页面
    //     return history.push(PATHS.CHANGE_ROLE);
    //   }
    // } else if (rolesLen === 0) {
    //   // 没有角色的情况
    //   return history.push(PATHS.LOGIN);
    // } else {
    //   // 只有一个角色的情况, 后台自动分配对应角色，此时需要刷新token
    //   const newToken = currentUser?.newToken;
    //   if (newToken) {
    //     refreshToken(newToken);
    //   }
    // }

    if (currentUser?.status === AccountStatusEnum.INACTIVE) {
      // 如果用户需要重置密码，跳转到重置密码页面
      return history.push(PATHS.CHANGE_PASSWORD);
    }
  };

  const menuItemRender = (item: MenuDataItem, defaultDom: React.ReactNode) => {
    return <Link to={item.path!}>{defaultDom}</Link>;
  };

  const postMenuData = (menuData: MenuDataItem[]) => {
    return menuData.map((item: MenuDataItem) => {
      const { meta } = item;
      // 根据menuIconList的key匹配  meta.icon 的内容
      const iconItem = menuIconList.find(
        (subItem) => subItem.key === meta?.icon,
      );
      return {
        ...item,
        icon: iconItem?.icon ?? item.icon,
      };
    });
  };

  return {
    logo: '/img/logo.png',
    menu: {
      locale: false,
      params: initialState,
      // request: async (params, defaultMenuData) => {
      //   const { vendorStatus } = params?.currentUser ?? {};
      //   if (vendorStatus === EnumVendorAccreditationStatus.ACCREDITED) {
      //     return defaultMenuData;
      //   }
      //   const notAccessMenuPathList = [PATHS.TRUCK_LIST, PATHS.CREW_LIST];
      //   return defaultMenuData.filter(
      //     (item) => !notAccessMenuPathList.includes(item.path!),
      //   );
      // },
    },
    layout: 'mix',
    splitMenus: false, // 这里用了mix才会生效
    locale: 'en-US',
    siderWidth: 242,
    rightContentRender: false,
    footerRender: false,
    fixedHeader: true,
    headerContentRender: () => <PageHeader />,
    // childrenRender: (child: any) => <PageLayout>{child}</PageLayout>,
    onPageChange: onPageChange,
    token: proLayoutToken,
    menuItemRender: menuItemRender,
    postMenuData: postMenuData,
    unAccessible: <NoFoundPage />,
    ErrorBoundary: CustomErrorBoundary,
    // headerContentRender: false,
    // // 自定义 404 页面
    // noFound: <div>noFound</div>,
  };
};

export const request: RequestConfig = {
  timeout,
  // other axios options you want
  errorConfig: {
    errorHandler: (error: any) => {
      const { code } = error;
      if (code === 'ECONNABORTED') {
        notification.destroy?.();
        notification.open({
          message: 'Timeout',
          description:
            'Connection to the service timed out, please try again later.',
          btn: (
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#009688',
                },
              }}
            >
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  window?.location?.reload?.();
                }}
              >
                Reload
              </Button>
            </ConfigProvider>
          ),
          icon: <ExclamationCircleFilled style={{ color: '#FFA940' }} />,
          duration: null,
        });
      }
    },
    errorThrower() {},
  },
  requestInterceptors: [
    (config: any) => {
      let token = Cookie.get(TOKEN_KEY);
      if (token?.startsWith('"')) {
        token = JSON.parse(token);
      }
      if (token) {
        config.headers.token = token;
      }
      return config;
    },
    (error: any) => {
      return error;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      const { config, data = {} } = response;
      const { code, msg } = data;
      if (config?.skipErrorHandler) {
        return response;
      }
      if (+code === 401) {
        Cookie.remove(TOKEN_KEY);

        if (!isLocalDevHost() && location.pathname !== PATHS.LOGIN) {
          history.push({
            pathname: PATHS.LOGIN,
            search: queryString.stringify({
              redirect: location.pathname + location.search,
            }),
          });
        }

        return response;
        // throw new Error(`${status}  Not Authorization`);
      }
      if (+code === 403 && location.pathname !== PATHS.NO_AUTH) {
        history.push(PATHS.NO_AUTH);
        return response;
        // throw new Error(`${status}  Not Authorizated to access this page`);
      }
      if (+code !== 200) {
        if (+code !== 401 && +code !== 403) {
          toast.error(msg);
          return response;
          // throw new Error(msg);
        }
      }

      return response;
    },
  ],
};

export const onRouteChange = ({ location }: { location: Location }) => {
  ensureLocalDevCookie();

  if (isLocalDevHost()) {
    window?.scrollTo?.(0, 0);
    return;
  }

  if (location?.pathname === PATHS.LOGIN && Cookie.get(TOKEN_KEY)) {
    history.push(PATHS.HOME);
  }

  // 路由切换的时候默认滚动到顶部
  window?.scrollTo?.(0, 0);
};

export function rootContainer(container: React.ReactNode) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_OAUTH2_CLIENT_ID}>
      <ConfigProvider theme={themeConfig} table={tableStyleConfig}>
        <App message={{ maxCount: 1 }}>
          <PubSubProvider>{container}</PubSubProvider>
        </App>
      </ConfigProvider>
    </GoogleOAuthProvider>
  );
}
