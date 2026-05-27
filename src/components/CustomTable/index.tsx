import { COMMON_TABLE_FORM_SETTING } from '@/constants';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { ProTable, ProTableProps } from '@ant-design/pro-components';
import { Button } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

export interface ICustomTable extends ProTableProps<any, any> {
  noStyle?: boolean;
  filterSticky?: any;
}

const CustomTable: FC<ICustomTable> = ({
  className,
  noStyle = false,
  rowKey = 'id',
  defaultSize = 'large',
  toolBarRender,
  options,
  form,
  ...rest
}) => {
  const headerTitleRender = () => {
    return toolBarRender ? (
      <>
        {/* @ts-ignore */}
        <div className={styles.toolBarWrap}>{toolBarRender()}</div>
      </>
    ) : null;
  };

  return (
    <>
      <div className={cls(styles.customTableContainer, 'customTableContainer')}>
        <ProTable
          className={cls(
            styles.customTable,
            noStyle && styles.noStyle,
            className,
          )}
          headerTitle={headerTitleRender()}
          rowKey={rowKey}
          defaultSize={defaultSize}
          options={{
            density: false,
            fullScreen: false,
            setting: false,
            reload: false,
            ...options,
          }}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          form={{
            ...COMMON_TABLE_FORM_SETTING,
            optionRender: (searchConfig) => [
              <Button
                key="submit"
                type="primary"
                style={{ marginRight: 16 }}
                onClick={() => searchConfig?.form?.submit()}
              >
                <SearchOutlined />
                Search
              </Button>,
              <Button
                key="reset"
                onClick={() => {
                  //@ts-ignore
                  rest?.onReset?.();
                  searchConfig?.form?.resetFields();
                  searchConfig?.form?.submit();
                }}
              >
                <SyncOutlined />
                Reset
              </Button>,
            ],
            ...form,
          }}
          {...rest}
        />
      </div>
    </>
  );
};

export default CustomTable;
