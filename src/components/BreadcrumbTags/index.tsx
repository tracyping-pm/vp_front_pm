import { PATHS } from '@/constants';
import { history, useLocation } from '@umijs/max';

import cls from 'classnames';
import { useCallback, useMemo } from 'react';
import styles from './index.less';
import { useKeepAliveTabs } from './useKeepAliveTabs';

import { Tabs } from 'antd';
import { uniqueId } from 'lodash';

const BreadcrumbTags = () => {
  const { keepAliveTabs, activeTabRoutePath, closeTab } = useKeepAliveTabs();

  const { pathname } = useLocation();

  const tabItems = useMemo(() => {
    const tabsData = keepAliveTabs;
    return tabsData?.map((tab: any) => {
      return {
        key: `${tab.pathname}${tab.search ?? ''}`,
        title: tab.title,
        label: <span>{tab.title}</span>,
        children: null,
        closable: tab.pathname !== PATHS.HOME,
      };
    });
  }, [keepAliveTabs, pathname, activeTabRoutePath]);

  const onTabsChange = useCallback((tabRoutePath: string) => {
    history.push(tabRoutePath);
  }, []);

  const onTabEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: 'add' | 'remove',
  ) => {
    if (action === 'remove') {
      closeTab(targetKey as string);
    }
  };

  return (
    <div className={cls('breadcrumbTabs', styles.breadcrumbTabs)}>
      <Tabs
        key={uniqueId()}
        type="editable-card"
        items={tabItems}
        activeKey={activeTabRoutePath}
        onChange={onTabsChange}
        onEdit={onTabEdit}
        hideAdd
        tabBarGutter={8}
      />
    </div>
  );
};

export default BreadcrumbTags;
