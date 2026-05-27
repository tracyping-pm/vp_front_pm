import BreadcrumbTags from '@/components/BreadcrumbTags';
import { LAYOUT_HEDAER_HEIGHT } from '@/constants';
import { Outlet } from '@umijs/max';
import { Affix } from 'antd';
import cls from 'classnames';
import styles from './index.less';

export default function () {
  return (
    <>
      <div className={cls('customPageContainer', styles.customPageContainer)}>
        <Affix offsetTop={LAYOUT_HEDAER_HEIGHT}>
          <div className="global-tabs">
            <BreadcrumbTags />
          </div>
        </Affix>
        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
}
