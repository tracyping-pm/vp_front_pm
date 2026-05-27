import CustomerSelector from '@/components/RightContent/CustomerSelector';
import { useModel } from '@umijs/max';
import { Divider, Space } from 'antd';
import React from 'react';
import Avatar from './AvatarDropdown';
import ExportCase from './ExportCase';
import News from './News';
import styles from './index.less';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};

  return (
    <div className={styles.right}>
      <Space split={<Divider type="vertical" />} size={0}>
        {currentUser?.lastSelection && <CustomerSelector />}

        <div className="js-download-center">
          <ExportCase />
        </div>

        <div className="js-news">
          <News />
        </div>

        <Avatar />
      </Space>
    </div>
  );
};
export default GlobalHeaderRight;
