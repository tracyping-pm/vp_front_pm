import CustomTable from '@/components/CustomTable';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import { history } from '@umijs/max';
import { ProColumns } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  InputNumber,
  message,
  Select,
  Tag,
  Tooltip,
} from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import styles from './index.less';
import {
  type Waybill,
  type WaybillStatus,
  BASE_WAYBILLS,
  buildEffectiveWaybills,
  deriveWaybillStatus,
  SHEET_SYNC_OVERRIDES,
} from './mock/waybills';

// ---- Constants ----

const TRUCK_TYPES = ['4-Wheeler', '6-Wheeler', '10-Wheeler'];

const ALL_STATUSES: WaybillStatus[] = [
  'Pending Price',
  'Billable',
  'Statement Pending',
  'Settled',
];

const STATUS_HELP_TEXT: Record<WaybillStatus, string> = {
  'Pending Price': 'Price to be added to the waybill.',
  Billable: 'This waybill can be selected to create a statement.',
  'Statement Pending':
    'All settlement items of the waybill are linked to other statements.',
  Settled: 'The waybill has been settled.',
};

const STATUS_TAG_CONFIG: Record<
  WaybillStatus,
  { color: string; textColor?: string }
> = {
  'Pending Price': { color: 'warning' },
  Billable: { color: 'success' },
  'Statement Pending': { color: 'default' },
  Settled: { color: 'processing' },
};

const STATUS_CARD_CLASS: Record<WaybillStatus, string> = {
  'Pending Price': 'pendingPrice',
  Billable: 'billable',
  'Statement Pending': 'statementPending',
  Settled: 'settled',
};

const SHEET_URL =
  'https://docs.google.com/spreadsheets/u/2/d/1iDas0CR5--hfrgfVVmGK6_mTOQace_LmG2Yp3KBpB6A/edit?pli=1&gid=0#gid=0';

type EditableAmountField =
  | 'basicAmount'
  | 'additionalCharge'
  | 'exceptionFee'
  | 'reimbursement';

// ---- Helpers ----

function fmtAmt(v: number | null): string {
  if (v === null) return '\u2014';
  return v.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

// ---- Component ----

const WaybillList: React.FC = () => {
  // Filters
  const [filterNo, setFilterNo] = useState('');
  const [filterUnloadTime, setFilterUnloadTime] = useState('');
  const [filterTruckType, setFilterTruckType] = useState('');
  const [filterStatuses, setFilterStatuses] = useState<Set<WaybillStatus>>(
    new Set(['Pending Price', 'Billable', 'Statement Pending']),
  );

  // Sync state
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>(
    'idle',
  );
  const [syncToast, setSyncToast] = useState(false);
  const [syncedOverrides, setSyncedOverrides] = useState<
    Record<string, Partial<Waybill>>
  >({});

  // Inline editing
  const [editingWaybillNo, setEditingWaybillNo] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<
    Record<EditableAmountField, string>
  >({
    basicAmount: '',
    additionalCharge: '',
    exceptionFee: '',
    reimbursement: '',
  });

  // Checkbox selection for Create Statement flow
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Statement pending waybills (mock: waybills already submitted to a statement)
  const [pendingWaybills, setPendingWaybills] = useState<string[]>([]);

  // Prepaid amounts (mock placeholder - in production comes from advance payment requests)
  const prepaidAmountMap = useMemo<Record<string, number>>(() => ({}), []);

  // Build effective waybill list
  const waybills: Waybill[] = buildEffectiveWaybills(
    syncedOverrides,
    prepaidAmountMap,
  );

  const waybillsWithStatus = waybills.map((w) => ({
    ...w,
    status: deriveWaybillStatus(w, pendingWaybills),
  }));

  // Counts per status
  const statusCounts = useMemo(() => {
    const counts: Record<WaybillStatus, number> = {
      'Pending Price': 0,
      Billable: 0,
      'Statement Pending': 0,
      Settled: 0,
    };
    waybillsWithStatus.forEach((w) => {
      counts[w.status]++;
    });
    return counts;
  }, [waybillsWithStatus]);

  // Filtering
  const filtered = waybillsWithStatus.filter((w) => {
    if (!filterStatuses.has(w.status)) return false;
    if (filterNo && !w.no.toLowerCase().includes(filterNo.toLowerCase()))
      return false;
    if (filterUnloadTime && !w.unloadingTime.includes(filterUnloadTime))
      return false;
    if (filterTruckType && w.truckType !== filterTruckType) return false;
    return true;
  });

  const toggleStatusFilter = (s: WaybillStatus) => {
    setFilterStatuses((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  };

  // Sync from Sheet
  const handleSyncFromSheet = () => {
    setSyncState('syncing');
    setTimeout(() => {
      setSyncState('done');
      setSyncedOverrides(SHEET_SYNC_OVERRIDES);
      setSyncToast(true);
      setTimeout(() => {
        setSyncState('idle');
        setSyncToast(false);
      }, 3000);
    }, 1400);
  };

  const handleEditInTemplate = () => {
    window.open(SHEET_URL, '_blank');
  };

  // Inline edit handlers
  const startEdit = (w: Waybill) => {
    setEditingWaybillNo(w.no);
    setEditDraft({
      basicAmount: w.basicAmount === null ? '' : String(w.basicAmount),
      additionalCharge:
        w.additionalCharge === null ? '' : String(w.additionalCharge),
      exceptionFee: w.exceptionFee === null ? '' : String(w.exceptionFee),
      reimbursement: w.reimbursement === null ? '' : String(w.reimbursement),
    });
  };

  const updateEditDraft = (field: EditableAmountField, value: string) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = () => {
    if (!editingWaybillNo) return;
    const toNumberOrNull = (value: string) =>
      value.trim() === '' ? null : Number(value) || 0;
    setSyncedOverrides((prev) => ({
      ...prev,
      [editingWaybillNo]: {
        ...(prev[editingWaybillNo] || {}),
        basicAmount: toNumberOrNull(editDraft.basicAmount),
        additionalCharge: toNumberOrNull(editDraft.additionalCharge),
        exceptionFee: toNumberOrNull(editDraft.exceptionFee),
        reimbursement: toNumberOrNull(editDraft.reimbursement),
      },
    }));
    setEditingWaybillNo(null);
  };

  // Navigate to Create Statement
  const handleCreateStatement = () => {
    history.push(PATHS.STATEMENTS_CREATE);
  };

  // Reset filters
  const handleReset = () => {
    setFilterNo('');
    setFilterUnloadTime('');
    setFilterTruckType('');
  };

  // Render editable amount cell
  const renderEditableAmount = (
    record: Waybill & { status: WaybillStatus },
    field: EditableAmountField,
  ) => {
    if (editingWaybillNo === record.no) {
      return (
        <input
          type="number"
          className={styles.amountInput}
          value={editDraft[field]}
          placeholder="0.00"
          onChange={(e) => updateEditDraft(field, e.target.value)}
        />
      );
    }
    const val = record[field];
    if (val === null) return <span className={styles.amountPlaceholder}>{'\u2014'}</span>;
    return fmtAmt(val);
  };

  // ---- ProColumns definition ----
  const columns: ProColumns[] = [
    {
      title: 'Waybill No.',
      dataIndex: 'no',
      width: 120,
      hideInSearch: true,
      render: (_, record) => (
        <span className={styles.waybillNo}>{record.no}</span>
      ),
    },
    {
      title: 'Position Time',
      dataIndex: 'positionTime',
      width: 150,
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: 'var(--character-title-65)' }}>
          {record.positionTime}
        </span>
      ),
    },
    {
      title: 'Unloading Time',
      dataIndex: 'unloadingTime',
      width: 150,
      hideInSearch: true,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: 'var(--character-title-65)' }}>
          {record.unloadingTime}
        </span>
      ),
    },
    {
      title: 'Truck Type',
      dataIndex: 'truckType',
      width: 100,
      hideInSearch: true,
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      width: 160,
      hideInSearch: true,
      ellipsis: true,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: 'var(--character-title-65)' }}>
          {record.origin}
        </span>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      width: 170,
      hideInSearch: true,
      ellipsis: true,
      render: (_, record) => (
        <span style={{ fontSize: 12, color: 'var(--character-title-65)' }}>
          {record.destination}
        </span>
      ),
    },
    {
      title: 'Waybill Amount',
      dataIndex: 'waybillAmount',
      width: 130,
      align: 'right',
      hideInSearch: true,
      render: (_, record) => fmtAmt(record.waybillAmount),
    },
    {
      title: 'Basic Amount',
      dataIndex: 'basicAmount',
      width: 130,
      align: 'right',
      hideInSearch: true,
      render: (_, record) => renderEditableAmount(record, 'basicAmount'),
    },
    {
      title: 'Advance Payment',
      dataIndex: 'prepaidAmount',
      width: 130,
      align: 'right',
      hideInSearch: true,
      render: (_, record) => {
        const hasPrepaid =
          record.prepaidAmount !== null && record.prepaidAmount > 0;
        return (
          <span className={hasPrepaid ? styles.prepaidHighlight : undefined}>
            {fmtAmt(record.prepaidAmount)}
          </span>
        );
      },
    },
    {
      title: 'Additional Charge',
      dataIndex: 'additionalCharge',
      width: 130,
      align: 'right',
      hideInSearch: true,
      render: (_, record) => renderEditableAmount(record, 'additionalCharge'),
    },
    {
      title: 'Exception Fee',
      dataIndex: 'exceptionFee',
      width: 120,
      align: 'right',
      hideInSearch: true,
      render: (_, record) => renderEditableAmount(record, 'exceptionFee'),
    },
    {
      title: 'Reimbursement',
      dataIndex: 'reimbursement',
      width: 120,
      align: 'right',
      hideInSearch: true,
      render: (_, record) => renderEditableAmount(record, 'reimbursement'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <Tooltip title={STATUS_HELP_TEXT[record.status as WaybillStatus]}>
          <Tag color={STATUS_TAG_CONFIG[record.status as WaybillStatus]?.color}>
            {record.status}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 150,
      hideInSearch: true,
      render: (_, record) => (
        <span
          style={{ fontSize: 12, color: 'var(--character-title-65)', whiteSpace: 'nowrap' }}
        >
          {record.createdAt}
        </span>
      ),
    },
    {
      title: 'Operation',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 120,
      render: (_, record) => {
        const isBillable = record.status === 'Billable';
        const isPendingPrice = record.status === 'Pending Price';
        const isEditing = editingWaybillNo === record.no;

        if (isBillable || isPendingPrice) {
          if (isEditing) {
            return (
              <div className={styles.operationCell}>
                <Button type="link" size="small" onClick={saveEdit}>
                  Save
                </Button>
                <Button
                  type="link"
                  size="small"
                  style={{ color: '#999' }}
                  onClick={() => setEditingWaybillNo(null)}
                >
                  Cancel
                </Button>
              </div>
            );
          }
          return (
            <Button
              type="link"
              size="small"
              onClick={() => startEdit(record)}
            >
              Edit
            </Button>
          );
        }
        return <span style={{ fontSize: 12, color: '#ccc' }}>{'\u2014'}</span>;
      },
    },
  ];

  // Row class name for dimmed rows
  const rowClassName = (record: any) => {
    if (record.status === 'Settled' || record.status === 'Statement Pending') {
      return styles.dimmedRow;
    }
    return '';
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: any) => ({
      disabled:
        record.status === 'Settled' ||
        record.status === 'Statement Pending' ||
        record.status === 'Pending Price',
    }),
  };

  // Toolbar
  const toolBarRender = () => [
    <Button key="create" type="primary" onClick={handleCreateStatement}>
      + Create Statement
    </Button>,
  ];

  return (
    <div className={styles.waybillsPage}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.pageTitle}>Billable Waybills</div>
          <div className={styles.pageSubtitle}>
            All waybills of the settleable items.
          </div>
        </div>
      </div>

      {/* Status stats bar */}
      <div className={styles.statsBar}>
        {ALL_STATUSES.map((s) => {
          const active = filterStatuses.has(s);
          return (
            <div
              key={s}
              className={`${styles.statCard} ${active ? styles.active : ''} ${
                active ? styles[STATUS_CARD_CLASS[s]] : ''
              }`}
              onClick={() => toggleStatusFilter(s)}
            >
              <div className={styles.statCount}>{statusCounts[s]}</div>
              <div className={styles.statLabel}>{s}</div>
              <div className={styles.statHelp}>{STATUS_HELP_TEXT[s]}</div>
            </div>
          );
        })}
      </div>

      {/* Upload Own Data panel */}
      <div className={styles.uploadPanel}>
        <div className={styles.uploadPanelContent}>
          <div className={styles.uploadPanelTitle}>Upload Own Data</div>
          <div className={styles.uploadPanelDesc}>
            If you maintain your own pricing records, Edit in the template, fill
            in your amounts, then sync.
          </div>
        </div>
        <div className={styles.uploadPanelActions}>
          <Button onClick={handleEditInTemplate}>Edit in Template</Button>
          <Button
            type="primary"
            loading={syncState === 'syncing'}
            disabled={syncState !== 'idle'}
            onClick={handleSyncFromSheet}
            style={
              syncState === 'done'
                ? { background: '#52c41a', borderColor: '#52c41a' }
                : undefined
            }
          >
            {syncState === 'idle' && 'Sync from Sheet'}
            {syncState === 'syncing' && 'Syncing...'}
            {syncState === 'done' && 'Synced'}
          </Button>
        </div>
      </div>

      {/* Sync success toast */}
      {syncToast && (
        <div className={styles.syncToast}>
          <span className={styles.syncToastIcon}>&#10003;</span>
          <span>
            Sheet data synced successfully. Waybill amounts updated — status
            changed to <strong>Billable</strong>.
          </span>
        </div>
      )}

      {/* Prepaid info tip */}
      {Object.keys(prepaidAmountMap).length > 0 && (
        <div className={styles.prepaidTip}>
          <span>&#9432;</span>
          <span>
            Advance Payment amounts for{' '}
            <strong>{Object.keys(prepaidAmountMap).length}</strong> waybill(s)
            populated from submitted Advance Payment Requests.
          </span>
        </div>
      )}

      {/* Filter bar with status checkboxes */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        bodyStyle={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
      >
        <Input
          placeholder="Waybill No."
          value={filterNo}
          onChange={(e) => setFilterNo(e.target.value)}
          style={{ width: 150 }}
          allowClear
        />
        <Input
          placeholder="Unloading Time"
          value={filterUnloadTime}
          onChange={(e) => setFilterUnloadTime(e.target.value)}
          style={{ width: 150 }}
          allowClear
        />
        <Select
          placeholder="Truck Type"
          value={filterTruckType || undefined}
          onChange={(val) => setFilterTruckType(val || '')}
          style={{ width: 140 }}
          allowClear
          options={TRUCK_TYPES.map((t) => ({ label: t, value: t }))}
        />
        <div className={styles.statusFilterGroup}>
          {ALL_STATUSES.map((s) => (
            <Tooltip key={s} title={STATUS_HELP_TEXT[s]}>
              <label className={styles.statusFilterLabel}>
                <Checkbox
                  checked={filterStatuses.has(s)}
                  onChange={() => toggleStatusFilter(s)}
                />
                {s}
              </label>
            </Tooltip>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Button onClick={handleReset}>Reset</Button>
          <Button type="primary">Search</Button>
        </div>
      </Card>

      {/* Table */}
      <CustomTable
        columns={columns}
        dataSource={filtered}
        rowKey="no"
        scroll={{ x: 1800 }}
        rowSelection={rowSelection}
        search={false}
        pagination={{
          showSizeChanger: true,
          pageSize: 20,
          total: filtered.length,
        }}
        loading={false}
        toolBarRender={toolBarRender}
        manualRequest
        rowClassName={rowClassName}
        options={false}
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />

      {/* Selected count bar */}
      {selectedRowKeys.length > 0 && (
        <Alert
          type="info"
          showIcon
          message={
            <span>
              <strong>{selectedRowKeys.length}</strong> waybill(s) selected.{' '}
              <Button type="link" size="small" onClick={handleCreateStatement}>
                Create Statement with selected
              </Button>
            </span>
          }
          style={{ marginTop: 12 }}
        />
      )}
    </div>
  );
};

export default WaybillList;
