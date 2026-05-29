import React, { useEffect, useState } from 'react';
import { history, useSearchParams } from '@umijs/max';
import { Button, Card, message, Modal } from 'antd';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import {
  getAllApStatements,
  tmsStatusToVpStatus,
  upsertApStatement,
  appendApStmtLog,
  type SyncedApStatement,
} from '@/pages/common/apStatementSync';
import {
  STATEMENT_DETAIL_MAP,
  type VpStatus,
  type StatementDetailData,
  type InvoiceEntry,
  type MiscChargeRow,
  type StandaloneInvoiceRow,
  type StandaloneProofRow,
} from './mock/statementData';
import { BASE_WAYBILL_POOL, ALL_CLAIM_TICKETS, type StatementWaybillRow, type StatementClaimRow } from './mock/waybills';
import styles from './index.less';

// ── Types ─────────────────────────────────────────────────────────────────────

const STATUS_BADGE_STYLE: Record<VpStatus, React.CSSProperties> = {
  Draft: { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  'Awaiting Inteluck Confirmation': { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
  'Awaiting Re-bill': { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
  'Pending Payment': { background: '#e6f4ff', color: '#0958d9', border: '1px solid #91caff' },
  Collected: { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  Canceled: { background: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' },
};

const SOURCE_BADGE_STYLE: Record<'Self-Created' | 'Inteluck', React.CSSProperties> = {
  'Self-Created': { background: '#f5f5f5', color: '#595959', border: '1px solid #d9d9d9' },
  Inteluck: { background: '#f0f5ff', color: '#2f54eb', border: '1px solid #adc6ff' },
};

const BADGE_BASE: React.CSSProperties = { borderRadius: 4, padding: '3px 12px', fontSize: 13, display: 'inline-block' };

const NUM_FMT = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

type ItemKey = 'basicAmount' | 'additionalCharge' | 'exceptionFee' | 'reimbursement' | 'claimDeduction';
const ITEM_LABELS: Record<ItemKey, string> = {
  basicAmount: 'Basic Amount',
  additionalCharge: 'Additional Charge',
  exceptionFee: 'Exception Fee',
  reimbursement: 'Reimbursement',
  claimDeduction: 'Claim Deduction',
};
const ITEM_KEYS: ItemKey[] = ['basicAmount', 'additionalCharge', 'exceptionFee', 'reimbursement', 'claimDeduction'];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.sectionTitleRow}>
      <span className={styles.sectionBar} />
      <span className={styles.sectionTitle}>{children}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const StatementDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const stmtNo = searchParams.get('no') || '';

  // Derive status from localStorage or fallback to mock
  const [storageVer, setStorageVer] = useState(0);
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'ap-statements-sync') setStorageVer((v) => v + 1);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const syncEntry: SyncedApStatement | undefined = getAllApStatements().find((s) => s.no === stmtNo);

  // Resolve data
  const staticData: StatementDetailData | undefined = STATEMENT_DETAIL_MAP[stmtNo];

  // Build effective data: prefer mock (for existing statements), fall back to
  // reconstructing from the localStorage sync entry (for newly created statements).
  const data: StatementDetailData | undefined = staticData
    ? {
        ...staticData,
        rejectReason: syncEntry?.rejectReason ?? staticData.rejectReason,
        operationLog: syncEntry?.operationLogs
          ? syncEntry.operationLogs.map((l) => ({
              timestamp: l.time,
              action: l.action,
              operator: l.actor,
              subLine: l.note,
            }))
          : staticData.operationLog,
      }
    : syncEntry
    ? {
        source: syncEntry.source === 'Vendor Portal' ? 'Self-Created' : 'Inteluck',
        statementType: syncEntry.statementType,
        reconciliationPeriod: syncEntry.reconciliationPeriod,
        taxMark: syncEntry.taxMark,
        totalAmountPayable: syncEntry.totalVpAmount,
        createDate: syncEntry.createdAt,
        waybills: syncEntry.waybills.map((w) => ({
          no: w.no,
          waybillAmount: w.basicAmount + w.additionalCharge + w.exceptionFee,
          basicAmount: w.basicAmount,
          prepaidAmount: 0,
          additionalCharge: w.additionalCharge,
          exceptionFee: w.exceptionFee,
          reimbursement: w.reimbursement,
          positionTime: w.positionTime,
          unloadingTime: w.unloadingTime,
          truckType: w.truckType,
          origin: w.origin,
          destination: w.destination,
        })),
        claimTickets: syncEntry.claims.map((c) => ({
          ticketNo: c.no,
          claimType: c.type,
          relatedWaybill: c.waybillNo,
          claimAmount: c.amount,
        })),
        waybillContractCost: syncEntry.totalVpAmount,
        vendorBasicAmount: syncEntry.waybills.reduce((s, w) => s + w.basicAmount, 0),
        prepaidAmount: 0,
        vendorExceptionFee: syncEntry.waybills.reduce((s, w) => s + w.exceptionFee, 0),
        vendorAdditionalCharge: syncEntry.waybills.reduce((s, w) => s + w.additionalCharge, 0),
        kpiClaim: syncEntry.claims.reduce((s, c) => s + c.amount, 0),
        vat: syncEntry.vatAmount,
        wht: syncEntry.whtAmount,
        miscCharges: syncEntry.miscCharges,
        standaloneInvoices: syncEntry.standaloneInvoices,
        standaloneProofs: syncEntry.standaloneProofs,
        operationLog: syncEntry.operationLogs?.map((l) => ({
          timestamp: l.time,
          action: l.action,
          operator: l.actor,
          subLine: l.note,
        })),
        rejectReason: syncEntry.rejectReason,
      }
    : undefined;

  // Resolve status
  const rawStatus: VpStatus = syncEntry
    ? (tmsStatusToVpStatus(syncEntry.status) as VpStatus)
    : (data ? (STATEMENT_DETAIL_MAP[stmtNo] ? 'Draft' : 'Draft') : 'Draft');

  // Determine effective status from list mock
  const { SAMPLE_STATEMENTS } = require('./mock/statementData');
  const listRow = SAMPLE_STATEMENTS.find((r: any) => r.no === stmtNo);
  const status: VpStatus = syncEntry
    ? (tmsStatusToVpStatus(syncEntry.status) as VpStatus)
    : (listRow?.status ?? 'Draft');

  // ── Mutable local state ────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState<'waybills' | 'tickets'>('waybills');

  const [checkedItems, setCheckedItems] = useState<Record<ItemKey, boolean>>({
    basicAmount: true,
    additionalCharge: true,
    exceptionFee: true,
    reimbursement: true,
    claimDeduction: true,
  });

  const [vatRate, setVatRate] = useState('0');
  const [whtRate, setWhtRate] = useState('0');

  const [localWaybills, setLocalWaybills] = useState<StatementWaybillRow[]>(() => data?.waybills ?? []);
  const [localInvoices, setLocalInvoices] = useState<InvoiceEntry[]>(() => data?.invoices ?? []);
  const [localClaims, setLocalClaims] = useState<StatementClaimRow[]>(() => data?.claimTickets ?? []);
  const [localMiscCharges, setLocalMiscCharges] = useState<MiscChargeRow[]>(() => data?.miscCharges ?? []);
  const [localStandaloneInvoices, setLocalStandaloneInvoices] = useState<StandaloneInvoiceRow[]>(() => data?.standaloneInvoices ?? []);
  const [localStandaloneProofs, setLocalStandaloneProofs] = useState<StandaloneProofRow[]>(() => data?.standaloneProofs ?? []);

  // Modal states
  const [showAddWaybill, setShowAddWaybill] = useState(false);
  const [addWaybillNo, setAddWaybillNo] = useState('');
  const [showAddClaim, setShowAddClaim] = useState(false);
  const [addClaimNo, setAddClaimNo] = useState('');
  const [showEditWaybills, setShowEditWaybills] = useState(false);
  const [editAmounts, setEditAmounts] = useState<Record<string, string>>({});
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ no: '', amount: '', date: '' });

  // Standalone modals
  const [showAddMiscCharge, setShowAddMiscCharge] = useState(false);
  const [editMiscIdx, setEditMiscIdx] = useState<number | null>(null);
  const [miscChargeForm, setMiscChargeForm] = useState({ object: '', amount: '', proof: '' });
  const [showAddStandaloneInvoice, setShowAddStandaloneInvoice] = useState(false);
  const [standaloneInvoiceForm, setStandaloneInvoiceForm] = useState({ number: '', amount: '', date: '', proof: '' });
  const [showAddStandaloneProof, setShowAddStandaloneProof] = useState(false);
  const [standaloneProofForm, setStandaloneProofForm] = useState({ message: '' });

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (!data) {
    return (
      <div className={styles.statementDetail}>
        <Button type="link" onClick={() => history.push(PATHS.VP_STATEMENTS)}>
          ← Back to My Statements
        </Button>
        <div style={{ marginTop: 16, color: '#bbb', textAlign: 'center', padding: 32 }}>
          Statement data not found.
        </div>
      </div>
    );
  }

  const isStandalone = data.statementType === 'Standalone';

  // ── Helper: build full SyncedApStatement from current local state ─────────

  const buildSyncPayload = (newStatus: import('@/pages/common/apStatementSync').SyncedApStmtStatus, now: string, extraLog?: { time: string; actor: string; action: string; note?: string }): import('@/pages/common/apStatementSync').SyncedApStatement => {
    const prevLogs = syncEntry?.operationLogs ?? [];
    const logs = extraLog ? [...prevLogs, extraLog] : prevLogs;
    return {
      no: stmtNo,
      vendorName: syncEntry?.vendorName ?? 'ACAA Trucking Services',
      source: source === 'Self-Created' ? 'Vendor Portal' : 'Internal',
      status: newStatus,
      statementType: data.statementType ?? 'Standard',
      reconciliationPeriod: data.reconciliationPeriod,
      taxMark: data.taxMark as any,
      vatRate: Number(vatRate),
      whtRate: Number(whtRate),
      vatAmount,
      whtAmount,
      settlementItems: Object.entries(checkedItems).filter(([, v]) => v).map(([k]) => k),
      totalVpAmount: data.totalAmountPayable,
      waybillCount: localWaybills.length,
      waybills: localWaybills.map((w) => ({
        no: w.no,
        positionTime: w.positionTime,
        unloadingTime: w.unloadingTime,
        truckType: w.truckType,
        origin: w.origin,
        destination: w.destination,
        basicAmount: w.basicAmount,
        additionalCharge: w.additionalCharge,
        exceptionFee: w.exceptionFee,
        reimbursement: w.reimbursement,
      })),
      claims: localClaims.map((c) => ({
        no: c.ticketNo,
        type: c.claimType,
        amount: c.claimAmount,
        waybillNo: c.relatedWaybill || '',
      })),
      createdAt: syncEntry?.createdAt ?? data.createDate,
      submittedAt: newStatus === 'Awaiting Comparison' ? now : syncEntry?.submittedAt,
      rejectReason: syncEntry?.rejectReason,
      itemChecks: syncEntry?.itemChecks,
      returnedItems: syncEntry?.returnedItems,
      operationLogs: logs,
      miscCharges: isStandalone && localMiscCharges.length > 0 ? localMiscCharges : undefined,
      standaloneInvoices: isStandalone && localStandaloneInvoices.length > 0 ? localStandaloneInvoices : undefined,
      standaloneProofs: isStandalone && localStandaloneProofs.length > 0 ? localStandaloneProofs : undefined,
    };
  };

  // ── Derived flags ──────────────────────────────────────────────────────────

  const isEditable = status === 'Draft' || status === 'Awaiting Re-bill';
  const hasRemove = status === 'Draft' || status === 'Awaiting Re-bill';
  const invoiceReadonly = ['Pending Payment', 'Collected'].includes(status);
  const showPayment = ['Pending Payment', 'Collected'].includes(status);
  const { source, reconciliationPeriod, taxMark, totalAmountPayable, createDate, payments, operationLog, rejectReason } = data;

  // ── Amount calculations (editable Standard mode) ───────────────────────────

  const calcBasicAmount = checkedItems.basicAmount ? localWaybills.reduce((s, r) => s + r.basicAmount, 0) : 0;
  const calcAdditionalCharge = checkedItems.additionalCharge ? localWaybills.reduce((s, r) => s + r.additionalCharge, 0) : 0;
  const calcExceptionFee = checkedItems.exceptionFee ? localWaybills.reduce((s, r) => s + r.exceptionFee, 0) : 0;
  const calcReimbursement = checkedItems.reimbursement ? localWaybills.reduce((s, r) => s + r.reimbursement, 0) : 0;
  const calcClaimDeduction = checkedItems.claimDeduction ? localClaims.reduce((s, t) => s + t.claimAmount, 0) : 0;
  const waybillSubtotal = calcBasicAmount + calcAdditionalCharge + calcExceptionFee + calcReimbursement;
  const vatAmount = Math.round(waybillSubtotal * Number(vatRate) / 100);
  const whtAmount = Math.round(waybillSubtotal * Number(whtRate) / 100);
  const calculatedTotal = waybillSubtotal - calcClaimDeduction + vatAmount - whtAmount;

  // ── Billable waybill pool for Add Waybill modal ────────────────────────────

  const billableWaybillPool = [
    ...data.waybills,
    ...BASE_WAYBILL_POOL,
  ].filter((w, idx, arr) => arr.findIndex((item) => item.no === w.no) === idx);

  const availableBillableWaybills = billableWaybillPool.filter(
    (w) => !localWaybills.some((row) => row.no === w.no),
  );

  const availableClaimTickets = [
    ...data.claimTickets,
    ...ALL_CLAIM_TICKETS,
  ]
    .filter((t, idx, arr) => arr.findIndex((item) => item.ticketNo === t.ticketNo) === idx)
    .filter((t) => !localClaims.some((row) => row.ticketNo === t.ticketNo));

  // ── Amount Summary render (Standard, non-editable) ─────────────────────────

  const renderAmountSummary = () => {
    const vpBasic = data.vendorBasicAmount;
    const vpAdditional = data.vendorAdditionalCharge;
    const vpException = data.vendorExceptionFee;
    const vpWaybillTotal = vpBasic + vpAdditional + vpException;
    const claimTotal = data.kpiClaim;
    const vpVat = data.vat;
    const vpWht = Math.abs(data.wht);
    const vpOthersTotal = vpVat - vpWht;
    const vpTotalPayable = vpWaybillTotal + claimTotal + vpOthersTotal;

    const f = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

    const AmountRow = ({ label, amount, strong = false }: { label: string; amount: number; strong?: boolean }) => (
      <div className={`${styles.amountRow} ${strong ? styles.amountRowStrong : ''}`}>
        <span className={styles.amountCell} style={{ fontWeight: strong ? 700 : 400 }}>{label}</span>
        <span className={styles.amountNumCell}>{f(amount)}</span>
      </div>
    );

    const head = (
      <div className={styles.amountHead}>
        <span className={styles.amountCell}>Item</span>
        <span className={styles.amountNumCell}>Amount</span>
      </div>
    );

    return (
      <div className={styles.sectionCard}>
        <SectionTitle>Amount Summary</SectionTitle>
        <div className={styles.amountSummaryTotal}>
          <span className={styles.amountSummaryTotalLabel}>Total Amount Receivable</span>
          <span className={styles.amountSummaryTotalValue}>{f(vpTotalPayable)}</span>
        </div>
        <div className={styles.amountSummaryColumns}>
          <div className={styles.amountSummaryCol}>
            <div className={styles.amountColTitle}>Waybill Contract Price</div>
            <div className={styles.amountInnerTable}>
              {head}
              <AmountRow label="Waybill Contract Price" amount={vpWaybillTotal} strong />
              <div style={{ borderTop: '1px solid #f5f5f5' }}>
                <AmountRow label="Basic Amount" amount={vpBasic} />
                <AmountRow label="Additional Charge" amount={vpAdditional} />
                <AmountRow label="Exception Fee" amount={vpException} />
              </div>
            </div>
          </div>
          <div className={styles.amountSummaryCol}>
            <div className={styles.amountColTitle}>Claim</div>
            <div className={styles.amountInnerTable}>
              {head}
              <AmountRow label="Claim" amount={claimTotal} strong />
              <div style={{ borderTop: '1px solid #f5f5f5' }}>
                <AmountRow label="KPI Claim" amount={claimTotal} />
              </div>
            </div>
          </div>
          <div className={styles.amountSummaryCol} style={{ borderRight: 'none' }}>
            <div className={styles.amountColTitle}>Others</div>
            <div className={styles.amountInnerTable}>
              {head}
              <AmountRow label="Others" amount={vpOthersTotal} strong />
              <div style={{ borderTop: '1px solid #f5f5f5' }}>
                <AmountRow label="VAT" amount={vpVat} />
                <AmountRow label="WHT" amount={vpWht} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.statementDetail}>
      <BreadcrumbCase
        items={[
          { name: 'My Statements', path: PATHS.VP_STATEMENTS },
          { name: stmtNo, path: PATHS.VP_STATEMENTS_DETAIL },
        ]}
      />

      {/* ── Status header bar ── */}
      <div className={styles.headerBar}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#333', marginRight: 4 }}>{stmtNo}</span>
        <span className={styles.statusBadge} style={STATUS_BADGE_STYLE[status]}>{status}</span>
        <span className={styles.statusBadge} style={{ ...BADGE_BASE, ...SOURCE_BADGE_STYLE[source] }}>{source}</span>
        <div style={{ flex: 1 }} />
        {isEditable && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={() => {
              const now = new Date().toISOString();
              upsertApStatement(buildSyncPayload('Draft', now, { time: now, actor: 'Vendor', action: 'Saved as Draft' }));
              showToast('Draft saved successfully.');
            }}>Save as Draft</Button>
            <Button
              type="primary"
              onClick={() => {
                const now = new Date().toISOString();
                upsertApStatement(buildSyncPayload('Awaiting Comparison', now, { time: now, actor: 'Vendor', action: 'Submitted' }));
                showToast('Statement submitted to TMS.');
              }}
            >
              Submit to TMS
            </Button>
          </div>
        )}
      </div>

      {/* ── Rejection banner ── */}
      {status === 'Awaiting Re-bill' && rejectReason && (
        <div className={styles.rejectBanner}>
          <div className={styles.rejectBannerTitle}>Statement rejected</div>
          <div style={{ color: '#333', marginBottom: 4 }}>Reject Reason: {rejectReason}</div>
          <div style={{ color: '#666' }}>Waiting for vendor to revise and resubmit via Vendor Portal.</div>
        </div>
      )}

      {/* ── Basic Information ── */}
      <div className={styles.sectionCard}>
        <SectionTitle>Basic information</SectionTitle>
        <div className={styles.infoGrid}>
          <div>
            <div className={styles.infoLabel}>Reconciliation Period</div>
            <div>{reconciliationPeriod}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Statement Tax Mark</div>
            <div>{taxMark}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Total Amount Receivable</div>
            <div className={styles.infoValue}>{NUM_FMT(totalAmountPayable)}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Create date</div>
            <div>{createDate}</div>
          </div>
        </div>

        {/* Settlement items — Standard only */}
        {!isStandalone && (
          <div style={{ marginTop: 14, borderTop: '1px solid #f5f5f5', paddingTop: 14, fontSize: 13 }}>
            <div className={styles.infoLabel} style={{ marginBottom: 8 }}>Settlement Items</div>
            {isEditable ? (
              <div className={styles.settlementItems}>
                {ITEM_KEYS.map((key) => (
                  <label
                    key={key}
                    className={`${styles.settlementItemLabel} ${checkedItems[key] ? styles.checked : ''}`}
                    onClick={() => setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }))}
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems[key]}
                      onChange={(e) => setCheckedItems((prev) => ({ ...prev, [key]: e.target.checked }))}
                      style={{ accentColor: '#1677ff' }}
                    />
                    {ITEM_LABELS[key]}
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ color: '#333' }}>
                {ITEM_KEYS.filter((k) => checkedItems[k]).map((k) => ITEM_LABELS[k]).join(' / ') || '—'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Standalone: Amount Summary / Invoice / Proof ── */}
      {isStandalone && (
        <>
          {/* Misc Charges */}
          <div className={styles.sectionCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <SectionTitle>Amount Summary</SectionTitle>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button type="link" size="small">Miscellaneous Charge Edit History</Button>
                {isEditable && (
                  <Button
                    size="small"
                    onClick={() => {
                      setMiscChargeForm({ object: '', amount: '', proof: '' });
                      setEditMiscIdx(null);
                      setShowAddMiscCharge(true);
                    }}
                  >
                    + Add Row
                  </Button>
                )}
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Miscellaneous Charge Object</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>Proof</th>
                  {isEditable && <th style={{ width: 120, padding: '8px 12px' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {localMiscCharges.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '8px 12px' }}>{m.object || <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{NUM_FMT(m.amount)}</td>
                    <td style={{ padding: '8px 12px', color: '#1677ff' }}>{m.proof || <span style={{ color: '#bbb' }}>—</span>}</td>
                    {isEditable && (
                      <td style={{ padding: '8px 12px' }}>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            setMiscChargeForm({ object: m.object, amount: String(m.amount), proof: m.proof });
                            setEditMiscIdx(i);
                            setShowAddMiscCharge(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={() => {
                            setLocalMiscCharges((prev) => prev.filter((_, j) => j !== i));
                            showToast('Row removed.');
                          }}
                        >
                          Remove
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
                {localMiscCharges.length === 0 && (
                  <tr>
                    <td colSpan={isEditable ? 4 : 3} style={{ padding: '24px 0', textAlign: 'center', color: '#bbb' }}>
                      No miscellaneous charges.
                    </td>
                  </tr>
                )}
                <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                  <td style={{ padding: '8px 12px' }}>Total Amount</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#1677ff' }}>
                    {NUM_FMT(localMiscCharges.reduce((s, m) => s + m.amount, 0))}
                  </td>
                  <td />
                  {isEditable && <td />}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Standalone Invoice Management */}
          <div className={styles.sectionCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <SectionTitle>Invoice Management</SectionTitle>
              {isEditable && (
                <Button
                  size="small"
                  onClick={() => {
                    setStandaloneInvoiceForm({ number: '', amount: '', date: '', proof: '' });
                    setShowAddStandaloneInvoice(true);
                  }}
                >
                  + Add Invoice
                </Button>
              )}
            </div>
            {localStandaloneInvoices.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
                No invoices added.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Invoice Number</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Invoice Amount</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Invoice Date</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Invoice Proof</th>
                    {isEditable && <th style={{ width: 80, padding: '8px 12px' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {localStandaloneInvoices.map((inv, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '8px 12px' }}>{inv.number}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>{NUM_FMT(inv.amount)}</td>
                      <td style={{ padding: '8px 12px' }}>{inv.date}</td>
                      <td style={{ padding: '8px 12px', color: '#1677ff' }}>{inv.proof || <span style={{ color: '#bbb' }}>—</span>}</td>
                      {isEditable && (
                        <td style={{ padding: '8px 12px' }}>
                          <Button
                            type="link"
                            size="small"
                            danger
                            onClick={() => {
                              setLocalStandaloneInvoices((prev) => prev.filter((_, j) => j !== i));
                              showToast(`Invoice ${inv.number} voided.`);
                            }}
                          >
                            Void
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Standalone Proof */}
          <div className={styles.sectionCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <SectionTitle>Proof</SectionTitle>
              {isEditable && (
                <Button
                  size="small"
                  onClick={() => {
                    setStandaloneProofForm({ message: '' });
                    setShowAddStandaloneProof(true);
                  }}
                >
                  + Add Proof
                </Button>
              )}
            </div>
            {localStandaloneProofs.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
                No proof message records.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {localStandaloneProofs.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, minWidth: 130, paddingTop: 4 }}>Message Records</div>
                    <div style={{ flex: 1, fontSize: 13, color: '#333', padding: 8, background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 4, minHeight: 36 }}>
                      {p.message || <span style={{ color: '#bbb' }}>—</span>}
                    </div>
                    {isEditable && (
                      <Button
                        type="link"
                        size="small"
                        danger
                        style={{ paddingTop: 8, flexShrink: 0 }}
                        onClick={() => {
                          setLocalStandaloneProofs((prev) => prev.filter((_, j) => j !== i));
                          showToast('Proof removed.');
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Collection (Pending Payment / Collected) ── */}
      {showPayment && (
        <div className={styles.sectionCard}>
          <SectionTitle>Collection</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Payable Amount</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Collection Status</th>
                {status === 'Collected' && <th style={{ padding: '8px 12px', fontWeight: 600 }}>Proof</th>}
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Bank Name</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Bank Account Name</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Bank Account No</th>
              </tr>
            </thead>
            <tbody>
              {(payments ?? []).slice(0, 1).map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{NUM_FMT(p.payableAmount)}</td>
                  <td style={{ padding: '8px 12px' }}>{p.paymentStatus}</td>
                  {status === 'Collected' && (
                    <td style={{ padding: '8px 12px' }}>
                      {p.proofName ? (
                        <span style={{ color: '#1677ff', cursor: 'pointer' }}>{p.proofName}</span>
                      ) : (
                        <span style={{ color: '#bbb' }}>—</span>
                      )}
                    </td>
                  )}
                  <td style={{ padding: '8px 12px' }}>{p.bankName}</td>
                  <td style={{ padding: '8px 12px' }}>{p.bankAccountName}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{p.bankAccountNo}</td>
                </tr>
              ))}
              {(payments ?? []).length === 0 && (
                <tr>
                  <td colSpan={status === 'Collected' ? 6 : 5} style={{ padding: '24px 0', textAlign: 'center', color: '#bbb' }}>
                    No collection records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Settlement Details (Standard only) ── */}
      {!isStandalone && (
        <div className={styles.sectionCard}>
          <SectionTitle>Settlement Details</SectionTitle>

          {/* Tab row + action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'waybills' ? styles.tabBtnActive : styles.tabBtnInactive}`}
                onClick={() => setActiveTab('waybills')}
              >
                Waybill List ({localWaybills.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'tickets' ? styles.tabBtnActive : styles.tabBtnInactive}`}
                onClick={() => setActiveTab('tickets')}
              >
                Claim Ticket List ({localClaims.length})
              </button>
            </div>
            <div style={{ flex: 1 }} />
            {isEditable && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="small" onClick={() => { setAddWaybillNo(''); setShowAddWaybill(true); }}>Add Waybill</Button>
                <Button size="small" onClick={() => { setAddClaimNo(''); setShowAddClaim(true); }}>Add ticket</Button>
                <Button
                  size="small"
                  onClick={() => {
                    const init: Record<string, string> = {};
                    localWaybills.forEach((w) => {
                      (['basicAmount', 'prepaidAmount', 'additionalCharge', 'exceptionFee', 'reimbursement'] as const).forEach((k) => {
                        init[w.no + ':' + k] = String(w[k]);
                      });
                    });
                    setEditAmounts(init);
                    setShowEditWaybills(true);
                  }}
                >
                  Edit Waybill
                </Button>
              </div>
            )}
          </div>

          {/* Waybill table */}
          {activeTab === 'waybills' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Waybill</th>
                    {source !== 'Inteluck' && <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Waybill Amount</th>}
                    {source !== 'Inteluck' && <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Basic Amount</th>}
                    {source !== 'Inteluck' && <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Advance Payment</th>}
                    {source !== 'Inteluck' && <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Additional Charge</th>}
                    {source !== 'Inteluck' && <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Exception Fee</th>}
                    {source !== 'Inteluck' && <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Reimbursement</th>}
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Position Time</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Unloading Time</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Truck Type</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Origin</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Destination</th>
                    {hasRemove && <th style={{ padding: '8px 12px', fontWeight: 600 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {localWaybills.map((r) => {
                    const editable = (status === 'Draft' || status === 'Awaiting Re-bill') && source !== 'Inteluck';
                    const updateItem = (
                      key: 'basicAmount' | 'prepaidAmount' | 'additionalCharge' | 'exceptionFee' | 'reimbursement',
                      v: string,
                    ) => {
                      const n = Number(v) || 0;
                      setLocalWaybills((prev) =>
                        prev.map((w) => {
                          if (w.no !== r.no) return w;
                          const next = { ...w, [key]: n };
                          next.waybillAmount =
                            next.basicAmount - next.prepaidAmount + next.additionalCharge + next.exceptionFee + next.reimbursement;
                          return next;
                        }),
                      );
                    };
                    const EditCell = (val: number, key: 'basicAmount' | 'prepaidAmount' | 'additionalCharge' | 'exceptionFee' | 'reimbursement') =>
                      editable ? (
                        <td style={{ padding: '4px 8px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => updateItem(key, e.target.value)}
                            style={{ width: 84, padding: '3px 6px', textAlign: 'right', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12 }}
                          />
                        </td>
                      ) : (
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{NUM_FMT(val)}</td>
                      );

                    return (
                      <tr key={r.no} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>{r.no}</td>
                        {source !== 'Inteluck' && <td style={{ padding: '8px 12px', textAlign: 'right' }}>{NUM_FMT(r.waybillAmount)}</td>}
                        {source !== 'Inteluck' && EditCell(r.basicAmount, 'basicAmount')}
                        {source !== 'Inteluck' && EditCell(r.prepaidAmount, 'prepaidAmount')}
                        {source !== 'Inteluck' && EditCell(r.additionalCharge, 'additionalCharge')}
                        {source !== 'Inteluck' && EditCell(r.exceptionFee, 'exceptionFee')}
                        {source !== 'Inteluck' && EditCell(r.reimbursement, 'reimbursement')}
                        <td style={{ padding: '8px 12px' }}>{r.positionTime}</td>
                        <td style={{ padding: '8px 12px' }}>{r.unloadingTime}</td>
                        <td style={{ padding: '8px 12px' }}>{r.truckType}</td>
                        <td style={{ padding: '8px 12px' }}>{r.origin || <span style={{ color: '#bbb' }}>—</span>}</td>
                        <td style={{ padding: '8px 12px' }}>{r.destination || <span style={{ color: '#bbb' }}>—</span>}</td>
                        {hasRemove && (
                          <td style={{ padding: '8px 12px' }}>
                            <Button
                              type="link"
                              size="small"
                              danger
                              onClick={() => {
                                setLocalWaybills((prev) => prev.filter((w) => w.no !== r.no));
                                showToast(`Waybill ${r.no} removed.`);
                              }}
                            >
                              Remove
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {localWaybills.length === 0 && (
                    <tr>
                      <td colSpan={13} style={{ padding: '24px 0', textAlign: 'center', color: '#bbb' }}>
                        No waybills.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Claim Ticket table */}
          {activeTab === 'tickets' && (
            localClaims.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#bbb' }}>No claim tickets.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Ticket No.</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Claim Type</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>Related Waybill</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Claim Amount</th>
                    {hasRemove && <th style={{ padding: '8px 12px', fontWeight: 600 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {localClaims.map((t) => (
                    <tr key={t.ticketNo} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{t.ticketNo}</td>
                      <td style={{ padding: '8px 12px' }}>{t.claimType}</td>
                      <td style={{ padding: '8px 12px' }}>{t.relatedWaybill || <span style={{ color: '#bbb' }}>—</span>}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#cf1322', fontWeight: 600 }}>
                        {NUM_FMT(t.claimAmount)}
                      </td>
                      {hasRemove && (
                        <td style={{ padding: '8px 12px' }}>
                          <Button
                            type="link"
                            size="small"
                            danger
                            onClick={() => {
                              setLocalClaims((prev) => prev.filter((c) => c.ticketNo !== t.ticketNo));
                              showToast(`Ticket ${t.ticketNo} removed.`);
                            }}
                          >
                            Remove ticket
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}

      {/* ── Tax Settings (editable Standard only) ── */}
      {!isStandalone && isEditable && (
        <div className={styles.sectionCard}>
          <SectionTitle>Amount Summary</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, marginBottom: 6 }}>VAT Rate</div>
              <select
                style={{ width: '100%', height: 36, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
              >
                <option value="0">No VAT (0%)</option>
                <option value="7">VAT 7%</option>
                <option value="10">VAT 10%</option>
                <option value="12">VAT 12%</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 13, marginBottom: 6 }}>WHT Rate</div>
              <select
                style={{ width: '100%', height: 36, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                value={whtRate}
                onChange={(e) => setWhtRate(e.target.value)}
              >
                <option value="0">No WHT (0%)</option>
                <option value="1">WHT 1%</option>
                <option value="2">WHT 2%</option>
                <option value="5">WHT 5%</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Total Summary Panel (editable Standard only) ── */}
      {!isStandalone && isEditable && (
        <div className={styles.totalSummaryPanel}>
          <div style={{ flexShrink: 0 }}>
            <div className={styles.totalLabel}>Total Amount Receivable</div>
            <div className={styles.totalValue}>
              {calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: '#b7eb8f', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 18px', fontSize: 12 }}>
            {[
              { label: 'Basic', val: calcBasicAmount },
              { label: 'Additional', val: calcAdditionalCharge },
              { label: 'Exception', val: calcExceptionFee },
              { label: 'Reimbursement', val: calcReimbursement },
              { label: 'Subtotal', val: waybillSubtotal, bold: true },
              { label: 'Claim', val: calcClaimDeduction, neg: true },
              { label: 'VAT', val: vatAmount },
              { label: 'WHT', val: whtAmount, neg: true },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ color: '#6b7280' }}>{item.label}</span>
                <span style={{
                  fontWeight: item.bold ? 700 : 500,
                  color: item.neg && item.val > 0 ? '#cf1322' : '#333',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {item.neg && item.val > 0 ? '−' : ''}
                  {item.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Amount Summary (Standard, non-editable) ── */}
      {!isStandalone && status !== 'Draft' && status !== 'Awaiting Re-bill' && renderAmountSummary()}

      {/* ── Invoice (Standard only) ── */}
      {!isStandalone && (
        <div className={styles.sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle>Invoice</SectionTitle>
            <div style={{ flex: 1 }} />
            {!invoiceReadonly && (
              <Button size="small" onClick={() => { setInvoiceForm({ no: '', amount: '', date: '' }); setShowAddInvoice(true); }}>
                Add Invoice
              </Button>
            )}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Invoice No.</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Invoice Amount</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Invoice Date</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Proof</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {localInvoices.map((inv, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '8px 12px', color: '#1677ff' }}>{inv.invoiceNo}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{NUM_FMT(inv.invoiceAmount)}</td>
                  <td style={{ padding: '8px 12px', color: '#1677ff' }}>{inv.invoiceDate}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {inv.proofName ? (
                      <span style={{ color: '#1677ff', cursor: 'pointer' }}>{inv.proofName}</span>
                    ) : (
                      <span style={{ color: '#bbb' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    {!invoiceReadonly ? (
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          setLocalInvoices((prev) => prev.filter((_, j) => j !== i));
                          showToast(`Invoice ${inv.invoiceNo} voided.`);
                        }}
                      >
                        Void
                      </Button>
                    ) : (
                      <span style={{ color: '#bbb' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {localInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: '#bbb' }}>No invoices.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Operation Log ── */}
      <div className={styles.sectionCard}>
        <SectionTitle>Operation Log</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(operationLog ?? []).map((entry, i) => {
            const shouldMask = source === 'Inteluck' && (status === 'Pending Payment' || status === 'Collected');
            const VP_ACTORS = new Set(['Olymris', 'Vendor', 'Self', '']);
            const displayOperator = shouldMask && !VP_ACTORS.has(entry.operator) ? 'Inteluck' : entry.operator;
            return (
              <div key={i}>
                <div className={styles.opLogEntry}>
                  <span className={styles.opLogTime}>{entry.timestamp}</span>
                  <span>{entry.action}</span>
                  <span style={{ color: '#999' }}> · {displayOperator}</span>
                </div>
                {entry.subLine && <div className={styles.opLogSub}>{entry.subLine}</div>}
              </div>
            );
          })}
          {(operationLog ?? []).length === 0 && (
            <div style={{ color: '#bbb', fontSize: 13 }}>No operation records.</div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Add Waybill Modal */}
      <Modal
        title="Add Waybill"
        open={showAddWaybill}
        width={760}
        onCancel={() => setShowAddWaybill(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddWaybill(false)}>Cancel</Button>,
          <Button
            key="add"
            type="primary"
            disabled={!addWaybillNo}
            onClick={() => {
              const selected = billableWaybillPool.find((w) => w.no === addWaybillNo);
              if (!selected) return;
              setLocalWaybills((prev) => [...prev, selected]);
              setShowAddWaybill(false);
              showToast(`Waybill ${selected.no} added.`);
            }}
          >
            Add
          </Button>,
        ]}
      >
        <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>Billable waybill list</div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ width: 36, padding: '8px 12px' }} />
                {['Waybill No.', 'Unloading Time', 'Truck Type', 'Origin', 'Destination', 'Basic Amount', 'Additional Charge', 'Exception Fee', 'Reimbursement'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', fontWeight: 600, textAlign: h.includes('Amount') || h.includes('Charge') || h.includes('Fee') || h.includes('Reimbursement') ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availableBillableWaybills.map((w) => (
                <tr
                  key={w.no}
                  style={{ borderBottom: '1px solid #f5f5f5', background: addWaybillNo === w.no ? '#f0f7ff' : undefined, cursor: 'pointer' }}
                  onClick={() => setAddWaybillNo(w.no)}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <input type="radio" checked={addWaybillNo === w.no} onChange={() => setAddWaybillNo(w.no)} />
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>{w.no}</td>
                  <td style={{ padding: '8px 12px' }}>{w.unloadingTime}</td>
                  <td style={{ padding: '8px 12px' }}>{w.truckType}</td>
                  <td style={{ padding: '8px 12px' }}>{w.origin || <span style={{ color: '#bbb' }}>-</span>}</td>
                  <td style={{ padding: '8px 12px' }}>{w.destination || <span style={{ color: '#bbb' }}>-</span>}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{NUM_FMT(w.basicAmount)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{NUM_FMT(w.additionalCharge)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{NUM_FMT(w.exceptionFee)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>{NUM_FMT(w.reimbursement)}</td>
                </tr>
              ))}
              {availableBillableWaybills.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: '24px 0', textAlign: 'center', color: '#bbb' }}>No billable waybills available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Edit Waybill Modal */}
      <Modal
        title="Edit Waybill Amounts"
        open={showEditWaybills}
        width={820}
        onCancel={() => setShowEditWaybills(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowEditWaybills(false)}>Cancel</Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              setLocalWaybills((prev) =>
                prev.map((w) => {
                  const next = {
                    ...w,
                    basicAmount: Number(editAmounts[w.no + ':basicAmount'] ?? w.basicAmount) || 0,
                    prepaidAmount: Number(editAmounts[w.no + ':prepaidAmount'] ?? w.prepaidAmount) || 0,
                    additionalCharge: Number(editAmounts[w.no + ':additionalCharge'] ?? w.additionalCharge) || 0,
                    exceptionFee: Number(editAmounts[w.no + ':exceptionFee'] ?? w.exceptionFee) || 0,
                    reimbursement: Number(editAmounts[w.no + ':reimbursement'] ?? w.reimbursement) || 0,
                  };
                  return {
                    ...next,
                    waybillAmount: next.basicAmount - next.prepaidAmount + next.additionalCharge + next.exceptionFee + next.reimbursement,
                  };
                }),
              );
              setShowEditWaybills(false);
              showToast('Waybill prices updated.');
            }}
          >
            Save
          </Button>,
        ]}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              {['Waybill', 'Basic Amount', 'Advance Payment', 'Additional Charge', 'Exception Fee', 'Reimbursement'].map((h) => (
                <th key={h} style={{ padding: '8px 10px', fontWeight: 600, textAlign: h === 'Waybill' ? 'left' : 'right' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localWaybills.map((w) => (
              <tr key={w.no} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '8px 10px', fontWeight: 500 }}>{w.no}</td>
                {(['basicAmount', 'prepaidAmount', 'additionalCharge', 'exceptionFee', 'reimbursement'] as const).map((key) => (
                  <td key={key} style={{ padding: '6px 10px', textAlign: 'right' }}>
                    <input
                      type="number"
                      style={{ width: 104, textAlign: 'right', border: '1px solid #d9d9d9', borderRadius: 4, padding: '4px 8px', fontSize: 13 }}
                      value={editAmounts[w.no + ':' + key] ?? String(w[key])}
                      onChange={(e) => setEditAmounts((prev) => ({ ...prev, [w.no + ':' + key]: e.target.value }))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>

      {/* Add Claim Modal */}
      <Modal
        title="Add ticket"
        open={showAddClaim}
        width={560}
        onCancel={() => setShowAddClaim(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddClaim(false)}>Cancel</Button>,
          <Button
            key="add"
            type="primary"
            disabled={!addClaimNo}
            onClick={() => {
              const selected = availableClaimTickets.find((t) => t.ticketNo === addClaimNo);
              if (!selected) return;
              setLocalClaims((prev) => [...prev, selected]);
              setShowAddClaim(false);
              showToast(`Ticket ${selected.ticketNo} added.`);
            }}
          >
            Add ticket
          </Button>,
        ]}
      >
        <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>Select a claim ticket to include in this statement.</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ width: 36, padding: '8px 12px' }} />
              {['Ticket No.', 'Claim Type', 'Related Waybill', 'Claim Amount'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', fontWeight: 600, textAlign: h.includes('Amount') ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availableClaimTickets.map((ticket) => (
              <tr
                key={ticket.ticketNo}
                style={{ borderBottom: '1px solid #f5f5f5', background: addClaimNo === ticket.ticketNo ? '#f0f7ff' : undefined, cursor: 'pointer' }}
                onClick={() => setAddClaimNo(ticket.ticketNo)}
              >
                <td style={{ padding: '8px 12px' }}>
                  <input type="radio" checked={addClaimNo === ticket.ticketNo} onChange={() => setAddClaimNo(ticket.ticketNo)} />
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{ticket.ticketNo}</td>
                <td style={{ padding: '8px 12px' }}>{ticket.claimType}</td>
                <td style={{ padding: '8px 12px' }}>{ticket.relatedWaybill || <span style={{ color: '#bbb' }}>—</span>}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', color: '#cf1322', fontWeight: 600 }}>{NUM_FMT(ticket.claimAmount)}</td>
              </tr>
            ))}
            {availableClaimTickets.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: '#bbb' }}>No available claim tickets.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Modal>

      {/* Add Invoice Modal (Standard) */}
      <Modal
        title="Add Invoice"
        open={showAddInvoice}
        width={420}
        onCancel={() => setShowAddInvoice(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddInvoice(false)}>Cancel</Button>,
          <Button
            key="add"
            type="primary"
            disabled={!invoiceForm.no.trim() || !invoiceForm.amount || !invoiceForm.date}
            onClick={() => {
              const newInv: InvoiceEntry = {
                invoiceNo: invoiceForm.no.trim(),
                invoiceAmount: Number(invoiceForm.amount) || 0,
                invoiceDate: invoiceForm.date,
              };
              setLocalInvoices((prev) => [...prev, newInv]);
              setShowAddInvoice(false);
              showToast(`Invoice ${newInv.invoiceNo} added.`);
            }}
          >
            Add
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Invoice No.', key: 'no', placeholder: 'e.g. INV-2026-00301', type: 'text' },
            { label: 'Invoice Amount', key: 'amount', placeholder: 'e.g. 44500', type: 'number' },
            { label: 'Invoice Date', key: 'date', placeholder: '', type: 'date' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                {label} <span style={{ color: '#ff4d4f' }}>*</span>
              </div>
              <input
                type={type}
                style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                placeholder={placeholder}
                value={(invoiceForm as Record<string, string>)[key]}
                onChange={(e) => setInvoiceForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </Modal>

      {/* Add / Edit Misc Charge Modal */}
      <Modal
        title={editMiscIdx !== null ? 'Edit Miscellaneous Charge' : 'Add Miscellaneous Charge'}
        open={showAddMiscCharge}
        width={420}
        onCancel={() => setShowAddMiscCharge(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddMiscCharge(false)}>Cancel</Button>,
          <Button
            key="save"
            type="primary"
            disabled={!miscChargeForm.object.trim() || !miscChargeForm.amount}
            onClick={() => {
              const row: MiscChargeRow = { object: miscChargeForm.object.trim(), amount: Number(miscChargeForm.amount) || 0, proof: miscChargeForm.proof.trim() };
              if (editMiscIdx !== null) {
                setLocalMiscCharges((prev) => prev.map((m, i) => (i === editMiscIdx ? row : m)));
                showToast('Row updated.');
              } else {
                setLocalMiscCharges((prev) => [...prev, row]);
                showToast('Row added.');
              }
              setShowAddMiscCharge(false);
            }}
          >
            {editMiscIdx !== null ? 'Save' : 'Add'}
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Charge Object <span style={{ color: '#ff4d4f' }}>*</span></div>
            <input type="text" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} placeholder="e.g. Fuel Surcharge" value={miscChargeForm.object} onChange={(e) => setMiscChargeForm((prev) => ({ ...prev, object: e.target.value }))} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Amount <span style={{ color: '#ff4d4f' }}>*</span></div>
            <input type="number" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} placeholder="e.g. 1500" value={miscChargeForm.amount} onChange={(e) => setMiscChargeForm((prev) => ({ ...prev, amount: e.target.value }))} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Proof</div>
            <input type="text" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} placeholder="e.g. receipt.pdf" value={miscChargeForm.proof} onChange={(e) => setMiscChargeForm((prev) => ({ ...prev, proof: e.target.value }))} />
          </div>
        </div>
      </Modal>

      {/* Add Standalone Invoice Modal */}
      <Modal
        title="Add Invoice"
        open={showAddStandaloneInvoice}
        width={420}
        onCancel={() => setShowAddStandaloneInvoice(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddStandaloneInvoice(false)}>Cancel</Button>,
          <Button
            key="add"
            type="primary"
            disabled={!standaloneInvoiceForm.number.trim() || !standaloneInvoiceForm.amount || !standaloneInvoiceForm.date}
            onClick={() => {
              const row: StandaloneInvoiceRow = { number: standaloneInvoiceForm.number.trim(), amount: Number(standaloneInvoiceForm.amount) || 0, date: standaloneInvoiceForm.date, proof: standaloneInvoiceForm.proof.trim() };
              setLocalStandaloneInvoices((prev) => [...prev, row]);
              setShowAddStandaloneInvoice(false);
              showToast(`Invoice ${row.number} added.`);
            }}
          >
            Add
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Invoice Number', key: 'number', placeholder: 'e.g. INV-2026-00301', type: 'text' },
            { label: 'Invoice Amount', key: 'amount', placeholder: 'e.g. 44500', type: 'number' },
            { label: 'Invoice Date', key: 'date', placeholder: '', type: 'date' },
            { label: 'Invoice Proof', key: 'proof', placeholder: 'e.g. invoice.pdf', type: 'text' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                {label}{key !== 'proof' && <span style={{ color: '#ff4d4f' }}> *</span>}
              </div>
              <input type={type} style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} placeholder={placeholder} value={(standaloneInvoiceForm as Record<string, string>)[key]} onChange={(e) => setStandaloneInvoiceForm((prev) => ({ ...prev, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
      </Modal>

      {/* Add Standalone Proof Modal */}
      <Modal
        title="Add Proof"
        open={showAddStandaloneProof}
        width={420}
        onCancel={() => setShowAddStandaloneProof(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowAddStandaloneProof(false)}>Cancel</Button>,
          <Button
            key="add"
            type="primary"
            disabled={!standaloneProofForm.message.trim()}
            onClick={() => {
              setLocalStandaloneProofs((prev) => [...prev, { message: standaloneProofForm.message.trim() }]);
              setShowAddStandaloneProof(false);
              showToast('Proof added.');
            }}
          >
            Add
          </Button>,
        ]}
      >
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Message <span style={{ color: '#ff4d4f' }}>*</span></div>
          <textarea
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 80, resize: 'vertical', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
            placeholder="Enter message or file name..."
            value={standaloneProofForm.message}
            onChange={(e) => setStandaloneProofForm({ message: e.target.value })}
          />
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className={styles.toastNotification}>
          <span className={styles.toastIcon}>✓</span>
          {toast}
        </div>
      )}
    </div>
  );
};

export default StatementDetail;
