import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import { PaperClipOutlined } from '@ant-design/icons';
import {
  type OperationLogEntry,
  type SyncedApplication,
  type SyncedWaybill,
  formatDateTime,
  getAllApplications,
  nextApplicationNo,
  nowIso,
  recomputeTotal,
  upsertApplication,
} from '@/pages/common/prepaidApplicationSync';
import { history, useSearchParams } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  InputNumber,
  message,
  Modal,
  Space,
  Table,
  Typography,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ensureSeedData } from './mock/applicationData';
import { CANDIDATE_WAYBILLS, type CandidateWaybill } from './mock/waybills';
import styles from './index.less';

const { Text, Link } = Typography;

const VENDOR_NAME = 'Coca-Cola Bottlers PH Inc.';

interface BankInfoEntry {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  proof: string;
}

interface InvoiceEntry {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  fileName: string;
}

const DEFAULT_BANK_INFOS: BankInfoEntry[] = [
  {
    id: 'bpi-main',
    bankName: 'BPI',
    accountName: VENDOR_NAME,
    accountNumber: '1234-5678-90',
    proof: 'bpi_bank_certificate.pdf',
  },
  {
    id: 'bdo-operating',
    bankName: 'BDO',
    accountName: VENDOR_NAME,
    accountNumber: '9876-5432-10',
    proof: 'bdo_account_proof.pdf',
  },
  {
    id: 'unionbank-ap',
    bankName: 'UnionBank',
    accountName: VENDOR_NAME,
    accountNumber: '5555-1111-22',
    proof: 'unionbank_vendor_proof.pdf',
  },
];

function defaultEmptyApp(): SyncedApplication {
  return {
    applicationNo: nextApplicationNo(),
    vendorName: VENDOR_NAME,
    source: 'Vendor Portal',
    appType: 'Advance Payment Request',
    status: 'Draft',
    taxMark: 'VAT-ex',
    currency: 'PHP',
    waybills: [],
    claimTickets: [],
    paymentItems: [],
    deductionItems: [],
    totalAmountPayable: 0,
    payeeType: 'External Vendor',
    payeeName: VENDOR_NAME,
    bankName: '',
    payeeAccount: '',
    proofFiles: [],
    remark: '',
    createdAt: nowIso(),
  };
}

const AdvancePaymentCreate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no') ?? undefined;

  const [app, setApp] = useState<SyncedApplication>(() => defaultEmptyApp());
  const [appLoaded, setAppLoaded] = useState(false);

  // Invoice state
  const [invoices, setInvoices] = useState<InvoiceEntry[]>([]);

  // Bank state
  const [bankInfos, setBankInfos] = useState<BankInfoEntry[]>(DEFAULT_BANK_INFOS);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    proof: '',
  });

  // Waybill modal
  const [showAddWaybill, setShowAddWaybill] = useState(false);
  const [pickedCandidates, setPickedCandidates] = useState<Set<string>>(new Set());

  // Validation
  const [validationError, setValidationError] = useState('');

  // Load existing app if editing
  useEffect(() => {
    ensureSeedData();
    if (no) {
      const found = getAllApplications().find((a) => a.applicationNo === no);
      if (found) {
        setApp(found);

        // Restore bank selection
        if (found.bankName && found.payeeAccount) {
          const existingEntry: BankInfoEntry = {
            id: `saved-${found.applicationNo}`,
            bankName: found.bankName,
            accountName: found.payeeName || VENDOR_NAME,
            accountNumber: found.payeeAccount,
            proof: found.bankProof || found.proofFiles?.[0] || '',
          };
          const sameDefault = DEFAULT_BANK_INFOS.some(
            (item) =>
              item.bankName === existingEntry.bankName &&
              item.accountNumber === existingEntry.accountNumber,
          );
          if (!sameDefault) {
            setBankInfos([existingEntry, ...DEFAULT_BANK_INFOS]);
            setSelectedBankId(existingEntry.id);
          } else {
            const match = DEFAULT_BANK_INFOS.find(
              (item) =>
                item.bankName === found.bankName &&
                item.accountNumber === found.payeeAccount,
            );
            if (match) setSelectedBankId(match.id);
          }
        }
      }
    }
    setAppLoaded(true);
  }, [no]);

  const isEditable =
    app.status === 'Draft' ||
    app.status === 'Rejected' ||
    app.status === 'Payment Rejected' ||
    app.status === 'Receipt Rejected';

  const totalAmountPayable = useMemo(
    () => recomputeTotal(app.waybills),
    [app.waybills],
  );

  const availableCandidates = CANDIDATE_WAYBILLS.filter(
    (c) => !app.waybills.find((w) => w.no === c.no),
  );

  // ── Waybill handlers ───────────────────────────────────────────────────

  const updateWaybillAmount = (waybillNo: string, value: number | null) => {
    setApp((prev) => ({
      ...prev,
      waybills: prev.waybills.map((w) =>
        w.no === waybillNo ? { ...w, prePaidAmount: value ?? 0 } : w,
      ),
    }));
  };

  const removeWaybill = (waybillNo: string) => {
    setApp((prev) => ({
      ...prev,
      waybills: prev.waybills.filter((w) => w.no !== waybillNo),
    }));
  };

  const handleAddWaybills = () => {
    const existing = new Set(app.waybills.map((w) => w.no));
    const toAdd: SyncedWaybill[] = CANDIDATE_WAYBILLS.filter(
      (c) => pickedCandidates.has(c.no) && !existing.has(c.no),
    ).map((c) => ({
      no: c.no,
      positionTime: c.positionTime,
      unloadingTime: c.unloadingTime,
      truckType: c.truckType,
      origin: c.origin,
      destination: c.destination,
      prePaidAmount: 0,
    }));

    if (toAdd.length === 0) {
      setShowAddWaybill(false);
      return;
    }

    setApp((prev) => ({ ...prev, waybills: [...prev.waybills, ...toAdd] }));
    setPickedCandidates(new Set());
    setShowAddWaybill(false);
    message.success(`${toAdd.length} waybill(s) added.`);
  };

  // ── Bank handlers ──────────────────────────────────────────────────────

  const selectBankInfo = (entry: BankInfoEntry) => {
    setSelectedBankId(entry.id);
    setApp((prev) => ({
      ...prev,
      bankName: entry.bankName,
      payeeName: entry.accountName,
      payeeAccount: entry.accountNumber,
      bankProof: entry.proof,
      proofFiles:
        entry.proof && !prev.proofFiles.includes(entry.proof)
          ? [...prev.proofFiles, entry.proof]
          : prev.proofFiles,
    }));
  };

  const handleAddBankInfo = () => {
    if (
      !bankForm.bankName.trim() ||
      !bankForm.accountName.trim() ||
      !bankForm.accountNumber.trim() ||
      !bankForm.proof.trim()
    ) {
      return;
    }
    const nextEntry: BankInfoEntry = {
      id: `bank-${Date.now()}`,
      bankName: bankForm.bankName.trim(),
      accountName: bankForm.accountName.trim(),
      accountNumber: bankForm.accountNumber.trim(),
      proof: bankForm.proof.trim(),
    };
    setBankInfos((prev) => [nextEntry, ...prev]);
    selectBankInfo(nextEntry);
    setBankForm({ bankName: '', accountName: '', accountNumber: '', proof: '' });
    setShowAddBank(false);
    message.success('Receiving account added.');
  };

  // ── Submit/Save handlers ───────────────────────────────────────────────

  const validate = (): string => {
    if (app.waybills.length === 0) return 'Please add at least one waybill.';
    if (app.waybills.some((w) => w.prePaidAmount <= 0))
      return 'Each waybill must have an Advance Payment greater than 0.';
    if (!app.bankName || !app.payeeName || !app.payeeAccount)
      return 'Please select a complete Receiving Account entry.';
    return '';
  };

  const handleSaveAsDraft = () => {
    const now = nowIso();
    const logEntry: OperationLogEntry = {
      time: now,
      actor: 'Vendor',
      action: 'Saved as Draft',
    };
    const next: SyncedApplication = {
      ...app,
      status: 'Draft',
      totalAmountPayable,
      operationLogs: [...(app.operationLogs || []), logEntry],
    };
    upsertApplication(next);
    setApp(next);
    setValidationError('');
    message.success('Saved as Draft.');
    setTimeout(() => history.push(PATHS.VP_ADVANCE_PAYMENT), 600);
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    const now = nowIso();
    const logEntry: OperationLogEntry = {
      time: now,
      actor: 'Vendor',
      action: 'Submitted',
      note: 'Awaiting TMS review',
    };
    const next: SyncedApplication = {
      ...app,
      status: 'Awaiting Inteluck Confirmation',
      totalAmountPayable,
      submittedAt: now,
      operationLogs: [...(app.operationLogs || []), logEntry],
    };
    upsertApplication(next);
    setApp(next);
    setValidationError('');
    message.success('Submitted to TMS for review.');
    setTimeout(() => history.push(PATHS.VP_ADVANCE_PAYMENT), 800);
  };

  if (!appLoaded) return null;

  // ── Waybill modal columns ──────────────────────────────────────────────

  const waybillModalColumns = [
    {
      title: (
        <Checkbox
          checked={pickedCandidates.size === availableCandidates.length && availableCandidates.length > 0}
          indeterminate={pickedCandidates.size > 0 && pickedCandidates.size < availableCandidates.length}
          onChange={() => {
            if (pickedCandidates.size === availableCandidates.length) {
              setPickedCandidates(new Set());
            } else {
              setPickedCandidates(new Set(availableCandidates.map((c) => c.no)));
            }
          }}
        />
      ),
      width: 48,
      render: (_: any, record: CandidateWaybill) => (
        <Checkbox
          checked={pickedCandidates.has(record.no)}
          onChange={() => {
            setPickedCandidates((prev) => {
              const next = new Set(prev);
              if (next.has(record.no)) next.delete(record.no);
              else next.add(record.no);
              return next;
            });
          }}
        />
      ),
    },
    { title: 'Waybill', dataIndex: 'no', width: 120, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Status', dataIndex: 'status', width: 100 },
    { title: 'Truck Type', dataIndex: 'truckType', width: 110 },
    { title: 'Origin', dataIndex: 'origin' },
    { title: 'Destination', dataIndex: 'destination' },
  ];

  // ── Associated waybills table columns ──────────────────────────────────

  const waybillColumns = [
    { title: 'Waybill', dataIndex: 'no', width: 120, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Position Time', dataIndex: 'positionTime', width: 150 },
    { title: 'Unloading Time', dataIndex: 'unloadingTime', width: 150 },
    { title: 'Truck Type', dataIndex: 'truckType', width: 110 },
    { title: 'Origin', dataIndex: 'origin' },
    { title: 'Destination', dataIndex: 'destination' },
    {
      title: 'Advance Payment',
      dataIndex: 'prePaidAmount',
      width: 160,
      align: 'right' as const,
      render: (val: number, record: SyncedWaybill) =>
        isEditable ? (
          <InputNumber
            style={{ width: 120, textAlign: 'right' }}
            value={val === 0 ? undefined : val}
            placeholder="0.00"
            min={0}
            precision={2}
            onChange={(v) => updateWaybillAmount(record.no, v)}
          />
        ) : (
          val.toLocaleString('en-US', { minimumFractionDigits: 2 })
        ),
    },
    ...(isEditable
      ? [
          {
            title: 'Actions',
            width: 80,
            render: (_: any, record: SyncedWaybill) => (
              <Button
                type="link"
                danger
                size="small"
                onClick={() => removeWaybill(record.no)}
              >
                Remove
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Advance Payment Requests', path: PATHS.VP_ADVANCE_PAYMENT },
          { name: app.applicationNo, path: PATHS.VP_ADVANCE_PAYMENT_CREATE },
        ]}
      />

      {/* Header bar */}
      <Card style={{ marginBottom: 16 }} bodyStyle={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className={styles.appNo}>{app.applicationNo}</span>
        <span
          className={`${styles.badgeBase} ${styles.statusDraft}`}
          style={{ fontSize: 13, padding: '3px 12px' }}
        >
          {app.status === 'Draft'
            ? 'Draft'
            : app.status === 'Rejected'
            ? 'Rejected'
            : app.status === 'Receipt Rejected' || app.status === 'Payment Rejected'
            ? 'Receipt Rejected'
            : app.status}
        </span>
        <span className={`${styles.badgeBase} ${styles.originSelf}`} style={{ fontSize: 13, padding: '3px 12px' }}>
          Self-Created
        </span>
        <div style={{ flex: 1 }} />
        {isEditable && (
          <Space>
            <Button onClick={handleSaveAsDraft}>Save as Draft</Button>
            <Button
              type="primary"
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
              onClick={handleSubmit}
            >
              Submit to TMS
            </Button>
          </Space>
        )}
      </Card>

      {/* Validation error */}
      {validationError && (
        <Alert
          type="error"
          message={validationError}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Basic Information */}
      <Card title="Basic Information" bordered size="small" style={{ marginBottom: 16 }}>
        <div className={styles.basicInfoGrid}>
          <div>
            <div className={styles.infoFieldLabel}>Total Amount Receivable</div>
            <div className={styles.infoFieldValue}>
              {totalAmountPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className={styles.infoFieldLabel}>Application Type</div>
            <div>Advance Payment Request</div>
          </div>
          <div>
            <div className={styles.infoFieldLabel}>Create Date</div>
            <div>{app.createdAt.slice(0, 10)}</div>
          </div>
        </div>
      </Card>

      {/* Associate Waybills */}
      <Card
        title="Associate Waybills"
        bordered
        size="small"
        style={{ marginBottom: 16 }}
        extra={isEditable && <Button size="small" onClick={() => setShowAddWaybill(true)}>+ Add Waybill</Button>}
      >
        {app.waybills.length === 0 ? (
          <div style={{ color: 'var(--character-title-45)', textAlign: 'center', padding: 24, fontSize: 13 }}>
            No waybills added yet. Click &quot;+ Add Waybill&quot; to start.
          </div>
        ) : (
          <Table
            dataSource={app.waybills}
            columns={waybillColumns}
            rowKey="no"
            pagination={false}
            size="small"
          />
        )}

        {/* Total row */}
        <div className={styles.totalRow}>
          <span className={styles.totalRowLabel}>Total Advance Payment Amount</span>
          <span className={styles.totalRowValue}>
            {totalAmountPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      {/* Invoice */}
      <Card
        title={`Invoice (${invoices.length})`}
        bordered
        size="small"
        style={{ marginBottom: 16 }}
        extra={
          isEditable && (
            <Button
              size="small"
              onClick={() => {
                const newInvoice: InvoiceEntry = {
                  id: `inv-${Date.now()}`,
                  invoiceNo: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
                  invoiceDate: new Date().toISOString().slice(0, 10),
                  amount: 0,
                  fileName: `invoice_${invoices.length + 1}.pdf`,
                };
                setInvoices((prev) => [...prev, newInvoice]);
                message.success('Invoice added.');
              }}
            >
              + Add Invoice
            </Button>
          )
        }
      >
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#bbb', padding: 24, fontSize: 13, border: '1px dashed #e8e8e8', borderRadius: 4 }}>
            No invoices added yet. Click &quot;+ Add Invoice&quot; to attach an invoice.
          </div>
        ) : (
          <Table
            dataSource={invoices}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: 'Invoice No.',
                dataIndex: 'invoiceNo',
                render: (v: string) => <Text strong>{v}</Text>,
              },
              {
                title: 'Invoice Date',
                dataIndex: 'invoiceDate',
              },
              {
                title: 'Amount',
                dataIndex: 'amount',
                align: 'right' as const,
                render: (v: number, record: InvoiceEntry) =>
                  isEditable ? (
                    <InputNumber
                      size="small"
                      style={{ width: 120, textAlign: 'right' }}
                      min={0}
                      precision={2}
                      value={v || undefined}
                      placeholder="0.00"
                      onChange={(val) =>
                        setInvoices((prev) =>
                          prev.map((i) =>
                            i.id === record.id ? { ...i, amount: val ?? 0 } : i,
                          ),
                        )
                      }
                    />
                  ) : (
                    v.toLocaleString('en-US', { minimumFractionDigits: 2 })
                  ),
              },
              {
                title: 'Attachment',
                dataIndex: 'fileName',
                render: (v: string) => (
                  <Link style={{ fontSize: 12 }}>
                    <PaperClipOutlined /> {v}
                  </Link>
                ),
              },
              ...(isEditable
                ? [
                    {
                      title: '',
                      key: 'actions',
                      width: 80,
                      render: (_: unknown, record: InvoiceEntry) => (
                        <Button
                          type="link"
                          danger
                          size="small"
                          onClick={() => {
                            setInvoices((prev) => prev.filter((i) => i.id !== record.id));
                            message.success('Invoice removed.');
                          }}
                        >
                          Remove
                        </Button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </Card>

      {/* Receiving Account */}
      <Card
        title="Receiving Account"
        bordered
        size="small"
        style={{ marginBottom: 16 }}
        extra={isEditable && <Button size="small" onClick={() => setShowAddBank(true)}>+ Add Receiving Account</Button>}
      >
        <div className={styles.bankGrid}>
          {bankInfos.map((entry) => {
            const selected = selectedBankId === entry.id;
            return (
              <label
                key={entry.id}
                className={`${styles.bankCard} ${selected ? styles.bankCardSelected : ''} ${
                  !isEditable ? styles.bankCardDisabled : ''
                }`}
              >
                <input
                  type="radio"
                  name="bankInfo"
                  checked={selected}
                  disabled={!isEditable}
                  onChange={() => isEditable && selectBankInfo(entry)}
                  style={{ marginTop: 3 }}
                />
                <div style={{ display: 'grid', gap: 8 }}>
                  <div>
                    <div className={styles.bankFieldLabel}>Bank Name</div>
                    <div className={styles.bankFieldValue}>{entry.bankName}</div>
                  </div>
                  <div>
                    <div className={styles.bankFieldLabel}>Bank Account Name</div>
                    <div>{entry.accountName}</div>
                  </div>
                  <div>
                    <div className={styles.bankFieldLabel}>Bank Account Number</div>
                    <div>{entry.accountNumber}</div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Remark */}
      <Card title="Remark" bordered size="small" style={{ marginBottom: 16 }}>
        <Input.TextArea
          style={{ width: '100%', height: 100, resize: 'vertical' }}
          placeholder="Optional — add any notes for the reviewer."
          value={app.remark || ''}
          onChange={(e) => setApp((prev) => ({ ...prev, remark: e.target.value }))}
          disabled={!isEditable}
        />
      </Card>

      {/* Supporting Documents */}
      <Card title="Supporting Documents" bordered size="small" style={{ marginBottom: 16 }}>
        <div className={styles.docGrid}>
          {app.proofFiles.map((f, i) => (
            <div key={i} className={styles.docTile}>
              <span className={styles.docTileIcon}>📄</span>
              <span className={styles.docTileName}>{f}</span>
              {isEditable && (
                <button
                  className={styles.docRemoveBtn}
                  onClick={() =>
                    setApp((prev) => ({
                      ...prev,
                      proofFiles: prev.proofFiles.filter((_, j) => j !== i),
                    }))
                  }
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {isEditable && (
            <div
              className={styles.docAddTile}
              onClick={() => {
                const name = `proof_${app.proofFiles.length + 1}.pdf`;
                setApp((prev) => ({
                  ...prev,
                  proofFiles: [...prev.proofFiles, name],
                }));
              }}
            >
              +
            </div>
          )}
          {app.proofFiles.length === 0 && !isEditable && (
            <span style={{ fontSize: 13, color: 'var(--character-title-45)' }}>No documents uploaded.</span>
          )}
        </div>
      </Card>

      {/* Operation Log */}
      {(app.operationLogs || []).length > 0 && (
        <Card title="Operation Log" bordered size="small" style={{ marginBottom: 16 }}>
          <div className={styles.logList}>
            {(app.operationLogs || []).map((log, i) => (
              <div key={i} className={styles.logRow}>
                <span className={styles.logTime}>{formatDateTime(log.time)}</span>
                <span className={styles.logActor}>{log.actor}</span>
                <span className={styles.logAction}>
                  {log.action}
                  {log.note && <span className={styles.logNote}>— {log.note}</span>}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Add Waybill Modal ── */}
      <Modal
        title="Add Waybill(s)"
        open={showAddWaybill}
        width={780}
        onCancel={() => {
          setShowAddWaybill(false);
          setPickedCandidates(new Set());
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowAddWaybill(false);
              setPickedCandidates(new Set());
            }}
          >
            Cancel
          </Button>,
          <Button
            key="add"
            type="primary"
            disabled={pickedCandidates.size === 0}
            onClick={handleAddWaybills}
          >
            Add{pickedCandidates.size > 0 ? ` (${pickedCandidates.size})` : ''}
          </Button>,
        ]}
      >
        <p style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
          Only waybills with status <strong>Planning</strong>,{' '}
          <strong>Pending</strong>, or <strong>In Transit</strong> are eligible.
          Basic amounts are not shown (price blackbox).
        </p>
        {availableCandidates.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#bbb', padding: 24 }}>
            No more eligible waybills.
          </div>
        ) : (
          <Table
            dataSource={availableCandidates}
            columns={waybillModalColumns}
            rowKey="no"
            pagination={false}
            size="small"
          />
        )}
      </Modal>

      {/* ── Add Receiving Account Modal ── */}
      <Modal
        title="Add Receiving Account"
        open={showAddBank}
        onCancel={() => {
          setShowAddBank(false);
          setBankForm({ bankName: '', accountName: '', accountNumber: '', proof: '' });
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowAddBank(false);
              setBankForm({
                bankName: '',
                accountName: '',
                accountNumber: '',
                proof: '',
              });
            }}
          >
            Cancel
          </Button>,
          <Button
            key="add"
            type="primary"
            disabled={
              !bankForm.bankName.trim() ||
              !bankForm.accountName.trim() ||
              !bankForm.accountNumber.trim() ||
              !bankForm.proof.trim()
            }
            onClick={handleAddBankInfo}
          >
            Add
          </Button>,
        ]}
        width={540}
      >
        <div className={styles.modalFormGrid}>
          <div>
            <div className={styles.modalFieldLabel}>
              Bank Name <span className={styles.required}>*</span>
            </div>
            <Input
              value={bankForm.bankName}
              onChange={(e) =>
                setBankForm((prev) => ({ ...prev, bankName: e.target.value }))
              }
            />
          </div>
          <div>
            <div className={styles.modalFieldLabel}>
              Bank Account Name <span className={styles.required}>*</span>
            </div>
            <Input
              value={bankForm.accountName}
              onChange={(e) =>
                setBankForm((prev) => ({ ...prev, accountName: e.target.value }))
              }
            />
          </div>
          <div>
            <div className={styles.modalFieldLabel}>
              Bank Account Number <span className={styles.required}>*</span>
            </div>
            <Input
              value={bankForm.accountNumber}
              onChange={(e) =>
                setBankForm((prev) => ({ ...prev, accountNumber: e.target.value }))
              }
            />
          </div>
          <div>
            <div className={styles.modalFieldLabel}>
              Proof <span className={styles.required}>*</span>
            </div>
            <Input
              placeholder="bank_proof.pdf"
              value={bankForm.proof}
              onChange={(e) =>
                setBankForm((prev) => ({ ...prev, proof: e.target.value }))
              }
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdvancePaymentCreate;
