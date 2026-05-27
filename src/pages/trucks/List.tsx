import { getTruckTypeList, truckList } from '@/api/truck';
import { ITruckListItem, ITruckTypeListItem } from '@/api/types/truck';
import CustomPopover from '@/components/CustomPopover';
import CustomTable from '@/components/CustomTable';
import { DEFAULT_PAGINATION, ES_DTO_CLASS, PATHS } from '@/constants';
import {
  EnumAccredType,
  EnumTransportationStatus,
  EnumTransportationStatusColor,
  EnumTransportationStatusText,
  FieldQueryHighlightTypeEnum,
  OwnershipStatusEnumText,
  VendorTruckStatusEnum,
  VendorTruckStatusEnumColor,
  VendorTruckStatusEnumText,
} from '@/enums';

import FuzzySelector from '@/components/FuzzySelector';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import { formatAmount } from '@/utils/utils';
import {
  ActionType,
  ProColumns,
  ProFormDigitRange,
  ProFormInstance,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { App, Badge, Button, Divider, Space } from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import AccreditationApplicationModal from '../accred/components/AccreditationApplicationModal';
import styles from './style.less';

const TruckList: React.FC = () => {
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRecord, setActiveRecord] = useState<ITruckListItem>();
  const [applicationModalOpen, setApplicationModalOpen] =
    useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const getDataSource = async (params: any) => {
    setLoading(true);
    const payload = {
      pageNum: params.current,
      pageSize: params.pageSize,
      plateNumber: params?.plateNumber || null,
      truckType: params?.truckType || null,
      ownership: params?.ownership || null,
      status: params?.status || null,
      transportationStatus: params?.transportationStatus || null,
      updatedAtStart: params?.updatedAtStart,
      updatedAtEnd: params?.updatedAtEnd,
      validityPeriodFrom: params?.validityPeriodFrom,
      validityPeriodTo: params?.validityPeriodTo,
    };
    const res = await truckList(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setOriginData(res.data);
      return {
        data: res?.data?.list || [],
        success: true,
        total: res.data.total,
      };
    }
    return {
      data: [],
      success: false,
      total: 0,
    };
  };

  const columns: ProColumns[] = [
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      width: 150,
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Plate Number' }}
          request={{
            field: 'plateNumber',
            esDtoClass: ES_DTO_CLASS.TRUCK,
            type: FieldQueryHighlightTypeEnum.VENDOR,
          }}
        />
      ),
      search: {
        transform: (option: any) => {
          return { plateNumber: option?.name ?? undefined };
        },
      },
      render: (_, record) => (
        <CustomPopover content={record.plateNumber}>
          <Button
            color="primary"
            variant="link"
            style={{ padding: 0 }}
            onClick={() => {
              history.push(
                `${PATHS.TRUCK_DETAIL}/${record.id}?breadcrumbName=${record.plateNumber}`,
              );
            }}
          >
            {record.plateNumber}
          </Button>
        </CustomPopover>
      ),
    },
    {
      title: 'Accreditation Status',
      dataIndex: 'status',
      width: 200,
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: VendorTruckStatusEnumText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Accreditation Status',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const status: VendorTruckStatusEnum = record.status;
        const Content = (
          <Badge
            color={VendorTruckStatusEnumColor[status]}
            text={VendorTruckStatusEnumText[status]}
          />
        );
        return <CustomPopover title={Content}>{Content}</CustomPopover>;
      },
    },
    {
      title: 'Transportation Status',
      dataIndex: 'transportationStatus',
      width: 200,
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: EnumTransportationStatusText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Transportation Status',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const status: EnumTransportationStatus = record.transportationStatus;
        const Content = (
          <Badge
            color={EnumTransportationStatusColor[status]}
            text={EnumTransportationStatusText[status]}
          />
        );
        return <CustomPopover title={Content}>{Content}</CustomPopover>;
      },
    },
    {
      title: 'Truck Type',
      dataIndex: 'truckType',
      width: 200,
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Truck Type',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      request: async () => {
        const res = await getTruckTypeList();
        if (res.code === 200) {
          return res?.data?.map((item: ITruckTypeListItem) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
        }
        return [];
      },
      render: (_, record) => {
        return record.truckTypeName ? (
          <CustomPopover content={record.truckTypeName}>
            {record.truckTypeName}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Ownership',
      dataIndex: 'ownership',
      width: 200,
      valueType: 'select',
      fieldProps: {
        placeholder: 'OwnerShip',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      valueEnum: OwnershipStatusEnumText,
      render: (_, record) => {
        return record.ownership ? (
          <CustomPopover content={record.ownership}>
            {record.ownership}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Van Type',
      dataIndex: 'vanType',
      width: 200,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'vanType',
      },
      render: (_, record) => {
        return record.vanType ? (
          <CustomPopover content={record.vanType}>
            {record.vanType}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Registration Number',
      dataIndex: 'registrationNumber',
      width: 200,
      hideInSearch: true,
      render: (_, record) => {
        return record.registrationNumber ? (
          <CustomPopover content={record.registrationNumber}>
            {record.registrationNumber}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Gross Capacity',
      dataIndex: 'grossCapacity',
      width: 200,
      hideInSearch: true,
      render: (_, record) => {
        return record.grossCapacity ? (
          <CustomPopover content={record.grossCapacity}>
            {`${formatAmount(record.grossCapacity)} MT`}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Net Capacity',
      dataIndex: 'netCapacity',
      width: 200,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'netCapacity',
      },
      render: (_, record) => {
        return record.netCapacity ? (
          <CustomPopover content={formatAmount(record.netCapacity)}>
            {`${formatAmount(record.netCapacity)} MT`}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      width: 140,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'volume',
      },
      render: (_, record) => {
        return record.volume ? (
          <CustomPopover content={formatAmount(record.volume)}>
            {`${formatAmount(record.volume)} CBM`}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Model',
      dataIndex: 'model',
      width: 140,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      render: (_, record) => {
        return record.model ? (
          <CustomPopover content={formatAmount(record.model)}>
            {record.model}
          </CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Validity Period（Days）',
      dataIndex: 'validityPeriod',
      width: 160,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Validity Period ', 'Validity Period '],
      },
      renderFormItem: (_item, { defaultRender, ...rest }) => {
        return !!defaultRender ? (
          <ProFormDigitRange
            fieldProps={{
              ...rest,
              min: -99999999,
              max: 99999999,
              precision: 0,
              controls: false,
              formatter: (v) => formatAmount(v!),
            }}
            transform={(value: [number, number]) => {
              if (value && value.length === 2) {
                const [start, end] = value;
                return {
                  min: Math.min(start, end),
                  max: Math.max(start, end),
                };
              }
              return {};
            }}
          />
        ) : null;
      },
      render: (_, record) => {
        let { id, validityPeriod, status } = record;

        const content =
          status === VendorTruckStatusEnum.ACCREDITED
            ? typeof validityPeriod === 'number'
              ? `${validityPeriod}`
              : 'Permanently Valid'
            : '-';
        return (
          <CustomPopover key={`validityPeriod${id}`} title={content}>
            {content}
          </CustomPopover>
        );
      },
      search: {
        transform: (value: any) => ({
          validityPeriodFrom: value?.[0],
          validityPeriodTo: value?.[1],
        }),
      },
    },
    {
      title: 'Update Time',
      dataIndex: 'updatedAt',
      width: 200,
      valueType: 'dateTimeRange',
      formItemProps: {
        label: null,
      },
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: ['Update Time Start', 'Update Time End'],
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      search: {
        transform: (value: any) => ({
          updatedAtStart: value?.[0],
          updatedAtEnd: value?.[1],
        }),
      },
      render: (_, record) => {
        const updatedAt = dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss');
        return record.updatedAt ? (
          <CustomPopover content={updatedAt}>{updatedAt}</CustomPopover>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 150,
      align: 'left',
      render: (_, record) => {
        const isAccredited = record.status === VendorTruckStatusEnum.ACCREDITED;
        const isReaccredit =
          record.status === VendorTruckStatusEnum.UNACCREDITED ||
          record.status === VendorTruckStatusEnum.INACTIVE;

        return (
          <Space split={<Divider type="vertical" />} align="center" size={0}>
            {isAccredited && (
              <>
                <Button
                  color="primary"
                  variant="link"
                  style={{ padding: 0 }}
                  onClick={() => {
                    setActiveRecord(record);
                    setApplicationModalOpen(true);
                  }}
                >
                  Edit
                </Button>
              </>
            )}
            {isReaccredit && (
              <>
                <Button
                  color="primary"
                  variant="link"
                  style={{ padding: 0 }}
                  onClick={() => {
                    setActiveRecord(record);
                    setApplicationModalOpen(true);
                  }}
                >
                  Reaccredit
                </Button>
              </>
            )}
            <Button
              color="primary"
              variant="link"
              style={{ padding: 0 }}
              onClick={() => {
                history.push(
                  `${PATHS.TRUCK_DETAIL}/${record.id}?breadcrumbName=${record.plateNumber}`,
                );
              }}
            >
              Details
            </Button>
          </Space>
          // </div>
        );
      },
    },
  ];

  const reload = () => {
    actionRef.current?.reload();
  };

  return (
    <>
      <CustomTable
        className={styles.listWrap}
        columns={columns}
        scroll={{ x: 1500 }}
        actionRef={actionRef}
        formRef={formRef}
        request={async (params) => getDataSource(params)}
        pagination={{
          showSizeChanger: true,
          pageSize: originData.pageSize,
          total: originData.total,
          pageSizeOptions: [10, 20, 30, 50, 100],
        }}
        loading={loading}
        toolBarRender={false}
        form={{
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      {applicationModalOpen && (
        <AccreditationApplicationModal
          title={'Edit Accreditation Application'}
          type={EnumAccredType.TRUCK}
          truckParams={{
            plateNumber: activeRecord?.plateNumber,
          }}
          open={applicationModalOpen}
          onCancel={() => setApplicationModalOpen(false)}
          onSubmit={() => {
            message.success('Add Accreditation Application Successfully!');
            setApplicationModalOpen(false);
            reload();
          }}
          onSaveDraft={() => {
            setApplicationModalOpen(false);
            reload();
          }}
        />
      )}
    </>
  );
};

export default TruckList;
