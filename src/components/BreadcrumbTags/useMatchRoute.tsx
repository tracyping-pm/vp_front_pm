import { queryStringToObject } from '@/utils/utils';
import {
  history,
  useAppData,
  useLocation,
  useOutlet,
  useSelectedRoutes,
} from '@umijs/max';
import { useEffect, useState } from 'react';

interface MatchRouteType {
  title: string;
  pathname: string; //  带参数路由
  children: any;
  routePath: string; // 路由表地址
  search?: string;
}

export function useMatchRoute() {
  // 获取匹配到的路由
  const selectedRoutes = useSelectedRoutes();
  // 获取路由组件实例
  const children = useOutlet();
  // 获取所有路由
  const { routes } = useAppData();
  // 获取当前url
  const { pathname, search } = useLocation();
  const [matchRoute, setMatchRoute] = useState<MatchRouteType | undefined>();

  // 获取菜单名称
  const getMenuTitle = (lastRoute: any) => {
    const searchObj = queryStringToObject(search);
    const breadcrumbName = searchObj.breadcrumbName ?? '';
    return breadcrumbName ? `${breadcrumbName}` : `${lastRoute.route.name}`;
  };
  // 监听路由有变化，重新匹配，返回新路由信息
  useEffect(() => {
    // 获取当前匹配的路由
    const lastRoute = selectedRoutes.at(-1);

    if (!lastRoute?.route?.path) return;

    const routeDetail = routes[(lastRoute.route as any).id];

    // 如果匹配的路由需要重定向，这里直接重定向
    if (routeDetail?.redirect) {
      history.replace(routeDetail?.redirect);
      return;
    }

    // 获取菜单名称
    const title = getMenuTitle(lastRoute);

    setMatchRoute({
      title,
      pathname,
      children,
      routePath: lastRoute.route.path,
      search,
    });
  }, [pathname, search]);

  return matchRoute;
}
