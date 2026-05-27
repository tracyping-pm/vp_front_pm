import CustomTable from '@/components/CustomTable';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import { ProColumns } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Badge, Button, Card, Switch, Tag, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import styles from './index.less';
import {
  CLAIM_TICKETS,
  type ClaimStatus,
  type DeductionState,
} from './mock/claimTickets';

const VP_STATUSES: ClaimStatus[] = [
  'Pending Confirm',
  'Disputed',
  'For Deduction',
  'Completed',
];

function displayStatus(s: ClaimStatus): ClaimStatus {
  if (s === 'Pending Vendor Confirm') return 'Pending Confirm';
  if (s === 'Vendor Disputed') return 'Disputed';
  return s;
}

function getStatusColor(s: ClaimStatus): string {
  switch (s) {
    case 'Pending Confirm':
    case 'Pending Vendor Confirm':
      return 'orange';
    case 'Disputed':
    case 'Vendor Disputed':
      return 'red';
    case 'For Deduction':
      return 'blue';
    case 'Completed':
      return 'green';
    default:
      return 'default';
  }
}

const STATUS_HELP_TEXT: Partial<Record<ClaimStatus, string>> = {
  'Pending Confirm': 'Awaiting vendor confirmation.',
  Disputed: 'Vendor has submitted a dispute.',
  'For Deduction':
    'Confirmed claim, available for deduction and read-only in detail.',
  Completed: 'Claim ticket has been completed.',
};

const DEDUCTION_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Deduction Status', value: 'all' },
  { label: 'Deducted', value: 'Deducted' },
  { label: 'For Deduction', value: 'For Deduction' },
  { label: 'Not Linked AP', value: 'Not Linked AP' },
  { label: 'Written Off', value: 'Written Off' },
];

const CLAIM_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Claim Type', value: 'all' },
  { label: 'Delivery Claims', value: 'External' },
  { label: 'Internal', value: 'Internal' },
];

const ClaimTicketList: React.FC = () => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Set<ClaimStatus>>(
    new Set(),
  );

  // Visible tickets for VP (filter out internal TMS statuses)
  const visibleTickets = useMemo(
    () =>
      CLAIM_TICKETS.map((t) => ({
        ...t,
        status: displayStatus(t.status),
      })).filter((t) => VP_STATUSES.includes(t.status)),
    [],
  );

  const counts = useMemo(
    () => ({
      total: visibleTickets.length,
      pending: visibleTickets.filter((t) => t.status === 'Pending Confirm')
        .length,
      disputed: visibleTickets.filter((t) => t.status === 'Disputed').length,
      forDeduction: visibleTickets.filter((t) => t.status === 'For Deduction')
        .length,
    }),
    [visibleTickets],
  );

  // Data source with completed toggle and status tag filter
  const dataSource = useMemo(() => {
    let data = visibleTickets;
    if (!showCompleted) {
      data = data.filter((t) => t.status !== 'Completed');
    }
    if (statusFilter.size > 0) {
      data = data.filter((t) => statusFilter.has(t.status));
    }
    return data;
  }, [visibleTickets, showCompleted, statusFilter]);

  const toggleStatus = (s: ClaimStatus) => {
    const next = new Set(statusFilter);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setStatusFilter(next);
  };

  const columns: ProColumns[] = [
    {
      title: 'Ticket No.',
      dataIndex: 'ticketNo',
      width: 180,
      valueType: 'text',
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Ticket No.' },
      render: (_, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() =>
            history.push(
              `${PATHS.CLAIM_TICKETS_DETAIL}?ticketNo=${record.ticketNo}`,
            )
          }
        >
          {record.ticketNo}
        </Button>
      ),
    },
    {
      title: 'Claim Type',
      dataIndex: 'claimTypeL1',
      width: 200,
      valueType: 'select',
      formItemProps: { label: null },
      fieldProps: {
        placeholder: 'Claim Type',
        options: CLAIM_TYPE_OPTIONS,
      },
      render: (_, record) => (
        <div className={styles.claimTypeCell}>
          <div className={styles.l1}>{record.claimTypeL1}</div>
          <div className={styles.l2}>{record.claimTypeL2}</div>
        </div>
      ),
    },
    {
      title: 'Claim Amount (PHP)',
      dataIndex: 'claimAmount',
      width: 160,
      hideInSearch: true,
      align: 'right',
      render: (_, record) =>
        Math.abs(record.claimAmount).toLocaleString('en-US', {
          minimumFractionDigits: 0,
        }),
    },
    {
      title: 'Claimant',
      dataIndex: 'claimant',
      width: 200,
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: 'Responsible Party',
      dataIndex: 'responsibleParty',
      width: 150,
      hideInSearch: true,
    },
    {
      title: 'Related Waybill',
      dataIndex: 'relatedWaybill',
      width: 150,
      hideInSearch: true,
      render: (_, record) =>
        record.relatedWaybill || (
          <span style={{ color: 'var(--character-title-25)' }}>—</span>
        ),
    },
    {
      title: 'Deduction for Vendor',
      dataIndex: 'deductionForVendor',
      width: 170,
      valueType: 'select',
      formItemProps: { label: null },
      fieldProps: {
        placeholder: 'Deduction Status',
        options: DEDUCTION_OPTIONS,
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      hideInSearch: true,
      render: (_, record) => {
        const status = record.status as ClaimStatus;
        return (
          <Tooltip title={STATUS_HELP_TEXT[status]}>
            <Tag color={getStatusColor(status)}>{status}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'creationTime',
      width: 170,
      valueType: 'dateRange',
      formItemProps: { label: null },
      fieldProps: {
        placeholder: ['Start Date', 'End Date'],
      },
      render: (_, record) => (
        <span style={{ color: 'var(--character-title-45)', fontSize: 13 }}>
          {record.creationTime}
        </span>
      ),
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() =>
            history.push(
              `${PATHS.CLAIM_TICKETS_DETAIL}?ticketNo=${record.ticketNo}`,
            )
          }
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.claimTicketsPage}>
      {/* KPI Summary Cards */}
      <div className={styles.kpiRow}>
        <Card className={styles.kpiCard} size="small">
          <div className={styles.kpiLabel}>Total Claim Tickets</div>
          <div className={styles.kpiValue}>{counts.total}</div>
        </Card>
        <Card className={styles.kpiCard} size="small">
          <div className={styles.kpiLabel}>Pending Confirm</div>
          <div className={`${styles.kpiValue} ${styles.orange}`}>
            {counts.pending}
          </div>
        </Card>
        <Card className={styles.kpiCard} size="small">
          <div className={styles.kpiLabel}>Disputed</div>
          <div className={`${styles.kpiValue} ${styles.red}`}>
            {counts.disputed}
          </div>
        </Card>
        <Card className={styles.kpiCard} size="small">
          <div className={styles.kpiLabel}>For Deduction</div>
          <div className={`${styles.kpiValue} ${styles.blue}`}>
            {counts.forDeduction}
          </div>
        </Card>
      </div>

      {/* Status Tag Filter */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div className={styles.statusFilterRow}>
          <span className={styles.statusLabel}>Status:</span>
          {VP_STATUSES.map((s) => (
            <Tooltip key={s} title={STATUS_HELP_TEXT[s]}>
              <Tag
                color={statusFilter.has(s) ? getStatusColor(s) : undefined}
                className={`${styles.statusBtn} ${statusFilter.has(s) ? styles.active : ''}`}
                onClick={() => toggleStatus(s)}
                style={{ cursor: 'pointer' }}
              >
                {s}
              </Tag>
            </Tooltip>
          ))}
          {statusFilter.size > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => setStatusFilter(new Set())}
            >
              Clear
            </Button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            Show Completed
            <Switch
              size="small"
              checked={showCompleted}
              onChange={setShowCompleted}
            />
          </span>
        </div>
        <div className={styles.statusHelpRow}>
          {VP_STATUSES.map((s) => (
            <span key={s}>
              <strong>{s}</strong>: {STATUS_HELP_TEXT[s]}
            </span>
          ))}
        </div>
      </Card>

      {/* Table */}
      <CustomTable
        columns={columns}
        rowKey="ticketNo"
        dataSource={dataSource}
        scroll={{ x: 1500 }}
        pagination={{
          showSizeChanger: true,
          pageSize: 20,
          total: dataSource.length,
        }}
        search={{
          defaultCollapsed: false,
          collapseRender: false,
        }}
        options={false}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
        onSubmit={(values: any) => {
          // Client-side filtering for mock data — in production this calls an API
        }}
        onReset={() => {
          setStatusFilter(new Set());
          setShowCompleted(false);
        }}
      />
    </div>
  );
};

export default ClaimTicketList;
