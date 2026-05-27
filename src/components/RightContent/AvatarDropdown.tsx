import { authLogout } from '@/api/auth';
import { PATHS, TOKEN_KEY } from '@/constants';
import {
  ExclamationCircleFilled,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { history, useModel, useSearchParams } from '@umijs/max';
import { App, Avatar, Badge, Dropdown, Spin } from 'antd';
import cls from 'classnames';
import Cookie from 'js-cookie';
import queryString from 'query-string';
import React, { forwardRef, useCallback } from 'react';
import { ReactComponent as DropdownIcon } from '../../../public/svg/dropdown_icon.svg';
import CustomerAvatar from './CustomerAvatar';

import { EnumVendorAccreditationStatusColor } from '@/enums';
import styles from './index.less';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
  const { modal } = App.useApp();
  const [searchParams] = useSearchParams();
  const { initialState, setInitialState } = useModel('@@initialState');

  const loginOut = async () => {
    await authLogout();
    Cookie.remove(TOKEN_KEY);
    const { search, pathname } = history.location;
    const redirect = searchParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== PATHS.LOGIN && !redirect) {
      history.replace({
        pathname: PATHS.LOGIN,
        search: queryString.stringify({
          redirect: pathname + search,
        }),
      });
    }
  };

  const onMenuClick = useCallback(
    (menu: any) => {
      const { key } = menu;
      if (key === 'changePassword') {
        history.push(PATHS.CHANGE_PASSWORD);
        return;
      }
      if (key === 'logout') {
        modal.confirm({
          title: 'Confirm Logout',
          icon: <ExclamationCircleFilled />,
          content: 'Confirm to log out of the current account',
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk() {
            console.log('OK');
            // @ts-ignore
            setInitialState((s) => ({
              ...s,
              currentUser: undefined,
            }));
            setTimeout(() => {
              loginOut();
            }, 0);
          },
          onCancel() {
            // do nothing
          },
        });

        return;
      }
    },
    [setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }

  const menuItems = [
    {
      key: 'changePassword',
      icon: <LockOutlined />,
      label: 'Change Password',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  // currentUser.roles = currentUser.roles?.slice(0, 1);

  // const onlyOne = currentUser?.roles?.length === 1;
  const DropdownRender = forwardRef(() => {
    return (
      <>
        <div className={styles.allInWrap}>
          <section className={cls('normalList')}>
            {menuItems.map((menu) => {
              return (
                <div
                  key={menu?.key}
                  className="normalItem"
                  onClick={() => onMenuClick(menu)}
                >
                  <span className="icon">{menu.icon}</span>
                  <span className="label">{menu.label}</span>
                </div>
              );
            })}
          </section>
        </div>
      </>
    );
  });

  return (
    <Dropdown popupRender={() => <DropdownRender />}>
      <span
        className={`${styles.action} ${styles.account}`}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {currentUser.avatar ? (
          <Avatar
            className={styles.avatar}
            src={currentUser.avatar}
            alt="avatar"
          />
        ) : (
          <CustomerAvatar name={currentUser.name} />
        )}
        {/*<span style={{ position: 'relative', top: '1px' }}>*/}
        {/*  <RectFlag />*/}
        {/*</span>*/}
        <span className={`${styles.vendorNameWrap} anticon`}>
          <span className="vendorName">{currentUser.name}</span>
          <span className="vendorStatus">
            <Badge
              color={
                EnumVendorAccreditationStatusColor[currentUser.vendorStatus]
              }
              text={currentUser.vendorStatus}
            />
          </span>
        </span>

        <DropdownIcon className={styles.dropdownIcon} />
      </span>
    </Dropdown>
  );
};

export default AvatarDropdown;
