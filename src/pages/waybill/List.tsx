import { IWaybillListItem, IWaybillListPayload } from '@/api/types/waybill';
import { CheckExportWaybill, ExportWaybill, waybillList } from '@/api/waybill';
import CustomPopover from '@/components/CustomPopover';
import CustomTable from '@/components/CustomTable';
import { IconDetail } from '@/components/OperationIcon';
import { DEFAULT_PAGINATION, ES_DTO_CLASS, PATHS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  WaybillStatusEnum,
  WaybillStatusEnumText,
  WaybillStatusEnumTextColor,
} from '@/enums';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import { useFieldQuery } from '@/hooks/useFieldQuery';
// import { formatAmount } from '@/utils/utils';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  ExclamationCircleFilled,
  SearchOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { App, Button, Space, message } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { Key, useEffect, useRef, useState } from 'react';
import { aggregateToJsonArray } from './components/ModuleInformation';
import styles from './styles.less';

const WaybillList: React.FC = () => {
  const { modal } = App.useApp();
  // 列表展示配置
  const [originData, setOriginData] =
    useState<PaginationResponse<IWaybillListItem>>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const selectedALL = useRef<any>([]);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const playTargetRef = useRef<any>(null);
  const playSrcRef = useRef<any>(null);
  const playStar = useAddAnimation(playSrcRef, playTargetRef);

  // const { publish } = useContext(PubSubContext);

  useEffect(() => {
    playTargetRef.current = document.querySelector('.exportCase');
  }, []);

  const {
    options: waybillNumberOptions,
    onSearch: waybillNumberSearch,
    defaultFieldProps: waybillNumberDefaultFieldProps,
  } = useFieldQuery({
    field: 'waybillNumber',
    esDtoClass: ES_DTO_CLASS.WAYBILL,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.VENDOR_PORTAL,
  });

  const {
    options: plateNumberOptions,
    onSearch: plateNumberSearch,
    defaultFieldProps: plateNumberDefaultFieldProps,
  } = useFieldQuery({
    field: 'plateNumber',
    esDtoClass: ES_DTO_CLASS.TRUCK,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.VENDOR,
  });

  const {
    options: customerNameOptions,
    onSearch: customerNameSearch,
    defaultFieldProps: customerNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'customerName',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.VENDOR_PORTAL,
  });

  const {
    options: driverNameOptions,
    onSearch: driverNameSearch,
    defaultFieldProps: driverNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'name',
    esDtoClass: ES_DTO_CLASS.CREW,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.VENDOR,
  });

  const getDataSource = async (params: IWaybillListPayload) => {
    setLoading(true);
    const payload = {
      pageNum: params.current,
      pageSize: params.pageSize,
      truckId: params.plateNumber || undefined,
      driverName: params.driverName || undefined,
      status: params.status || undefined,
      customerId: params.customerId || undefined,
      positionTimeStart: params.positionTimeStart || undefined,
      positionTimeEnd: params.positionTimeEnd || undefined,
      customerCode: params?.customerCode || undefined,
      waybillId: params?.waybillId || undefined,
    };
    const res = await waybillList(payload as IWaybillListPayload);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
      const list = res.data?.list ?? [];
      return {
        data: [...list],
        success: true,
        total: res.data?.total,
      };
    }
    return {
      data: [],
      success: false,
      total: 0,
    };
  };

  const playAnimation = () => {
    const logoEle = document.querySelector('.ant-pro-global-header-logo');
    const imgEle = logoEle?.querySelector('img') as HTMLImageElement;
    playStar((start_top, _, end_top) => Math.min(start_top, end_top), imgEle);
  };

  // 下载文件
  const onExportWaybill = async (ids: number[]) => {
    setExportLoading(true);
    const res = await ExportWaybill({ ids });
    setExportLoading(false);
    if (res.code === 200) {
      playAnimation();
    }
  };

  // 检查文件
  const onCheckExportWaybill = async () => {
    const waybillNumber = selectedALL.current;
    const ids = waybillNumber.map((i: { id: number }) => i.id);

    if (ids.length === 0) {
      message.error('Please select the waybill to be exported first');
      return;
    }
    if (ids.length > 1000) {
      message.error('The number of selected waybills must not exceed 1,000');
      return;
    }

    // 规则检查
    // * 0: Normal
    // * 1: Files can be generated up to 5 times a day, please try again tomorrow
    // * 2: Please select the waybill to be exported first
    // * 3: The number of selected waybills must not exceed 1,000
    const res = await CheckExportWaybill({ ids });

    if (res.data?.code === 1) {
      message.error(
        'Files can be generated up to 5 times a day, please try again tomorrow',
      );
      return;
    }
    if (res.code === 200 && res.data.code === 0) {
      modal.confirm({
        title: 'Confirm',
        icon: <ExclamationCircleFilled />,
        width: 500,
        content: (
          <>
            <p style={{ marginBottom: 0 }}>
              {' '}
              Confirm to generate files for the currently selected
              <strong> {ids?.length}</strong> waybills
            </p>
            <p>
              There are {res?.data?.remainCount} chances left to generate files
              today
            </p>
          </>
        ),
        okText: 'Confirm',
        cancelText: 'Cancel',
        okButtonProps: {
          style: { outline: 'none' },
        },
        onOk() {
          onExportWaybill(ids);
        },
        onCancel() {
          // do nothing
        },
      });
    }
  };

  const toolBarRender = () => [
    <Button
      key="export"
      type="primary"
      loading={exportLoading}
      onClick={onCheckExportWaybill}
      ref={playSrcRef}
    >
      Export waybill
    </Button>,
  ];

  // 多选
  const onHandleSelect = (record: { id: number }, selected: any) => {
    const idx = selectedALL.current.findIndex(
      (i: { id: number }) => i.id === record.id,
    );
    if (selected) {
      selectedALL.current.push(record);
    } else {
      selectedALL.current.splice(idx, 1);
    }
    setSelectedRowKeys(selectedALL.current.map((i: { id: number }) => i.id));
  };

  const onHandleSelectAll = (
    selected: any,
    selectedRows: { current: any[] },
    changeRows: any[],
  ) => {
    if (selected) {
      // eslint-disable-next-line no-param-reassign
      selectedALL.current = selectedALL.current.concat(changeRows);
    } else {
      changeRows.forEach((i) => {
        selectedALL.current.forEach((m: { id: number }, mIndex: any) => {
          if (i.id === m.id) {
            selectedALL.current.splice(mIndex, 1);
          }
        });
      });
    }
    setSelectedRowKeys(selectedALL.current.map((i: { id: number }) => i.id));
  };

  const columns: ProColumns[] = [
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        valuePropName: 'name',
      },
      fieldProps: {
        ...waybillNumberDefaultFieldProps,
        placeholder: 'Waybill Number',
        options: waybillNumberOptions,
        onSearch: waybillNumberSearch,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      search: {
        transform: (option: any) => {
          return { waybillId: option?.id ?? undefined };
        },
      },
      render: (_, record) => {
        return (
          <CustomPopover content={record.waybillNumber}>
            {record.waybillNumber}
          </CustomPopover>
        );
      },
    },
    {
      title: 'Customer Code',
      dataIndex: 'customerCode',
      valueType: 'text',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Customer Code',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render(_, record) {
        const list = aggregateToJsonArray(record.customerCodeVos);
        const customerCode =
          list.reduce((acc, cur, index) => {
            const curStr = !!cur.numbers
              ? `${cur.customerCodeType}:${cur.numbers}`
              : '';
            return `${acc}${index !== 0 && curStr && acc ? ',' : ''}${curStr}`;
          }, '') || '-';

        return (
          <CustomPopover
            content={customerCode}
            rootClassName={styles.customerCodePopover}
          >
            {customerCode}
          </CustomPopover>
        );
      },
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        valuePropName: 'name',
      },
      fieldProps: {
        ...customerNameDefaultFieldProps,
        placeholder: 'Customer Name',
        options: customerNameOptions,
        onSearch: customerNameSearch,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      search: {
        transform: (option: any) => {
          return { customerId: option?.id ?? undefined };
        },
      },
      render: (_, record) => {
        return (
          <CustomPopover content={record.customerName}>
            {record.customerName}
          </CustomPopover>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: WaybillStatusEnumText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'All Status',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => (
        <CustomPopover content={record.status}>
          <>
            <span
              className={styles.proTableDot}
              style={{
                backgroundColor:
                  WaybillStatusEnumTextColor[
                    record.status as WaybillStatusEnum
                  ],
              }}
            ></span>{' '}
            {record.status}
          </>
        </CustomPopover>
      ),
    },
    {
      title: 'Position Time',
      dataIndex: 'positionTime',
      valueType: 'dateTimeRange',
      formItemProps: {
        label: null,
      },
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: ['Position Time Start', 'Position Time End'],
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      search: {
        transform: (value: any) => ({
          positionTimeStart: value?.[0],
          positionTimeEnd: value?.[1],
        }),
      },
      render: (_, record) => (
        <CustomPopover content={record.positionTime}>
          {record.positionTime}
        </CustomPopover>
      ),
    },

    {
      title: 'Required Delivery time',
      dataIndex: 'destinationTime',
      valueType: 'dateRange',
      width: 170,
      hideInSearch: true,
      formItemProps: {
        label: null,
      },
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: [
          'Required Delivery Time Start',
          'Required Delivery Time End',
        ],
      },
      search: {
        transform: (value: any) => ({
          destinationTimeStart: value?.[0]
            ? dayjs(value?.[0])?.format?.('YYYY-MM-DD 00:00:00')
            : undefined,
          destinationTimeEnd: value?.[1]
            ? dayjs(value?.[1])?.format?.('YYYY-MM-DD 23:59:59')
            : undefined,
        }),
      },
      render: (_, record) => {
        return record.destinationTime ? (
          <CustomPopover
            content={dayjs(record.destinationTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )}
          >
            {dayjs(record.destinationTime).format('YYYY-MM-DD HH:mm:ss')}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        valuePropName: 'name',
      },
      fieldProps: {
        ...plateNumberDefaultFieldProps,
        placeholder: 'Plate Number',
        options: plateNumberOptions,
        onSearch: plateNumberSearch,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      search: {
        transform: (option: any) => {
          return { plateNumber: option?.id ?? undefined };
        },
      },
      render: (_, record) => (
        <CustomPopover content={record.plateNumber}>
          {record.plateNumber}
        </CustomPopover>
      ),
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        valuePropName: 'name',
      },
      // width: 250,
      fieldProps: {
        ...driverNameDefaultFieldProps,
        placeholder: 'Driver Name',
        options: driverNameOptions,
        onSearch: driverNameSearch,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      search: {
        transform: (option: any) => {
          return { driverName: option?.name ?? undefined };
        },
      },
      render: (_, record) => (
        <CustomPopover content={record.driverName}>
          {record.driverName}
        </CustomPopover>
      ),
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      align: 'center',
      width: 88,
      render: (_, record) => {
        return (
          <div
            style={{
              display: 'flex',
              padding: '0 12px',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <IconDetail
              onClick={() => {
                history.push(
                  `${PATHS.WAYBILL_DETAIL}/${record.waybillNumber}?id=${record.id}&breadcrumbName=${record.waybillNumber}`,
                );
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className={cls('waybillListPage', styles.waybillListPage)}>
        <CustomTable
          columns={columns}
          scroll={{ x: 1400 }}
          actionRef={actionRef}
          formRef={formRef}
          request={async (params) => getDataSource(params)}
          pagination={{
            showSizeChanger: true,
            pageSize: originData.pageSize,
            total: originData.total,
          }}
          rowSelection={{
            selectedRowKeys,
            // onChange: (keys: Key[],selectedRows) => {
            //   console.log(keys,selectedRows)
            //   setSelectedRowKeys(keys);
            // },
            onSelect: onHandleSelect,
            // @ts-ignore
            onSelectAll: onHandleSelectAll,
          }}
          tableAlertRender={(val) => {
            // console.log(val.selectedRowKeys, val.selectedRows);
            return (
              <Space size={24}>
                <span>{val.selectedRowKeys.length} waybill is selected</span>
              </Space>
            );
          }}
          loading={loading}
          toolBarRender={toolBarRender}
          form={{
            syncToUrl: false,
            syncToInitialValues: false,
            submitter: {
              render: (props) => {
                return [
                  <Button
                    type="primary"
                    key="Search"
                    onClick={() => {
                      setSelectedRowKeys([]);
                      selectedALL.current = [];
                      props.form?.submit?.();
                    }}
                    icon={<SearchOutlined />}
                  >
                    Search
                  </Button>,
                  <Button
                    key="Reset"
                    onClick={() => {
                      setSelectedRowKeys([]);
                      selectedALL.current = [];
                      props.reset?.();
                    }}
                    icon={<SyncOutlined />}
                  >
                    Reset
                  </Button>,
                ];
              },
            },
          }}
        />
      </div>
    </>
  );
};

export default WaybillList;
