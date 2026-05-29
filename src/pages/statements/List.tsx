import React, { useEffect, useMemo, useState } from 'react';
import { history } from '@umijs/max';
import { Button, Tag } from 'antd';
import { ProColumns } from '@ant-design/pro-components';
import CustomTable from '@/components/CustomTable';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import {
  getAllApStatements,
  tmsStatusToVpStatus,
} from '@/pages/common/apStatementSync';
import {
  SAMPLE_STATEMENTS,
  type StatementListRow,
  type VpStatus,
  type StatementOrigin,
  type StatementType,
} from './mock/statementData';
import styles from './index.less';

// ── Constants ─────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: VpStatus[] = [
  'Draft',
  'Awaiting Inteluck Confirmation',
  'Awaiting Re-bill',
  'Pending Payment',
  'Collected',
  'Canceled',
];

// ── Inline badge styles ───────────────────────────────────────────────────────────

const STATUS_STYLE: Record<VpStatus, React.CSSProperties> = {
  Draft: { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  'Awaiting Inteluck Confirmation': { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
  'Awaiting Re-bill': { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
  'Pending Payment': { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  Collected: { background: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' },
  Canceled: { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
};

const ORIGIN_STYLE: Record<StatementOrigin, React.CSSProperties> = {
  'Self-Created': { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
  Inteluck: { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
};

const TYPE_STYLE: Record<StatementType, React.CSSProperties> = {
  Standard: { background: '#f0fcf4', color: 'var(--primary-color)', border: '1px solid #87e8a3', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
  Standalone: { background: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591', borderRadius: 4, padding: '2px 8px', fontSize: 12 },
};

const BASE_BADGE: React.CSSProperties = {
  borderRadius: 4,
  padding: '2px 8px',
  fontSize: 12,
  whiteSpace: 'nowrap',
  display: 'inline-block',
};

// ── Component ─────────────────────────────────────────────────────────────────────

const StatementList: React.FC = () => {
  // Re-sync when localStorage changes from TMS side, and on window focus
  const [storageVer, setStorageVer] = useState(0);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ap-statements-sync') setStorageVer((v) => v + 1);
    };
    const onFocus = () => setStorageVer((v) => v + 1);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const sampleNos = useMemo(() => new Set(SAMPLE_STATEMENTS.map((r) => r.no)), []);

  // Rows synced from localStorage (TMS-side updates)
  const syncedRows = useMemo((): StatementListRow[] => {
    return getAllApStatements()
      .filter((s) => !sampleNos.has(s.no))
      .filter((s) => {
        if (s.source === 'Vendor Portal') return true;
        return s.status === 'Pending Payment' || s.status === 'Paid';
      })
      .map((s) => ({
        no: s.no,
        origin: (s.source === 'Vendor Portal' || s.status === 'Awaiting Comparison'
          ? 'Self-Created'
          : 'Inteluck') as StatementOrigin,
        totalSubmittedAmount: s.totalVpAmount,
        currency: 'PHP',
        statementType: s.statementType,
        waybillCount: s.waybillCount,
        invoiceNo: '—',
        status: tmsStatusToVpStatus(s.status) as VpStatus,
        createdAt: s.createdAt.slice(0, 16).replace('T', ' '),
        rejectReason: s.rejectReason,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageVer, sampleNos]);

  // Status overrides from localStorage for SAMPLE rows
  const syncStatusOverrides = useMemo((): Record<string, VpStatus> => {
    const map: Record<string, VpStatus> = {};
    for (const s of getAllApStatements()) {
      map[s.no] = tmsStatusToVpStatus(s.status) as VpStatus;
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageVer]);

  const syncedNos = useMemo(() => new Set(syncedRows.map((r) => r.no)), [syncedRows]);

  const ALL_ROWS: StatementListRow[] = [
    ...syncedRows,
    ...SAMPLE_STATEMENTS.filter((r) => !syncedNos.has(r.no)),
  ];

  const goDetail = (no: string) => {
    history.push(`${PATHS.VP_STATEMENTS_DETAIL}?no=${encodeURIComponent(no)}`);
  };

  const goCreate = () => {
    history.push(PATHS.VP_STATEMENTS_CREATE);
  };

  const columns: ProColumns<StatementListRow>[] = [
    {
      title: 'Statement No.',
      dataIndex: 'no',
      width: 200,
      valueType: 'text',
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Statement Number' },
      render: (_, record) => (
        <span className={styles.stmtNoLink} onClick={() => goDetail(record.no)}>
          {record.no}
        </span>
      ),
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
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
      render: (_, record) => (
        <span style={ORIGIN_STYLE[record.origin]}>{record.origin}</span>
      ),
    },
    {
      title: 'Total Submitted Amount',
      dataIndex: 'totalSubmittedAmount',
      width: 190,
      align: 'right',
      hideInSearch: true,
      render: (_, record) =>
        record.totalSubmittedAmount > 0 ? (
          <span style={{ fontWeight: 600 }}>
            {record.totalSubmittedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span style={{ color: 'var(--character-title-25)' }}>—</span>
        ),
    },
    {
      title: 'Statement Type',
      dataIndex: 'statementType',
      width: 130,
      valueType: 'select',
      formItemProps: { label: null },
      fieldProps: {
        placeholder: 'Statement Type: All',
        options: [
          { label: 'Standard', value: 'Standard' },
          { label: 'Standalone', value: 'Standalone' },
        ],
      },
      render: (_, record) => (
        <span style={TYPE_STYLE[record.statementType]}>{record.statementType}</span>
      ),
    },
    {
      title: 'Waybills',
      dataIndex: 'waybillCount',
      width: 90,
      align: 'center',
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ color: 'var(--character-title-65)' }}>{record.waybillCount}</span>
      ),
    },
    {
      title: 'Invoice No.',
      dataIndex: 'invoiceNo',
      width: 160,
      valueType: 'text',
      formItemProps: { label: null },
      fieldProps: { placeholder: 'Invoice Number' },
      render: (_, record) => (
        <span style={{ color: record.invoiceNo === '—' ? 'var(--character-title-25)' : 'var(--character-title-85)' }}>
          {record.invoiceNo}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 220,
      valueType: 'select',
      formItemProps: { label: null },
      fieldProps: {
        placeholder: 'Statement Status: All',
        options: STATUS_OPTIONS.map((s) => ({ label: s, value: s })),
      },
      render: (_, record) => {
        const effectiveStatus: VpStatus = syncStatusOverrides[record.no] ?? record.status;
        const syncEntry = getAllApStatements().find((s) => s.no === record.no);
        const effectiveRejectReason = syncEntry?.rejectReason ?? record.rejectReason;
        return (
          <div>
            <span style={{ ...BASE_BADGE, ...STATUS_STYLE[effectiveStatus] }}>
              {effectiveStatus}
            </span>
            {effectiveStatus === 'Awaiting Re-bill' && effectiveRejectReason && (
              <div className={styles.rejectSnippet} title={effectiveRejectReason}>
                {effectiveRejectReason.length > 55
                  ? effectiveRejectReason.slice(0, 55) + '…'
                  : effectiveRejectReason}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ color: 'var(--character-title-65)', fontSize: 12, whiteSpace: 'nowrap' }}>
          {record.createdAt}
        </span>
      ),
    },
    {
      title: 'Operation',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => goDetail(record.no)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <CustomTable
      rowKey="no"
      dataSource={ALL_ROWS}
      columns={columns}
      scroll={{ x: 1400 }}
      pagination={{
        showSizeChanger: true,
        pageSize: 20,
        total: ALL_ROWS.length,
        showTotal: (total) => `Total ${total} statements`,
      }}
      toolBarRender={() => [
        <Button key="create" type="primary" onClick={goCreate}>
          + Create Statement
        </Button>,
      ]}
      manualRequest
      options={false}
      filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      onSubmit={() => {}}
      onReset={() => {}}
    />
  );
};

export default StatementList;
