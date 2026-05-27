import CustomTable from '@/components/CustomTable';
import { PATHS } from '@/constants';
import {
  type SyncedApplication,
  type SyncedAppStatus,
  type OperationLogEntry,
  formatDateTime,
  getAllApplications,
  upsertApplication,
  vpAppStatusLabel,
} from '@/pages/common/prepaidApplicationSync';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, message, Modal, Space, Tag, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { ensureSeedData } from './mock/applicationData';
import styles from './index.less';

type VpDisplayStatus =
  | 'Draft'
  | 'Awaiting Inteluck Confirmation'
  | 'Pending Receipt'
  | 'Collected'
  | 'Rejected'
  | 'Receipt Rejected';

const STATUS_OPTIONS: VpDisplayStatus[] = [
  'Draft',
  'Awaiting Inteluck Confirmation',
  'Pending Receipt',
  'Collected',
  'Rejected',
  'Receipt Rejected',
];

const EDITABLE_STATUSES = new Set<string>(['Draft', 'Rejected', 'Receipt Rejected']);

function getStatusTagProps(label: string): { color: string; style?: React.CSSProperties } {
  switch (label) {
    case 'Draft':
      return { color: 'default' };
    case 'Awaiting Inteluck Confirmation':
      return { color: 'warning' };
    case 'Pending Receipt':
      return { color: 'processing' };
    case 'Collected':
      return { color: 'success' };
    case 'Rejected':
      return { color: 'error' };
    case 'Receipt Rejected':
      return { color: 'error', style: { borderColor: '#ff7875', color: '#a8071a' } };
    default:
      return { color: 'default' };
  }
}

const AdvancePaymentList: React.FC = () => {
  const [apps, setApps] = useState<SyncedApplication[]>([]);
  const [filterAppNo, setFilterAppNo] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const loadApps = useCallback(() => {
    setLoading(true);
    ensureSeedData();
    const all = getAllApplications().filter(
      (a) => a.appType === 'Advance Payment Request',
    );
    setApps(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const filtered = apps.filter((a) => {
    if (
      filterAppNo &&
      !a.applicationNo.toLowerCase().includes(filterAppNo.toLowerCase())
    )
      return false;
    const originLabel = a.source === 'Vendor Portal' ? 'Self-Created' : 'Inteluck';
    if (filterSource && originLabel !== filterSource) return false;
    const vpLabel = vpAppStatusLabel(a.status);
    if (filterStatus && vpLabel !== filterStatus) return false;
    return true;
  });

  const handleReset = () => {
    setFilterAppNo('');
    setFilterSource('');
    setFilterStatus('');
  };

  const handleDeleteDraft = (app: SyncedApplication) => {
    Modal.confirm({
      title: 'Delete Draft',
      content: `Are you sure you want to delete draft application ${app.applicationNo}? This action cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => {
        // Remove from localStorage by overwriting with a tombstone — in a real
        // app this would call an API. Here we filter it out.
        const current = getAllApplications().filter(
          (a) => a.applicationNo !== app.applicationNo,
        );
        // Re-seed after deletion to keep the store coherent
        current.forEach(upsertApplication);
        // Clear storage and re-write
        localStorage.removeItem('prepaid-applications-sync');
        current.forEach(upsertApplication);
        message.success('Draft deleted.');
        loadApps();
      },
    });
  };

  const columns: ProColumns<SyncedApplication>[] = [
    {
      title: 'Application Number',
      dataIndex: 'applicationNo',
      width: 180,
      valueType: 'text',
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Application Number' },
      render: (_, record) => {
        const vpLabel = vpAppStatusLabel(record.status);
        const editable = EDITABLE_STATUSES.has(vpLabel);
        return (
          <Button
            type="link"
            style={{ padding: 0, fontWeight: 500 }}
            onClick={() => {
              if (editable) {
                history.push(
                  `${PATHS.ADVANCE_PAYMENT_CREATE}?no=${record.applicationNo}`,
                );
              } else {
                history.push(
                  `${PATHS.ADVANCE_PAYMENT_DETAIL}?no=${record.applicationNo}`,
                );
              }
            }}
          >
            {record.applicationNo}
          </Button>
        );
      },
    },
    {
      title: 'Origin',
      dataIndex: 'source',
      width: 130,
      valueType: 'select',
      formItemProps: { label: null },
      fieldProps: {
        placeholder: 'Origin: All',
        options: [
          { label: 'Self-Created', value: 'Self-Created' },
          { label: 'Inteluck', value: 'Inteluck' },
        ],
      },
      render: (_, record) => {
        const isVP = record.source === 'Vendor Portal';
        return (
          <Tag
            className={`${styles.badgeBase} ${isVP ? styles.originSelf : styles.originInteluck}`}
          >
            {isVP ? 'Self-Created' : 'Inteluck'}
          </Tag>
        );
      },
    },
    {
      title: 'Advance Payment Amount',
      dataIndex: 'totalAmountPayable',
      width: 200,
      align: 'right',
      hideInSearch: true,
      render: (_, record) =>
        record.totalAmountPayable.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 220,
      valueType: 'select',
      formItemProps: { label: null },
      fieldProps: {
        placeholder: 'Status: All',
        options: STATUS_OPTIONS.map((s) => ({ label: s, value: s })),
      },
      render: (_, record) => {
        const vpLabel = vpAppStatusLabel(record.status);
        const { color, style } = getStatusTagProps(vpLabel);
        return (
          <Space direction="vertical" size={2}>
            <Tag color={color} style={style}>
              {vpLabel}
            </Tag>
            {(vpLabel === 'Rejected' || vpLabel === 'Receipt Rejected') &&
              (record.rejectReason || record.hrRejectReason) && (
                <Tooltip title={record.hrRejectReason || record.rejectReason}>
                  <span style={{ fontSize: 11, color: '#cf1322', maxWidth: 200, display: 'block' }}>
                    {(() => {
                      const reason = record.hrRejectReason || record.rejectReason || '';
                      return reason.length > 50 ? reason.slice(0, 50) + '…' : reason;
                    })()}
                  </span>
                </Tooltip>
              )}
          </Space>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: 'var(--character-title-45)' }}>{formatDateTime(record.createdAt)}</span>
      ),
    },
    {
      title: 'Operation',
      valueType: 'option',
      key: 'option',
      width: 140,
      fixed: 'right',
      render: (_, record) => {
        const vpLabel = vpAppStatusLabel(record.status);
        const editable = EDITABLE_STATUSES.has(vpLabel);
        return (
          <Space>
            {editable ? (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() =>
                    history.push(
                      `${PATHS.ADVANCE_PAYMENT_CREATE}?no=${record.applicationNo}`,
                    )
                  }
                >
                  Edit
                </Button>
                {record.status === 'Draft' && (
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteDraft(record)}
                  >
                    Delete
                  </Button>
                )}
              </>
            ) : (
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() =>
                  history.push(
                    `${PATHS.ADVANCE_PAYMENT_DETAIL}?no=${record.applicationNo}`,
                  )
                }
              >
                Detail
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <CustomTable
        loading={loading}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => history.push(PATHS.ADVANCE_PAYMENT_CREATE)}
          >
            Create Advance Payment Request
          </Button>,
        ]}
        rowKey="applicationNo"
        dataSource={filtered}
        columns={columns}
        pagination={{
          showTotal: (total) => `${total} Application(s)`,
          pageSize: 20,
        }}
        manualRequest
        options={false}
        filterSticky={{ top: 56 }}
        onSubmit={(values: any) => {
          setFilterAppNo(values.applicationNo || '');
          setFilterSource(values.source || '');
          setFilterStatus(values.status || '');
        }}
        onReset={handleReset}
      />
    </div>
  );
};

export default AdvancePaymentList;
