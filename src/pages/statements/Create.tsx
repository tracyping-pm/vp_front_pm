/**
 * Create Statement page — VP My Statements module.
 *
 * Combines logic from:
 *   - BillableCreateStatementForm.tsx (billable-waybill-linked creation)
 *   - CreateStatementForm.tsx (upload / system-price modes with per-row fields)
 *
 * Supports:
 *   - Standard type: per-waybill Basic / Additional / Exception / Reimbursement inputs
 *   - Standalone type: Miscellaneous Charge table + Invoice + Proof
 *   - Settlement item checkboxes (unchecked → strikethrough in summary, excluded from total)
 *   - VAT (0/7/12%) / WHT (0/1/2%) tax settings
 *   - Tax Mark: Tax-exclusive vs Tax-inclusive
 *   - Claim Tickets deduction
 *   - Invoice Management with OCR simulation (1.5s)
 *   - Submit confirmation dialog with full amount summary
 *   - Save as Draft vs Submit to TMS
 */

import React, { useMemo, useState } from 'react';
import { history } from '@umijs/max';
import { Button, Card, message, Modal } from 'antd';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import { upsertApStatement, type SyncedApStatement } from '@/pages/common/apStatementSync';
import { BASE_WAYBILL_POOL, ALL_CLAIM_TICKETS, type StatementWaybillRow, type StatementClaimRow } from './mock/waybills';
import styles from './index.less';

// ── Types ─────────────────────────────────────────────────────────────────────

type StatementType = 'Standard' | 'Standalone';
type TaxMark = 'Tax-inclusive' | 'Tax-exclusive';
type OcrState = 'idle' | 'scanning' | 'done' | 'failed';
type SettlementItemKey = 'basic' | 'additional' | 'exception' | 'reimbursement' | 'claim';

interface WaybillData extends StatementWaybillRow {}

interface ClaimData extends StatementClaimRow {}

interface StandardInvoiceRow {
  id: number;
  no: string;
  amount: string;
  date: string;
  attachmentName: string;
  ocrState: OcrState;
}

interface MiscChargeRow {
  id: number;
  object: string;
  amount: string;
  proof: string;
}

interface StandaloneInvoiceRow {
  id: number;
  number: string;
  amount: string;
  date: string;
  proof: string;
}

interface StandaloneProofRow {
  id: number;
  message: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const VAT_OPTIONS = [
  { label: 'No VAT (0%)', value: 0 },
  { label: 'VAT 7%', value: 7 },
  { label: 'VAT 12%', value: 12 },
];

const WHT_OPTIONS = [
  { label: 'No WHT (0%)', value: 0 },
  { label: 'WHT 1%', value: 1 },
  { label: 'WHT 2%', value: 2 },
];

const SETTLEMENT_ITEM_LABELS: Record<SettlementItemKey, string> = {
  basic: 'Basic Amount',
  additional: 'Additional Charge',
  exception: 'Exception Fee',
  reimbursement: 'Reimbursement',
  claim: 'Claim Deduction',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

let seqCounter = 100;
function generateStatementNo(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(++seqCounter).padStart(3, '0');
  return `VS${yy}${mm}${seq}`;
}

let _idCounter = 1;
const makeId = () => ++_idCounter;

// ── SectionTitle helper ───────────────────────────────────────────────────────

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className={styles.sectionTitleRow} style={{ justifyContent: right ? 'space-between' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className={styles.sectionBar} />
        <span className={styles.sectionTitle}>{children}</span>
      </div>
      {right}
    </div>
  );
}

// ── AddInvoiceDialog ──────────────────────────────────────────────────────────

interface AddInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: { no: string; amount: string; date: string; attachmentName: string }) => void;
  waybillSubtotal: number;
}

function AddInvoiceDialog({ open, onClose, onAdd, waybillSubtotal }: AddInvoiceDialogProps) {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [ocrState, setOcrState] = useState<OcrState>('idle');

  const handleFakeUpload = () => {
    const fileName = 'Invoice_Attachment.pdf';
    setAttachmentName(fileName);
    setOcrState('scanning');
    setTimeout(() => {
      setOcrState('done');
      if (!invoiceNo) setInvoiceNo(`INV-2026-0${Math.floor(Math.random() * 900 + 100)}`);
      if (!invoiceAmount) setInvoiceAmount(String(Math.round(waybillSubtotal)));
      if (!invoiceDate) setInvoiceDate('2026-04-28');
    }, 1500);
  };

  const canAdd = invoiceNo.trim() && invoiceAmount.trim() && invoiceDate.trim() && attachmentName.trim();

  return (
    <Modal
      title="Add Invoice"
      open={open}
      width={480}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>Cancel</Button>,
        <Button key="add" type="primary" disabled={!canAdd} onClick={() => onAdd({ no: invoiceNo, amount: invoiceAmount, date: invoiceDate, attachmentName })}>
          Add Invoice
        </Button>,
      ]}
    >
      {/* Upload zone (triggers OCR) */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
          Attachment <span style={{ color: '#ff4d4f' }}>*</span>
        </div>
        <div
          className={`${styles.uploadZone} ${dragging ? styles.dragging : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFakeUpload(); }}
          onClick={handleFakeUpload}
        >
          {attachmentName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#1677ff', fontSize: 13 }}>📎 {attachmentName}</span>
              {ocrState === 'scanning' && <span style={{ fontSize: 12, color: '#1677ff' }}>⟳ OCR scanning…</span>}
              {ocrState === 'done' && <span style={{ fontSize: 12, color: 'var(--primary-color)' }}>✓ OCR auto-filled</span>}
              {ocrState === 'failed' && <span style={{ fontSize: 12, color: '#ff4d4f' }}>✕ OCR failed</span>}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 22, color: '#ccc', marginBottom: 6 }}>⬆</div>
              <div style={{ fontSize: 13, color: '#666' }}>Click or drag to upload · PDF, JPG, PNG · Max 20 MB</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>OCR will auto-fill the fields below after upload</div>
            </>
          )}
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Invoice No. <span style={{ color: '#ff4d4f' }}>*</span></div>
          <input style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} placeholder="e.g. INV-2026-00201" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Invoice Amount <span style={{ color: '#ff4d4f' }}>*</span></div>
          <input type="number" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} placeholder="0.00" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
          {invoiceAmount && waybillSubtotal > 0 && Math.abs(parseFloat(invoiceAmount) - waybillSubtotal) > 0.01 && (
            <div style={{ fontSize: 11, color: '#d48806', marginTop: 3 }}>
              ⚠ Amount differs from waybill total ({fmt(waybillSubtotal)}) — you can still submit.
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Invoice Date <span style={{ color: '#ff4d4f' }}>*</span></div>
          <input type="date" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const CreateStatement: React.FC = () => {
  // ── Statement info ─────────────────────────────────────────────────────────
  const [statementType, setStatementType] = useState<StatementType>('Standard');
  const [reconciliationFrom, setReconciliationFrom] = useState('2026-04-01');
  const [reconciliationTo, setReconciliationTo] = useState('2026-04-30');
  const isStandalone = statementType === 'Standalone';

  // ── Settlement items ───────────────────────────────────────────────────────
  const [includedItems, setIncludedItems] = useState<Set<SettlementItemKey>>(
    new Set(['basic', 'additional', 'exception', 'reimbursement', 'claim']),
  );
  const isIncluded = (k: SettlementItemKey) => includedItems.has(k);
  const toggleItem = (k: SettlementItemKey) => {
    setIncludedItems((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  // ── Billing detail tab ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'waybill' | 'claim'>('waybill');

  // ── Waybills ───────────────────────────────────────────────────────────────
  const [addedWaybills, setAddedWaybills] = useState<WaybillData[]>([]);
  const [showWaybillModal, setShowWaybillModal] = useState(false);
  const [modalWaybillFilter, setModalWaybillFilter] = useState('');
  const [modalTruckTypeFilter, setModalTruckTypeFilter] = useState('');
  const [modalSelectedNos, setModalSelectedNos] = useState<Set<string>>(new Set());

  const addedWaybillNos = new Set(addedWaybills.map((w) => w.no));
  const availableWaybills = BASE_WAYBILL_POOL.filter((w) => !addedWaybillNos.has(w.no));
  const truckTypeOptions = Array.from(new Set(BASE_WAYBILL_POOL.map((w) => w.truckType)));

  const filteredModalWaybills = availableWaybills.filter((w) => {
    if (modalWaybillFilter && !w.no.toLowerCase().includes(modalWaybillFilter.toLowerCase())) return false;
    if (modalTruckTypeFilter && w.truckType !== modalTruckTypeFilter) return false;
    return true;
  });

  const openWaybillModal = () => {
    setModalSelectedNos(new Set());
    setModalWaybillFilter('');
    setModalTruckTypeFilter('');
    setShowWaybillModal(true);
  };

  const confirmAddWaybills = () => {
    const toAdd = availableWaybills.filter((w) => modalSelectedNos.has(w.no));
    setAddedWaybills((prev) => [...prev, ...toAdd]);
    setShowWaybillModal(false);
  };

  const toggleModalWaybill = (no: string) => {
    setModalSelectedNos((prev) => {
      const n = new Set(prev);
      if (n.has(no)) n.delete(no);
      else n.add(no);
      return n;
    });
  };

  // ── Claim tickets ──────────────────────────────────────────────────────────
  const [addedClaims, setAddedClaims] = useState<ClaimData[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [modalClaimFilter, setModalClaimFilter] = useState('');
  const [modalSelectedClaimNos, setModalSelectedClaimNos] = useState<Set<string>>(new Set());

  const addedClaimNos = new Set(addedClaims.map((c) => c.ticketNo));
  const availableClaims = ALL_CLAIM_TICKETS.filter((c) => !addedClaimNos.has(c.ticketNo));
  const filteredModalClaims = availableClaims.filter((c) =>
    !modalClaimFilter || c.ticketNo.toLowerCase().includes(modalClaimFilter.toLowerCase()),
  );

  const toggleModalClaim = (no: string) => {
    setModalSelectedClaimNos((prev) => {
      const n = new Set(prev);
      if (n.has(no)) n.delete(no);
      else n.add(no);
      return n;
    });
  };

  // ── Tax settings ───────────────────────────────────────────────────────────
  const [taxMark, setTaxMark] = useState<TaxMark>('Tax-exclusive');
  const [vatRate, setVatRate] = useState(0);
  const [whtRate, setWhtRate] = useState(0);

  // ── Standard invoices ──────────────────────────────────────────────────────
  const [standardInvoices, setStandardInvoices] = useState<StandardInvoiceRow[]>([]);
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  const addStandardInvoice = (entry: { no: string; amount: string; date: string; attachmentName: string }) => {
    setStandardInvoices((prev) => [
      ...prev,
      { id: makeId(), no: entry.no, amount: entry.amount, date: entry.date, attachmentName: entry.attachmentName, ocrState: 'done' },
    ]);
    setShowAddInvoice(false);
  };

  // ── Standalone state ───────────────────────────────────────────────────────
  const newMiscRow = (): MiscChargeRow => ({ id: makeId(), object: '', amount: '', proof: '' });
  const [miscCharges, setMiscCharges] = useState<MiscChargeRow[]>([newMiscRow()]);

  const updateMisc = (id: number, patch: Partial<MiscChargeRow>) =>
    setMiscCharges((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const addMiscRow = () => setMiscCharges((prev) => [...prev, newMiscRow()]);
  const removeMiscRow = (id: number) =>
    setMiscCharges((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));

  const [standaloneInvoices, setStandaloneInvoices] = useState<StandaloneInvoiceRow[]>([]);
  const updateInvoice = (id: number, patch: Partial<StandaloneInvoiceRow>) =>
    setStandaloneInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const addInvoiceRow = () =>
    setStandaloneInvoices((prev) => [...prev, { id: makeId(), number: '', amount: '', date: '', proof: '' }]);
  const removeInvoiceRow = (id: number) =>
    setStandaloneInvoices((prev) => prev.filter((i) => i.id !== id));

  const [standaloneProofs, setStandaloneProofs] = useState<StandaloneProofRow[]>([]);
  const updateProof = (id: number, patch: Partial<StandaloneProofRow>) =>
    setStandaloneProofs((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addProofRow = () =>
    setStandaloneProofs((prev) => [...prev, { id: makeId(), message: '' }]);
  const removeProofRow = (id: number) =>
    setStandaloneProofs((prev) => prev.filter((p) => p.id !== id));

  // ── Calculations ───────────────────────────────────────────────────────────

  const totals = useMemo(
    () =>
      addedWaybills.reduce(
        (acc, w) => ({
          basic: acc.basic + w.basicAmount,
          additional: acc.additional + w.additionalCharge,
          exception: acc.exception + w.exceptionFee,
          reimbursement: acc.reimbursement + w.reimbursement,
        }),
        { basic: 0, additional: 0, exception: 0, reimbursement: 0 },
      ),
    [addedWaybills],
  );

  const claimTotal = useMemo(
    () => addedClaims.reduce((s, c) => s + c.claimAmount, 0),
    [addedClaims],
  );

  const waybillSubtotal =
    (isIncluded('basic') ? totals.basic : 0) +
    (isIncluded('additional') ? totals.additional : 0) +
    (isIncluded('exception') ? totals.exception : 0) +
    (isIncluded('reimbursement') ? totals.reimbursement : 0);

  const claimDeduction = isIncluded('claim') ? claimTotal : 0;
  const vatAmount = Math.round(waybillSubtotal * vatRate / 100);
  const whtAmount = Math.round(waybillSubtotal * whtRate / 100);

  const totalAmountPayable = taxMark === 'Tax-inclusive'
    ? waybillSubtotal - claimDeduction + vatAmount - whtAmount
    : waybillSubtotal - claimDeduction;

  const miscTotal = useMemo(
    () => miscCharges.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0),
    [miscCharges],
  );

  const totalInvoiceAmount = standardInvoices.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const hasInvoiceAmountMismatch =
    standardInvoices.length > 0 &&
    totalInvoiceAmount > 0 &&
    Math.abs(totalInvoiceAmount - waybillSubtotal) > 0.01;

  const reconciliationPeriod = `${reconciliationFrom || '-'} ~ ${reconciliationTo || '-'}`;

  // ── Submit logic ───────────────────────────────────────────────────────────

  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit = isStandalone ? miscTotal > 0 : addedWaybills.length > 0;

  const handleSubmit = (isDraft: boolean) => {
    const stmtNo = generateStatementNo();
    const now = new Date().toISOString();

    const basePayload: SyncedApStatement = {
      no: stmtNo,
      vendorName: 'ACAA Trucking Services',
      source: 'Vendor Portal',
      status: isDraft ? 'Awaiting Comparison' : 'Awaiting Comparison',
      statementType: statementType,
      reconciliationPeriod,
      taxMark: taxMark,
      vatRate,
      whtRate,
      vatAmount,
      whtAmount,
      settlementItems: isStandalone
        ? ['Miscellaneous Charge']
        : [
            ...(isIncluded('basic') ? ['Basic Amount'] : []),
            ...(isIncluded('additional') ? ['Additional Charge'] : []),
            ...(isIncluded('exception') ? ['Exception Fee'] : []),
            ...(isIncluded('reimbursement') ? ['Reimbursement'] : []),
          ],
      totalVpAmount: isStandalone ? miscTotal : totalAmountPayable,
      waybillCount: isStandalone ? 0 : addedWaybills.length,
      waybills: addedWaybills.map((w) => ({
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
      claims: addedClaims.map((c) => ({
        no: c.ticketNo,
        type: c.claimType,
        amount: c.claimAmount,
        waybillNo: c.relatedWaybill || '',
      })),
      createdAt: now,
      submittedAt: isDraft ? undefined : now,
      operationLogs: [
        {
          time: now,
          actor: 'Vendor',
          action: isDraft ? 'Saved as Draft' : 'Submitted',
        },
      ],
      miscCharges: isStandalone
        ? miscCharges
            .filter((m) => m.object.trim() || parseFloat(m.amount) > 0)
            .map((m) => ({ object: m.object, amount: parseFloat(m.amount) || 0, proof: m.proof }))
        : undefined,
      standaloneInvoices: isStandalone
        ? standaloneInvoices.map((i) => ({
            number: i.number,
            amount: parseFloat(i.amount) || 0,
            date: i.date,
            proof: i.proof,
          }))
        : undefined,
      standaloneProofs: isStandalone
        ? standaloneProofs.map((p) => ({ message: p.message }))
        : undefined,
    };

    upsertApStatement(basePayload);

    if (isDraft) {
      message.success(`Statement ${stmtNo} saved as draft.`);
    } else {
      message.success(`Statement ${stmtNo} submitted to TMS.`);
    }
    history.push(PATHS.VP_STATEMENTS);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.createStatementPage}>
      {/* ── Breadcrumb ── */}
      <BreadcrumbCase
        items={[
          { name: 'My Statements', path: PATHS.VP_STATEMENTS },
          { name: 'Create Statement', path: PATHS.VP_STATEMENTS_CREATE },
        ]}
      />
      {/* ── Action bar ── */}
      <div className={styles.actionBar}>
        <div style={{ flex: 1 }} />
        <div className={styles.actionButtons}>
          <Button onClick={() => handleSubmit(true)}>Save as Draft</Button>
          <Button
            type="primary"
            disabled={!canSubmit}
            title={!canSubmit ? (isStandalone ? 'Please enter at least one Miscellaneous Charge.' : 'Please add at least one waybill.') : undefined}
            onClick={() => canSubmit && setShowConfirm(true)}
          >
            Submit to TMS
          </Button>
        </div>
      </div>

      {/* ── Create Statement header card ── */}
      <Card bodyStyle={{ padding: '14px 24px' }} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>Create Statement</div>
      </Card>

      {/* ── Section 1: Statement Information ── */}
      <div className={styles.cardSection}>
        <SectionTitle>Statement Information</SectionTitle>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Statement Type */}
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 500 }}>Statement Type</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {(['Standard', 'Standalone'] as const).map((type) => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="statementType"
                    value={type}
                    checked={statementType === type}
                    onChange={() => setStatementType(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Reconciliation Period */}
          <div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontWeight: 500 }}>Reconciliation Period</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="date"
                value={reconciliationFrom}
                max={reconciliationTo || undefined}
                onChange={(e) => setReconciliationFrom(e.target.value)}
                style={{ padding: '5px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, width: 150 }}
              />
              <span style={{ fontSize: 13, color: '#999' }}>~</span>
              <input
                type="date"
                value={reconciliationTo}
                min={reconciliationFrom || undefined}
                onChange={(e) => setReconciliationTo(e.target.value)}
                style={{ padding: '5px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, width: 150 }}
              />
            </div>
          </div>
        </div>

        {/* Settlement Items (Standard only) */}
        {!isStandalone && (
          <div style={{ marginTop: 20, borderTop: '1px solid #f5f5f5', paddingTop: 16 }}>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 10, fontWeight: 500 }}>Settlement Items</div>
            <div className={styles.settlementItems}>
              {/* Select All */}
              <label
                className={`${styles.settlementItem} ${(['basic', 'additional', 'exception', 'reimbursement', 'claim'] as SettlementItemKey[]).every((k) => isIncluded(k)) ? styles.checked : styles.unchecked}`}
              >
                <input
                  type="checkbox"
                  checked={(['basic', 'additional', 'exception', 'reimbursement', 'claim'] as SettlementItemKey[]).every((k) => isIncluded(k))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setIncludedItems(new Set(['basic', 'additional', 'exception', 'reimbursement', 'claim']));
                    } else {
                      setIncludedItems(new Set());
                    }
                  }}
                />
                All
              </label>
              {(Object.keys(SETTLEMENT_ITEM_LABELS) as SettlementItemKey[]).map((key) => (
                <label
                  key={key}
                  className={`${styles.settlementItem} ${isIncluded(key) ? styles.checked : styles.unchecked}`}
                >
                  <input
                    type="checkbox"
                    checked={isIncluded(key)}
                    onChange={() => toggleItem(key)}
                  />
                  {SETTLEMENT_ITEM_LABELS[key]}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Standalone: Amount Summary / Invoice / Proof ── */}
      {isStandalone && (
        <>
          <div className={styles.cardSection}>
            <SectionTitle right={<Button type="link" size="small">Miscellaneous Charge Edit History</Button>}>
              Amount Summary
            </SectionTitle>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'left' }}>Miscellaneous Charge Object</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right', width: 160 }}>Amount</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600 }}>Proof</th>
                  <th style={{ width: 100, padding: '8px 12px' }} />
                </tr>
              </thead>
              <tbody>
                {miscCharges.map((row, idx) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '6px 12px' }}>
                      <input
                        className={styles.miscInput}
                        placeholder="e.g. Miscellaneous Charge"
                        value={row.object}
                        onChange={(e) => updateMisc(row.id, { object: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                      <input
                        type="number"
                        className={styles.miscInput}
                        style={{ width: 140, textAlign: 'right' }}
                        placeholder="0.00"
                        value={row.amount}
                        onChange={(e) => updateMisc(row.id, { amount: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      <input
                        className={styles.miscInput}
                        placeholder="proof file name"
                        value={row.proof}
                        onChange={(e) => updateMisc(row.id, { proof: e.target.value })}
                      />
                    </td>
                    <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                      <Button
                        type="link"
                        size="small"
                        danger
                        disabled={miscCharges.length <= 1}
                        onClick={() => removeMiscRow(row.id)}
                      >
                        Remove
                      </Button>
                      {idx === miscCharges.length - 1 && (
                        <Button type="link" size="small" onClick={addMiscRow} style={{ color: 'var(--primary-color)' }}>
                          + Add
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#fafafa', fontWeight: 600 }}>
                  <td style={{ padding: '8px 12px' }}>Total Amount</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#1677ff' }}>{fmt(miscTotal)}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.cardSection}>
            <SectionTitle right={<Button type="link" size="small" onClick={addInvoiceRow}>+ Add Invoice</Button>}>
              Invoice Management
            </SectionTitle>
            {standaloneInvoices.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
                No invoices added. Click "+ Add Invoice" to add one.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    {['Invoice Number', 'Invoice Amount', 'Invoice Date', 'Invoice Proof', ''].map((h, i) => (
                      <th key={i} style={{ padding: '8px 12px', fontWeight: 600, textAlign: i === 1 ? 'right' : 'left', width: i === 4 ? 80 : undefined }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standaloneInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '6px 12px' }}>
                        <input className={styles.miscInput} placeholder="Invoice No." value={inv.number} onChange={(e) => updateInvoice(inv.id, { number: e.target.value })} />
                      </td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>
                        <input type="number" className={styles.miscInput} style={{ width: 140, textAlign: 'right' }} placeholder="0.00" value={inv.amount} onChange={(e) => updateInvoice(inv.id, { amount: e.target.value })} />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <input type="date" className={styles.miscInput} value={inv.date} onChange={(e) => updateInvoice(inv.id, { date: e.target.value })} />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <input className={styles.miscInput} placeholder="file name" value={inv.proof} onChange={(e) => updateInvoice(inv.id, { proof: e.target.value })} />
                      </td>
                      <td style={{ padding: '6px 12px' }}>
                        <Button type="link" size="small" danger onClick={() => removeInvoiceRow(inv.id)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.cardSection}>
            <SectionTitle right={<Button type="link" size="small" onClick={addProofRow} style={{ color: '#1677ff' }}>+ Add Proof</Button>}>
              Proof
            </SectionTitle>
            {standaloneProofs.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
                No proof message records yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {standaloneProofs.map((p) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, minWidth: 130, paddingTop: 6 }}>Message Records</div>
                    <textarea
                      style={{ flex: 1, minHeight: 56, border: '1px solid #d9d9d9', borderRadius: 4, padding: 8, fontSize: 13, resize: 'vertical' }}
                      placeholder="…"
                      value={p.message}
                      onChange={(e) => updateProof(p.id, { message: e.target.value })}
                    />
                    <Button type="link" size="small" danger style={{ paddingTop: 6 }} onClick={() => removeProofRow(p.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Standard: Billing Details (Waybill + Claim tabs) ── */}
      {!isStandalone && (
        <div className={styles.cardSection}>
          <SectionTitle>Billing Details</SectionTitle>

          {/* Tabs */}
          <div className={styles.tabBar}>
            {[
              { key: 'waybill', label: `Waybills (${addedWaybills.length})` },
              { key: 'claim', label: `Claim Tickets (${addedClaims.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.key as 'waybill' | 'claim')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Waybill Tab */}
          {activeTab === 'waybill' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#666' }}>
                  {addedWaybills.length === 0 ? (
                    'No waybills added yet.'
                  ) : (
                    <><strong style={{ color: '#333' }}>{addedWaybills.length}</strong> waybill{addedWaybills.length > 1 ? 's' : ''} added.</>
                  )}
                </span>
                <Button size="small" onClick={openWaybillModal} disabled={availableWaybills.length === 0}>
                  + Add Waybill
                </Button>
              </div>

              {addedWaybills.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                        {['Waybill No.', 'Unloading Time', 'Truck Type', 'Origin', 'Destination', 'Basic Amount', 'Add. Charge', 'Exception Fee', ''].map((h, i) => (
                          <th key={i} style={{ padding: '8px 12px', fontWeight: 600, textAlign: [5, 6, 7].includes(i) ? 'right' : 'left', width: i === 8 ? 80 : undefined }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {addedWaybills.map((w) => (
                        <tr key={w.no} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1677ff' }}>{w.no}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>{w.unloadingTime}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12 }}>{w.truckType}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>{w.origin}</td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: '#555' }}>{w.destination}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(w.basicAmount)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(w.additionalCharge)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(w.exceptionFee)}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <Button
                              type="link"
                              size="small"
                              danger
                              onClick={() => setAddedWaybills((prev) => prev.filter((item) => item.no !== w.no))}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
                  No waybills added. Click "+ Add Waybill" to select.
                </div>
              )}
            </>
          )}

          {/* Claim Tab */}
          {activeTab === 'claim' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#666' }}>
                  {addedClaims.length === 0 ? (
                    'No claim tickets added yet.'
                  ) : (
                    <><strong style={{ color: '#333' }}>{addedClaims.length}</strong> claim ticket{addedClaims.length > 1 ? 's' : ''} added.</>
                  )}
                </span>
                <Button size="small" onClick={() => { setModalSelectedClaimNos(new Set()); setModalClaimFilter(''); setShowClaimModal(true); }} disabled={availableClaims.length === 0}>
                  + Add Claim Ticket
                </Button>
              </div>
              {addedClaims.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                      {['Claim Ticket No.', 'Type', 'Waybill No.', 'Amount', 'Currency', 'Created At', ''].map((h, i) => (
                        <th key={i} style={{ padding: '8px 12px', fontWeight: 600, textAlign: i === 3 ? 'right' : 'left', width: i === 6 ? 80 : undefined }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {addedClaims.map((c) => (
                      <tr key={c.ticketNo} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1677ff' }}>{c.ticketNo}</td>
                        <td style={{ padding: '8px 12px', fontSize: 12 }}>{c.claimType}</td>
                        <td style={{ padding: '8px 12px', fontSize: 12 }}>{c.relatedWaybill || '—'}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>{fmt(c.claimAmount)}</td>
                        <td style={{ padding: '8px 12px', fontSize: 12 }}>{c.currency || 'PHP'}</td>
                        <td style={{ padding: '8px 12px', fontSize: 12 }}>{c.createdAt || '—'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <Button
                            type="link"
                            size="small"
                            danger
                            onClick={() => setAddedClaims((prev) => prev.filter((item) => item.ticketNo !== c.ticketNo))}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
                  No claim tickets added. Click "+ Add Claim Ticket" to select.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Standard: Amount Summary ── */}
      {!isStandalone && (
        <div className={styles.cardSection}>
          <SectionTitle>Amount Summary</SectionTitle>

          {/* Total + Tax Mark */}
          <div className={styles.totalSummaryBar}>
            <div>
              <div className={styles.totalLabel}>Total Amount Receivable</div>
              <div className={styles.totalValue}>PHP {fmt(totalAmountPayable)}</div>
            </div>
            <div className={styles.divider} />
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Statement Tax Mark</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {(['Tax-inclusive', 'Tax-exclusive'] as const).map((mark) => (
                  <label key={mark} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="taxMark"
                      value={mark}
                      checked={taxMark === mark}
                      onChange={() => setTaxMark(mark)}
                    />
                    {mark}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 3-column grid */}
          <div className={styles.summaryGrid}>
            {/* Waybill Contract Price */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryColTitle}>Waybill Contract Price</div>
              <div>
                {[
                  { label: 'Vendor Basic Amount', key: 'basic' as SettlementItemKey, val: totals.basic },
                  { label: 'Vendor Exception Fee', key: 'exception' as SettlementItemKey, val: totals.exception },
                  { label: 'Vendor Additional Charge', key: 'additional' as SettlementItemKey, val: totals.additional },
                ].map(({ label, key, val }) => (
                  <div key={key} className={styles.summaryRow}>
                    <span className={styles.summaryRowLabel}>{label}</span>
                    <span
                      className={styles.summaryRowValue}
                      style={!isIncluded(key) ? { color: '#bbb', textDecoration: 'line-through' } : {}}
                    >
                      {fmt(val)}
                    </span>
                  </div>
                ))}
                <div className={styles.summarySubtotalRow}>
                  <span style={{ color: '#333' }}>Subtotal</span>
                  <span style={{ color: '#1a1a1a' }}>{fmt(waybillSubtotal)}</span>
                </div>
              </div>
            </div>
            <div className={styles.summaryColDivider} />

            {/* Claim */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryColTitle}>Claim</div>
              {addedClaims.length > 0 ? (
                <div>
                  {addedClaims.map((c) => (
                    <div key={c.ticketNo} className={styles.summaryRow}>
                      <span className={styles.summaryRowLabel}>{c.ticketNo}</span>
                      <span style={{ fontWeight: 500, color: '#cf1322' }}>-{fmt(c.claimAmount)}</span>
                    </div>
                  ))}
                  <div className={styles.summarySubtotalRow}>
                    <span style={{ color: '#333' }}>Subtotal</span>
                    <span style={{ color: '#cf1322' }}>-{fmt(claimTotal)}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: '#bbb', fontSize: 13 }}>
                  No claim deductions
                </div>
              )}
            </div>
            <div className={styles.summaryColDivider} />

            {/* Others */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryColTitle}>Others</div>
              <div>
                {/* VAT */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>VAT Rate</div>
                    <select
                      style={{ width: '100%', padding: '5px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                    >
                      {VAT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>WHT Rate</div>
                    <select
                      style={{ width: '100%', padding: '5px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
                      value={whtRate}
                      onChange={(e) => setWhtRate(Number(e.target.value))}
                    >
                      {WHT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                {vatRate > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryRowLabel} style={{ opacity: taxMark === 'Tax-exclusive' ? 0.38 : 1 }}>
                      VAT ({vatRate}%){taxMark === 'Tax-exclusive' && <span style={{ fontSize: 11, color: '#aaa', marginLeft: 4 }}>not included</span>}
                    </span>
                    <span style={{ fontWeight: 500, color: vatAmount > 0 ? '#389e0d' : '#999', opacity: taxMark === 'Tax-exclusive' ? 0.38 : 1 }}>
                      {vatAmount > 0 ? `+${fmt(vatAmount)}` : fmt(0)}
                    </span>
                  </div>
                )}
                {whtRate > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryRowLabel} style={{ opacity: taxMark === 'Tax-exclusive' ? 0.38 : 1 }}>
                      WHT ({whtRate}%){taxMark === 'Tax-exclusive' && <span style={{ fontSize: 11, color: '#aaa', marginLeft: 4 }}>not included</span>}
                    </span>
                    <span style={{ fontWeight: 500, color: whtAmount > 0 ? '#cf1322' : '#999', opacity: taxMark === 'Tax-exclusive' ? 0.38 : 1 }}>
                      {whtAmount > 0 ? `−${fmt(whtAmount)}` : fmt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice mismatch warning */}
          {hasInvoiceAmountMismatch && (
            <div style={{ marginTop: 12, padding: '8px 14px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, fontSize: 13, color: '#d48806' }}>
              ⚠ Total Invoice Amount ({fmt(totalInvoiceAmount)}) does not match Total Submitted Amount ({fmt(waybillSubtotal)}). You can still submit.
            </div>
          )}
        </div>
      )}

      {/* ── Standard: Invoice section ── */}
      {!isStandalone && (
        <div className={styles.cardSection}>
          <SectionTitle right={<Button size="small" onClick={() => setShowAddInvoice(true)}>+ Add Invoice</Button>}>
            Invoice
          </SectionTitle>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
            Optional — you can add invoices now or supplement them later. Multiple invoices supported.
          </div>
          {standardInvoices.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#bbb', fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
              No invoices added. Click "+ Add Invoice" to add.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  {['Invoice No.', 'Invoice Amount', 'Invoice Date', 'Attachment', 'OCR Status', ''].map((h, i) => (
                    <th key={i} style={{ padding: '8px 12px', fontWeight: 600, textAlign: i === 1 ? 'right' : 'left', width: i === 5 ? 80 : undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standardInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '8px 12px' }}>{inv.no || <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{inv.amount ? fmt(parseFloat(inv.amount)) : <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td style={{ padding: '8px 12px' }}>{inv.date || <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td style={{ padding: '8px 12px' }}>
                      {inv.attachmentName ? <span style={{ color: '#1677ff', fontSize: 12 }}>📎 {inv.attachmentName}</span> : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {inv.ocrState === 'done' && <span style={{ fontSize: 12, color: 'var(--primary-color)' }}>✓ Auto-filled</span>}
                      {inv.ocrState === 'scanning' && <span style={{ fontSize: 12, color: '#1677ff' }}>⟳ Scanning…</span>}
                      {inv.ocrState === 'failed' && <span style={{ fontSize: 12, color: '#ff4d4f' }}>✕ OCR failed</span>}
                      {inv.ocrState === 'idle' && <span style={{ color: '#bbb', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <Button type="link" size="small" danger onClick={() => setStandardInvoices((prev) => prev.filter((i) => i.id !== inv.id))}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Modals ── */}

      {/* Add Waybill Modal */}
      <Modal
        title="Add Waybill"
        open={showWaybillModal}
        width={780}
        onCancel={() => setShowWaybillModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowWaybillModal(false)}>Cancel</Button>,
          <Button key="add" type="primary" disabled={modalSelectedNos.size === 0} onClick={confirmAddWaybills}>
            Add ({modalSelectedNos.size})
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <input
            style={{ padding: '5px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, width: 160 }}
            placeholder="Waybill Number"
            value={modalWaybillFilter}
            onChange={(e) => setModalWaybillFilter(e.target.value)}
          />
          <select
            style={{ padding: '5px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}
            value={modalTruckTypeFilter}
            onChange={(e) => setModalTruckTypeFilter(e.target.value)}
          >
            <option value="">Truck Type: All</option>
            {truckTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>{modalSelectedNos.size} selected</span>
        </div>
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ width: 36, padding: '8px 12px' }}>
                  <input
                    type="checkbox"
                    checked={filteredModalWaybills.length > 0 && filteredModalWaybills.every((w) => modalSelectedNos.has(w.no))}
                    onChange={(e) => {
                      setModalSelectedNos((prev) => {
                        const n = new Set(prev);
                        if (e.target.checked) filteredModalWaybills.forEach((w) => n.add(w.no));
                        else filteredModalWaybills.forEach((w) => n.delete(w.no));
                        return n;
                      });
                    }}
                  />
                </th>
                {['Waybill No.', 'Position Time', 'Unloading Time', 'Truck Type', 'Basic Amount', 'Add. Charge'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 12px', fontWeight: 600, textAlign: [4, 5].includes(i) ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredModalWaybills.map((w) => {
                const checked = modalSelectedNos.has(w.no);
                return (
                  <tr
                    key={w.no}
                    style={{ borderBottom: '1px solid #f5f5f5', background: checked ? '#f0f7ff' : undefined, cursor: 'pointer' }}
                    onClick={() => toggleModalWaybill(w.no)}
                  >
                    <td style={{ padding: '8px 12px' }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={checked} onChange={() => toggleModalWaybill(w.no)} />
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{w.no}</td>
                    <td style={{ padding: '8px 12px' }}>{w.positionTime}</td>
                    <td style={{ padding: '8px 12px' }}>{w.unloadingTime}</td>
                    <td style={{ padding: '8px 12px' }}>{w.truckType}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(w.basicAmount)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{fmt(w.additionalCharge)}</td>
                  </tr>
                );
              })}
              {filteredModalWaybills.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '24px 0', textAlign: 'center', color: '#bbb' }}>No available waybills.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Add Claim Modal */}
      <Modal
        title="Add Claim Ticket"
        open={showClaimModal}
        width={600}
        onCancel={() => setShowClaimModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowClaimModal(false)}>Cancel</Button>,
          <Button
            key="add"
            type="primary"
            disabled={modalSelectedClaimNos.size === 0}
            onClick={() => {
              const toAdd = availableClaims.filter((c) => modalSelectedClaimNos.has(c.ticketNo));
              setAddedClaims((prev) => [...prev, ...toAdd]);
              setShowClaimModal(false);
            }}
          >
            Add ({modalSelectedClaimNos.size})
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <input
            style={{ padding: '5px 8px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, width: 200 }}
            placeholder="Claim Ticket No."
            value={modalClaimFilter}
            onChange={(e) => setModalClaimFilter(e.target.value)}
          />
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>{modalSelectedClaimNos.size} selected</span>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ width: 36, padding: '8px 12px' }}>
                  <input
                    type="checkbox"
                    checked={filteredModalClaims.length > 0 && filteredModalClaims.every((c) => modalSelectedClaimNos.has(c.ticketNo))}
                    onChange={(e) => {
                      setModalSelectedClaimNos((prev) => {
                        const n = new Set(prev);
                        if (e.target.checked) filteredModalClaims.forEach((c) => n.add(c.ticketNo));
                        else filteredModalClaims.forEach((c) => n.delete(c.ticketNo));
                        return n;
                      });
                    }}
                  />
                </th>
                {['Claim Ticket No.', 'Type', 'Waybill No.', 'Amount'].map((h, i) => (
                  <th key={i} style={{ padding: '8px 12px', fontWeight: 600, textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredModalClaims.map((c) => {
                const checked = modalSelectedClaimNos.has(c.ticketNo);
                return (
                  <tr
                    key={c.ticketNo}
                    style={{ borderBottom: '1px solid #f5f5f5', background: checked ? '#f0f7ff' : undefined, cursor: 'pointer' }}
                    onClick={() => toggleModalClaim(c.ticketNo)}
                  >
                    <td style={{ padding: '8px 12px' }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={checked} onChange={() => toggleModalClaim(c.ticketNo)} />
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{c.ticketNo}</td>
                    <td style={{ padding: '8px 12px' }}>{c.claimType}</td>
                    <td style={{ padding: '8px 12px' }}>{c.relatedWaybill || '—'}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>{fmt(c.claimAmount)}</td>
                  </tr>
                );
              })}
              {filteredModalClaims.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: '#bbb' }}>No available claim tickets.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Add Invoice Dialog (Standard) */}
      <AddInvoiceDialog
        open={showAddInvoice}
        onClose={() => setShowAddInvoice(false)}
        onAdd={addStandardInvoice}
        waybillSubtotal={waybillSubtotal}
      />

      {/* Submit Confirm Dialog */}
      <Modal
        title="Confirm Submission to TMS"
        open={showConfirm}
        width={460}
        onCancel={() => setShowConfirm(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowConfirm(false)}>Cancel</Button>,
          <Button key="confirm" type="primary" onClick={() => { setShowConfirm(false); handleSubmit(false); }}>
            Confirm &amp; Submit
          </Button>,
        ]}
      >
        <p style={{ margin: '0 0 14px', fontSize: 14, color: '#444' }}>
          Once submitted, you will <strong>not be able to modify</strong> this statement.
          Please review the summary below before confirming.
        </p>
        <div className={styles.confirmSummaryBox}>
          {(isStandalone
            ? [
                ['Statement Type', statementType],
                ['Reconciliation Period', reconciliationPeriod],
                ['Miscellaneous Charge Items', String(miscCharges.filter((m) => parseFloat(m.amount) > 0).length)],
                ['Invoices Added', String(standaloneInvoices.length)],
              ]
            : [
                ['Statement Type', statementType],
                ['Reconciliation Period', reconciliationPeriod],
                ['Waybills Added', String(addedWaybills.length)],
                ['Claim Tickets Added', String(addedClaims.length)],
                ['Basic Amount', isIncluded('basic') ? fmt(totals.basic) : '(not included)'],
                ['Additional Charge', isIncluded('additional') ? fmt(totals.additional) : '(not included)'],
                ['Exception Fee', isIncluded('exception') ? fmt(totals.exception) : '(not included)'],
                ['Reimbursement', isIncluded('reimbursement') ? fmt(totals.reimbursement) : '(not included)'],
                ...(claimTotal > 0 ? [['Claim Deduction', `−${fmt(claimTotal)}`]] : []),
                ...(vatRate > 0 ? [[`VAT (${vatRate}%)`, `+${fmt(vatAmount)}`]] : []),
                ...(whtRate > 0 ? [[`WHT (${whtRate}%)`, `−${fmt(whtAmount)}`]] : []),
                ['Tax Mark', taxMark],
              ]
          ).map((entry, i, arr) => {
            const [label, val] = entry as [string, string];
            return (
              <div
                key={i}
                className={styles.confirmSummaryRow}
                style={i === arr.length - 1 ? { borderBottom: 'none' } : undefined}
              >
                <span className={styles.confirmSummaryLabel}>{label}</span>
                <span
                  style={
                    label === 'Claim Deduction'
                      ? { color: '#0958d9', fontWeight: 500 }
                      : label.startsWith('VAT')
                      ? { color: '#389e0d', fontWeight: 500 }
                      : label.startsWith('WHT')
                      ? { color: '#cf1322', fontWeight: 500 }
                      : {}
                  }
                >
                  {val}
                </span>
              </div>
            );
          })}
          <div className={styles.confirmTotalRow}>
            <span>Total Amount Receivable</span>
            <span style={{ color: '#1a1a1a' }}>PHP {fmt(isStandalone ? miscTotal : totalAmountPayable)}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateStatement;
