import CustomPopover from '@/components/CustomPopover';
import CustomTable from '@/components/CustomTable';
import {
  DEFAULT_COUNTRY_PHONE_CODE,
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  PATHS,
} from '@/constants';
import {
  CrewStatusEnum,
  CrewStatusEnumColor,
  CrewStatusEnumText,
  EnumAccredCrewType,
  EnumAccredType,
  EnumTransportationStatus,
  EnumTransportationStatusColor,
  EnumTransportationStatusText,
  FieldQueryHighlightTypeEnum,
  IPhoneSelectOptionsItem,
  VendorTruckStatusEnum,
} from '@/enums';

import { getCountryPhone } from '@/api/common';
import { crewList } from '@/api/crew';
import { ICrewListItem } from '@/api/types/crew';
import FuzzySelector from '@/components/FuzzySelector';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import { formatAmount } from '@/utils/utils';
import {
  ActionType,
  ProColumns,
  ProFormDigitRange,
  ProFormInstance,
} from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { App, Badge, Button, Divider, Form, Select, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import AccreditationApplicationModal from '../accred/components/AccreditationApplicationModal';
import styles from './style.less';

const CrewList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRecord, setActiveRecord] = useState<ICrewListItem>();
  const [applicationModalOpen, setApplicationModalOpen] =
    useState<boolean>(false);
  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const getDataSource = async (params: any) => {
    setLoading(true);
    const payload = {
      pageNum: params.current,
      pageSize: params.pageSize,
      name: params?.name,
      driverFlag: params?.driverFlag,
      helperFlag: params?.helperFlag,
      statusList: params?.statusList,
      transportationStatusList: params?.transportationStatusList,
      phoneCodeId: params?.phoneCodeId,
      phoneNum: params?.phoneNum,
      licenseNumber: params?.licenseNumber,
      updatedTimeStart: params?.updatedTimeStart,
      updatedTimeEnd: params?.updatedTimeEnd,
      validityPeriodFrom: params?.validityPeriodFrom,
      validityPeriodTo: params?.validityPeriodTo,
    };
    const res = await crewList(payload).finally(() => {
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

  const reload = () => {
    actionRef.current?.reload();
  };

  const getCityCode = async () => {
    const res = await getCountryPhone();
    if (res.code === 200) {
      setCodeList(res.data ?? []);
      formRef.current?.setFieldsValue({
        phoneCodeId: DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
      });
    }
  };

  useEffect(() => {
    getCityCode();
  }, []);

  const columns: ProColumns[] = [
    {
      title: 'Crew Name',
      dataIndex: 'name',
      width: 200,
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
          fieldProps={{ placeholder: 'Crew Name' }}
          request={{
            field: 'name',
            esDtoClass: ES_DTO_CLASS.CREW,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomPopover
            key={`name${record.id}`}
            title={record.name}
            placement="top"
          >
            <a
              href="javascript:void(0)"
              onClick={() => {
                history.push(
                  `${PATHS.CREW_DETAIL}/${record.id}?breadcrumbName=${record.name}`,
                );
              }}
            >
              {record.name}
            </a>
          </CustomPopover>
        );
      },
      search: {
        transform: (option: any) => {
          return {
            id: undefined,
            name: option?.name ?? undefined,
          };
        },
      },
    },
    {
      title: 'Accreditation Status',
      dataIndex: 'status',
      width: 200,
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: CrewStatusEnumText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Accreditation Status',
        mode: 'multiple',
        allowClear: true,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const status: CrewStatusEnum = record.status;
        const Content = (
          <Badge
            color={CrewStatusEnumColor[status]}
            text={CrewStatusEnumText[status]}
          />
        );
        return <CustomPopover title={Content}>{Content}</CustomPopover>;
      },
      search: {
        transform: (options: DefaultOptionType[]) => {
          return {
            statusList: options ?? undefined,
            status: undefined,
          };
        },
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
        mode: 'multiple',
        allowClear: true,
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
      search: {
        transform: (options: DefaultOptionType[]) => {
          return {
            transportationStatusList: options ?? undefined,
            transportationStatus: undefined,
          };
        },
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 200,
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Type',
        mode: 'multiple',
        allowClear: true,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem() {
        return (
          <Select
            options={[
              {
                label: 'Driver',
                value: 'driverFlag',
              },
              {
                label: 'Helper',
                value: 'helperFlag',
              },
            ]}
          />
        );
      },
      render: (_, record) => {
        const type = [
          record?.driverFlag ? 'Driver' : null,
          record?.helperFlag ? 'Helper' : null,
        ].filter(Boolean);
        const typeStr = type.join(', ');
        return typeStr ? (
          <CustomPopover content={typeStr}>{typeStr}</CustomPopover>
        ) : (
          '-'
        );
      },
      search: {
        transform: (options: any) => {
          const driverFlag = options?.includes('driverFlag');
          const helperFlag = options?.includes('helperFlag');

          return {
            driverFlag: driverFlag ? true : undefined,
            helperFlag: helperFlag ? true : undefined,
          };
        },
      },
    },
    {
      title: 'License Number',
      dataIndex: 'licenseNumber',
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
          fieldProps={{ placeholder: 'License Number' }}
          request={{
            field: 'licenseNumber',
            esDtoClass: ES_DTO_CLASS.CREW,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomPopover
            key={`licenseNumber${record.id}`}
            title={record.licenseNumber}
            placement="top"
          >
            {record.licenseNumber}
          </CustomPopover>
        );
      },
      search: {
        transform: (option: any) => {
          return {
            licenseNumber: option?.name ?? undefined,
          };
        },
      },
    },
    {
      title: 'Contact',
      dataIndex: 'phoneNum',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },

      renderFormItem: () => (
        <div style={{ display: 'flex' }}>
          <Form.Item name="phoneCodeId" noStyle>
            <Select
              style={{ width: 92, textAlign: 'left' }}
              options={codeList}
              optionLabelProp="show"
              popupMatchSelectWidth={false}
              showSearch
              filterOption={true}
              optionFilterProp="label"
              // onChange={(value, option) => setCodeOption(option)}
            ></Select>
          </Form.Item>
          <Form.Item name="phoneNum" noStyle>
            <FuzzySelector
              fieldProps={{ placeholder: 'Contact' }}
              request={{
                field: 'phoneNum',
                esDtoClass: ES_DTO_CLASS.CREW,
                type: FieldQueryHighlightTypeEnum.COUNTRY,
              }}
            />
          </Form.Item>
        </div>
      ),
      render: (_, record) => {
        return (
          <CustomPopover key={`phoneNum${record.id}`} title={record.phoneNum}>
            {record.phoneCode + ' ' + record.phoneNum}
          </CustomPopover>
        );
      },
      search: {
        transform: (option: any) => {
          return { phoneNum: option?.name ?? undefined };
        },
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
          updatedTimeStart: value?.[0],
          updatedTimeEnd: value?.[1],
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
                  `${PATHS.CREW_DETAIL}/${record.id}?breadcrumbName=${record.name}`,
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

  return (
    <>
      <CustomTable
        className={styles.listWrap}
        columns={columns}
        scroll={{ x: 1500 }}
        actionRef={actionRef}
        formRef={formRef}
        request={async (params) => getDataSource(params)}
        onReset={() => {
          setTimeout(() => {
            formRef.current?.setFieldsValue({
              phoneCodeId: DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
            });
          }, 0);
        }}
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
          type={EnumAccredType.CREW}
          crewParams={{
            idNumber: activeRecord?.idNumber,
            crewType: EnumAccredCrewType.MODIFY,
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

export default CrewList;
