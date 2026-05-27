import { PATHS } from '@/constants';

import { history, useModel } from '@umijs/max';
import { useCallback, useEffect, useState } from 'react';
import { useMatchRoute } from './useMatchRoute';

export interface ITabItem {
  title: string;
  routePath: string;
  pathname: string;
  search?: string;
}

export function useKeepAliveTabs() {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};
  const useId = currentUser?.id ?? 0;
  const breadcrumbKey = `${useId}_breadcrumbTabsData`;
  const DEFAULT_TABS = [
    { pathname: '/home', routePath: '/home', title: 'Home Page' },
  ];
  const [keepAliveTabs, setKeepAliveTabs] = useState<ITabItem[]>(
    JSON.parse(sessionStorage.getItem(breadcrumbKey)!) ?? DEFAULT_TABS,
  );
  const [activeTabRoutePath, setActiveTabRoutePath] = useState<string>('');

  const matchRoute = useMatchRoute();

  const clearAliveTabs = () => {
    history.replace(`${PATHS.HOME}`);

    setTimeout(() => {
      // setKeepAliveTabs(DEFAULT_TABS);
      setKeepAliveTabs((prev) => prev.filter((o) => o.pathname === PATHS.HOME));
      // sessionStorage.setItem(
      //   breadcrumbKey,
      //   JSON.stringify(DEFAULT_TABS),
      // );
      sessionStorage.clear();
      location.reload();
    }, 160);
  };
  const getRouteUrl = (data: ITabItem) => {
    return `${data.pathname}${data.search ?? ''}`;
  };
  // 关闭tab
  const closeTab = (
    key: string = activeTabRoutePath,
    useDefaultBehavior: boolean = true,
  ) => {
    const index = keepAliveTabs.findIndex((o) => getRouteUrl(o) === key);

    if (useDefaultBehavior) {
      if (getRouteUrl(keepAliveTabs[index]) === activeTabRoutePath) {
        if (index > 0) {
          if (index === keepAliveTabs.length - 1) {
            console.log(getRouteUrl(keepAliveTabs[index - 1]));
            history.push(getRouteUrl(keepAliveTabs[index - 1]));
          } else {
            history.push(getRouteUrl(keepAliveTabs[index + 1]));
          }
        } else {
          history.push(getRouteUrl(keepAliveTabs[index - 1]));
        }
      }
    }

    keepAliveTabs.splice(index, 1);
    const tabsData = [...keepAliveTabs];
    setKeepAliveTabs(tabsData);
    console.log('☀️☀️☀️tabsData', tabsData);
    sessionStorage.setItem(breadcrumbKey, JSON.stringify(tabsData));
  };

  const closeTabByNode = (key: string) => {
    const node = document.querySelector(`[data-node-key="${key}"]`);
    if (node) {
      const removeBtn = node.querySelector(
        '.ant-tabs-tab-remove',
      ) as HTMLElement;
      if (removeBtn) {
        removeBtn?.click?.();
      }
    }
  };

  const matchHandle = useCallback(() => {
    if (!matchRoute) return;
    // 检查当前路由是否打开过
    const existTab = keepAliveTabs.find(
      (o) => getRouteUrl(o) === getRouteUrl(matchRoute),
    );
    let tabsData: ITabItem[] = [];
    // 如果为首页
    if (matchRoute.pathname === PATHS.HOME) {
      tabsData = [...keepAliveTabs];
      setKeepAliveTabs(tabsData);
      sessionStorage.setItem(breadcrumbKey, JSON.stringify(tabsData));
    }
    // 如果不存在路由则添加
    if (!existTab) {
      tabsData = [
        ...keepAliveTabs,
        {
          search: matchRoute.search,
          title: matchRoute.title,
          routePath: matchRoute.routePath,
          pathname: matchRoute.pathname,
        },
      ];
      setKeepAliveTabs(tabsData);
      sessionStorage.setItem(breadcrumbKey, JSON.stringify(tabsData));
    }
    setActiveTabRoutePath(getRouteUrl(matchRoute));
  }, [matchRoute]);

  useEffect(() => {
    if (matchRoute) {
      matchHandle();
    }
  }, [matchRoute]);

  // console.log('🌛🌛🌛keepAliveTabs', keepAliveTabs);
  return {
    closeTab,
    closeTabByNode,
    clearAliveTabs,
    keepAliveTabs,
    activeTabRoutePath,
  };
}
