import CustomPopover from '@/components/CustomPopover';
import CustomTable from '@/components/CustomTable';
import { DEFAULT_PAGINATION, ES_DTO_CLASS, PATHS } from '@/constants';
import {
  EnumAccredType,
  EnumAccredTypeText,
  EnumVendorAccredNoStartStatusText,
  EnumVendorAccredStatus,
  EnumVendorAccredStatusText,
  EnumVendorAccredStatusTextColor,
  FieldQueryHighlightTypeEnum,
} from '@/enums';

import {
  accredDelete,
  accredList,
  accredSubmitDraft,
  accredWithDraw,
} from '@/api/accred';
import { IAccredListItem } from '@/api/types/accred';
import { useKeepAliveTabs } from '@/components/BreadcrumbTags/useKeepAliveTabs';
import FuzzySelector from '@/components/FuzzySelector';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { App, Badge, Button, Divider, Popconfirm, Space } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import AccreditationApplicationModal from './components/AccreditationApplicationModal';

const Accred: React.FC = () => {
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(true);
  const [accredApplicationModalOpen, setAccredApplicationModalOpen] =
    useState<boolean>(false);
  const [activeRecordId, setActiveRecordId] = useState<number>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [withDrawing, setWithDrawing] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const { closeTabByNode } = useKeepAliveTabs();

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const getDataSource = async (params: any) => {
    setLoading(true);
    const payload = {
      ...params,
      pageNum: params.current,
    };
    delete payload.current;
    const res = await accredList(payload).finally(() => {
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

  const onSubmitDraft = async (id: number) => {
    setActiveRecordId(id);
    setSubmitting(true);
    const res = await accredSubmitDraft({ id }).finally(() => {
      setSubmitting(false);
    });
    if (res.code === 200) {
      message.success('Submit Draft Successfully!');
      reload();
    }
  };

  const onWithdraw = async (id: number) => {
    setActiveRecordId(id);
    setWithDrawing(true);
    const res = await accredWithDraw({ id }).finally(() => {
      setWithDrawing(false);
    });
    if (res.code === 200) {
      message.success('Withdraw Successfully!');
      reload();
    }
  };

  const onDelete = async (record: IAccredListItem) => {
    setActiveRecordId(record.id);
    setDeleting(true);
    const res = await accredDelete({ id: record.id }).finally(() => {
      setDeleting(false);
    });
    if (res.code === 200) {
      message.success('Delete Successfully!');
      const key = `${PATHS.ACCRED_APPLICATION_DETAIL}?type=${record.type}&id=${record.id}&breadcrumbName=${record.number}`;
      closeTabByNode(key);
      reload();
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Application No.',
      dataIndex: 'number',
      valueType: 'select',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Application No.' }}
          request={{
            field: 'accredApplicationNumber',
            esDtoClass: ES_DTO_CLASS.ACCRED_APPLICATION,
            type: FieldQueryHighlightTypeEnum.VENDOR,
          }}
        />
      ),
      render: (_, record) => (
        <CustomPopover content={record.number}>
          <Button
            color="primary"
            variant="link"
            style={{ padding: 0 }}
            onClick={() => {
              history.push(
                `${PATHS.ACCRED_APPLICATION_DETAIL}?type=${record.type}&id=${record.id}&breadcrumbName=${record.number}`,
              );
            }}
          >
            {record.number}
          </Button>
        </CustomPopover>
      ),
      search: {
        transform: (option: any) => {
          return { id: option?.id ?? undefined, number: undefined };
        },
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: EnumVendorAccredNoStartStatusText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Status',
        mode: 'multiple',
        allowClear: true,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const status: EnumVendorAccredStatus = record.status;
        const Content = (
          <Badge
            color={EnumVendorAccredStatusTextColor[status]}
            text={EnumVendorAccredStatusText[status]}
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
      title: 'Type',
      dataIndex: 'type',
      valueType: 'select',
      ellipsis: { showTitle: false },
      valueEnum: EnumAccredTypeText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Type',
        mode: 'multiple',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => {
        return (
          <CustomPopover content={record.type}>{record.type}</CustomPopover>
        );
      },
      search: {
        transform: (options: DefaultOptionType[]) => {
          return {
            typeList: options ?? undefined,
            type: undefined,
          };
        },
      },
    },
    {
      title: 'Object',
      dataIndex: 'objectName',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: 'Object',
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => {
        const { type, objectId, objectName } = record;
        let path = '';
        switch (type) {
          case EnumAccredType.TRUCK:
            path = `${PATHS.TRUCK_DETAIL}/${objectId}?breadcrumbName=${objectName}`;
            break;
          case EnumAccredType.CREW:
            path = `${PATHS.CREW_DETAIL}/${objectId}?breadcrumbName=${objectName}`;
            break;
          default:
            break;
        }

        return (
          <CustomPopover content={objectName}>
            {type !== EnumAccredType.VENDOR && objectId ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  history.push(path);
                }}
              >
                {objectName}
              </Button>
            ) : (
              objectName
            )}
          </CustomPopover>
        );
      },
    },
    {
      title: 'Update Time',
      dataIndex: 'updatedAt',
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
      render: (_, record) => (
        <CustomPopover
          content={dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
        >
          {dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
        </CustomPopover>
      ),
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 200,
      align: 'left',
      render: (_, record) => {
        const isDraft = record.status === EnumVendorAccredStatus.DRAFT;
        const isUnderReview =
          record.status === EnumVendorAccredStatus.UNDER_REVIEW;

        return (
          <Space split={<Divider type="vertical" />} align="center" size={0}>
            {isDraft && (
              <>
                {/* <Button color="primary" variant="link" style={{ padding: 0 }}>
                  Edit
                </Button> */}
                <Popconfirm
                  title={`Submit`}
                  description={`Submit the Application for review?`}
                  onConfirm={() => onSubmitDraft(record.id)}
                  placement="leftTop"
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    color="primary"
                    variant="link"
                    loading={activeRecordId === record.id && submitting}
                    style={{ padding: 0 }}
                  >
                    Submit
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title={`Delete`}
                  description={`Delete this Application?`}
                  onConfirm={() => onDelete(record)}
                  placement="leftTop"
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    color="primary"
                    variant="link"
                    loading={activeRecordId === record.id && deleting}
                    style={{ padding: 0 }}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </>
            )}
            {isUnderReview && (
              <>
                <Popconfirm
                  title={`Withdraw`}
                  description={`Revert the Application to draft?`}
                  onConfirm={() => onWithdraw(record.id)}
                  placement="leftTop"
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    color="primary"
                    variant="link"
                    loading={activeRecordId === record.id && withDrawing}
                    style={{ padding: 0 }}
                  >
                    Withdraw
                  </Button>
                </Popconfirm>
              </>
            )}
            <Button
              color="primary"
              variant="link"
              style={{ padding: 0 }}
              onClick={() => {
                history.push(
                  `${PATHS.ACCRED_APPLICATION_DETAIL}?type=${record.type}&id=${record.id}&breadcrumbName=${record.number}`,
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

  const toolBarRender = () => [
    <Button
      key="create"
      type="primary"
      onClick={() => {
        setAccredApplicationModalOpen(true);
        reload();
      }}
    >
      Add Accreditation Application
    </Button>,
  ];

  return (
    <>
      <CustomTable
        actionRef={actionRef}
        formRef={formRef}
        columns={columns}
        scroll={{ x: 1500 }}
        request={async (params) => getDataSource(params)}
        pagination={{
          showSizeChanger: true,
          pageSize: originData.pageSize,
          total: originData.total,
          pageSizeOptions: [10, 20, 30, 50, 100],
        }}
        loading={loading}
        toolBarRender={toolBarRender}
        form={{
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      <AccreditationApplicationModal
        open={accredApplicationModalOpen}
        onCancel={() => setAccredApplicationModalOpen(false)}
        onSubmit={() => {
          message.success('Add Accreditation Application Successfully!');
          setAccredApplicationModalOpen(false);
          reload();
        }}
        onSaveDraft={() => {
          setAccredApplicationModalOpen(false);
          reload();
        }}
      />
    </>
  );
};

export default Accred;
