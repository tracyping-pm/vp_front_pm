import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import {
  type SyncedApplication,
  formatDate,
  formatDateTime,
  getAllApplications,
  vpAppStatusLabel,
} from '@/pages/common/prepaidApplicationSync';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { history, useSearchParams } from '@umijs/max';
import { Button, Card, Descriptions, message, Modal, Space, Table, Tag, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { ensureSeedData } from './mock/applicationData';
import styles from './index.less';

const { Text, Link } = Typography;

interface InvoiceEntry {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  fileName: string;
  status: 'Active' | 'Voided';
  ocrLoading?: boolean;
}

type VpDisplayStatus =
  | 'Draft'
  | 'Awaiting Inteluck Confirmation'
  | 'Pending Receipt'
  | 'Collected'
  | 'Rejected'
  | 'Receipt Rejected';

function getStatusTagColor(label: string): string {
  switch (label) {
    case 'Draft':
      return 'default';
    case 'Awaiting Inteluck Confirmation':
      return 'warning';
    case 'Pending Receipt':
      return 'processing';
    case 'Collected':
      return 'success';
    case 'Rejected':
    case 'Receipt Rejected':
      return 'error';
    default:
      return 'default';
  }
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

const AdvancePaymentDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no') ?? undefined;

  const [app, setApp] = useState<SyncedApplication | null>(null);
  const [invoices, setInvoices] = useState<InvoiceEntry[]>([]);
  const [ocrLoadingId, setOcrLoadingId] = useState<string | null>(null);

  const loadApp = useCallback(() => {
    ensureSeedData();
    if (no) {
      const found = getAllApplications().find((a) => a.applicationNo === no);
      if (found) {
        setApp(found);
        // Seed invoices for non-draft states
        const vpLabel = vpAppStatusLabel(found.status);
        if (
          vpLabel !== 'Draft' &&
          vpLabel !== 'Rejected' &&
          vpLabel !== 'Receipt Rejected'
        ) {
          setInvoices([
            {
              id: `inv-${found.applicationNo}`,
              invoiceNo: `INV-${found.applicationNo.slice(-6)}`,
              invoiceDate: found.createdAt.slice(0, 10),
              amount: found.totalAmountPayable,
              fileName: `invoice_${found.applicationNo}.pdf`,
              status: 'Active',
            },
          ]);
        }
      } else {
        message.error('Application not found.');
        history.push(PATHS.VP_ADVANCE_PAYMENT);
      }
    }
  }, [no]);

  useEffect(() => {
    loadApp();
  }, [loadApp]);

  if (!app) return null;

  const vpLabel = vpAppStatusLabel(app.status);
  const isReceiptRejected = vpLabel === 'Receipt Rejected';
  const isRejected = vpLabel === 'Rejected';
  const canEditResubmit = isReceiptRejected || isRejected;

  const sourceBadgeClass =
    app.source === 'Vendor Portal' ? styles.originSelf : styles.originInteluck;

  const totalAdvancePayment = app.waybills.reduce(
    (sum, w) => sum + (w.prePaidAmount || 0),
    0,
  );

  const showInvoice =
    vpLabel !== 'Draft' &&
    vpLabel !== 'Rejected' &&
    vpLabel !== 'Receipt Rejected';

  // ── Invoice handlers ──────────────────────────────────────────────────

  const handleAddInvoice = () => {
    const newId = `inv-${Date.now()}`;
    const newInvoice: InvoiceEntry = {
      id: newId,
      invoiceNo: '',
      invoiceDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      fileName: `invoice_${invoices.length + 1}.pdf`,
      status: 'Active',
      ocrLoading: true,
    };
    setInvoices((prev) => [...prev, newInvoice]);
    setOcrLoadingId(newId);

    // OCR simulation — 1.5s delay auto-fill
    setTimeout(() => {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === newId
            ? {
                ...inv,
                ocrLoading: false,
                invoiceNo: `INV-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
                amount: app.totalAmountPayable,
              }
            : inv,
        ),
      );
      setOcrLoadingId(null);
      message.success('OCR complete — invoice details auto-filled.');
    }, 1500);
  };

  const handleVoidInvoice = (id: string) => {
    Modal.confirm({
      title: 'Void Invoice',
      content: 'Are you sure you want to void this invoice? This action cannot be undone.',
      okText: 'Void',
      okButtonProps: { danger: true },
      onOk: () => {
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.id === id ? { ...inv, status: 'Voided' } : inv,
          ),
        );
        message.success('Invoice voided.');
      },
    });
  };

  // ── Edit & Resubmit ───────────────────────────────────────────────────

  const handleEditResubmit = () => {
    history.push(`${PATHS.VP_ADVANCE_PAYMENT_CREATE}?no=${app.applicationNo}`);
  };

  // ── Table columns ─────────────────────────────────────────────────────

  const waybillColumns = [
    {
      title: 'Waybill',
      dataIndex: 'no',
      width: 120,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    { title: 'Position Time', dataIndex: 'positionTime', width: 150 },
    { title: 'Unloading Time', dataIndex: 'unloadingTime', width: 150 },
    { title: 'Truck Type', dataIndex: 'truckType', width: 110 },
    { title: 'Origin', dataIndex: 'origin' },
    { title: 'Destination', dataIndex: 'destination' },
    {
      title: 'Advance Payment Amount',
      dataIndex: 'prePaidAmount',
      width: 180,
      align: 'right' as const,
      render: (val: number) =>
        val > 0 ? (
          fmt(val)
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  const invoiceColumns = [
    {
      title: 'Invoice No.',
      dataIndex: 'invoiceNo',
      width: 160,
      render: (v: string, record: InvoiceEntry) =>
        record.ocrLoading ? (
          <Text type="secondary" italic>
            Scanning…
          </Text>
        ) : (
          <Text strong>{v}</Text>
        ),
    },
    { title: 'Invoice Date', dataIndex: 'invoiceDate', width: 130 },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 140,
      align: 'right' as const,
      render: (val: number, record: InvoiceEntry) =>
        record.ocrLoading ? (
          <Text type="secondary" italic>
            —
          </Text>
        ) : (
          fmt(val)
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => (
        <Tag color={v === 'Active' ? 'success' : 'default'}>{v}</Tag>
      ),
    },
    {
      title: 'Attachment',
      dataIndex: 'fileName',
      render: (v: string) => (
        <Link style={{ fontSize: 12 }}>
          <FileTextOutlined /> {v}
        </Link>
      ),
    },
    {
      title: 'Actions',
      width: 100,
      render: (_: any, record: InvoiceEntry) =>
        record.status === 'Active' && !record.ocrLoading ? (
          <Button
            type="link"
            danger
            size="small"
            onClick={() => handleVoidInvoice(record.id)}
          >
            Void
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Advance Payment Requests', path: PATHS.VP_ADVANCE_PAYMENT },
          { name: app.applicationNo, path: PATHS.VP_ADVANCE_PAYMENT_DETAIL },
        ]}
      />

      {/* Reject reason banner */}
      {(isRejected || isReceiptRejected) &&
        (app.rejectReason || app.hrRejectReason) && (
          <div className={styles.rejectBanner}>
            <div className={styles.rejectBannerTitle}>
              {isReceiptRejected
                ? 'HR Receipt Rejected'
                : 'Application Rejected by TMS'}
            </div>
            <div style={{ color: '#333' }}>
              Reject Reason: {app.hrRejectReason || app.rejectReason}
            </div>
          </div>
        )}

      {/* Header bar */}
      <Card
        style={{ marginBottom: 16 }}
        bodyStyle={{ display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <span className={styles.appNo}>{app.applicationNo}</span>
        <Tag color={getStatusTagColor(vpLabel)} style={{ fontSize: 13, padding: '2px 12px' }}>
          {vpLabel}
        </Tag>
        <span className={`${styles.badgeBase} ${sourceBadgeClass}`} style={{ fontSize: 13, padding: '3px 12px' }}>
          {app.source === 'Vendor Portal' ? 'Self-Created' : 'Inteluck'}
        </span>
        <div style={{ flex: 1 }} />
        {canEditResubmit && (
          <Button type="primary" onClick={handleEditResubmit}>
            Edit &amp; Resubmit
          </Button>
        )}
      </Card>

      {/* Basic Information */}
      <Card title="Basic Information" bordered size="small" style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="Application No.">
            <Text strong>{app.applicationNo}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Application Type">{app.appType}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusTagColor(vpLabel)}>{vpLabel}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Vendor">
            <Text strong>{app.vendorName}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Currency">{app.currency}</Descriptions.Item>
          <Descriptions.Item label="Tax Mark">{app.taxMark}</Descriptions.Item>
          <Descriptions.Item label="Total Amount Receivable">
            <Text strong>{fmt(app.totalAmountPayable)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Create Date">{formatDate(app.createdAt)}</Descriptions.Item>
          {app.submittedAt && (
            <Descriptions.Item label="Submitted At">{formatDateTime(app.submittedAt)}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Associated Waybills */}
      <Card
        title={`Associate Waybills (${app.waybills.length})`}
        bordered
        size="small"
        style={{ marginBottom: 16 }}
      >
        {app.waybills.length === 0 ? (
          <div style={{ color: 'var(--character-title-45)', fontSize: 13 }}>No waybills.</div>
        ) : (
          <Table
            dataSource={app.waybills}
            columns={waybillColumns}
            rowKey="no"
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
                <Table.Summary.Cell index={0} colSpan={6} align="right">
                  <Text style={{ color: '#595959' }}>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text style={{ color: '#237804' }}>
                    {fmt(totalAdvancePayment)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        )}
      </Card>

      {/* Invoice Management */}
      {showInvoice && (
        <Card
          title={`Invoice (${invoices.filter((i) => i.status === 'Active').length})`}
          bordered
          size="small"
          style={{ marginBottom: 16 }}
          extra={
            <Button
              icon={<PlusOutlined />}
              onClick={handleAddInvoice}
              disabled={ocrLoadingId !== null}
              size="small"
            >
              Add Invoice
            </Button>
          }
        >
          <Table
            dataSource={invoices}
            columns={invoiceColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Receiving Account */}
      <Card title="Receiving Account" bordered size="small" style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small" column={3}>
          <Descriptions.Item label="Bank Name">{app.bankName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Bank Account Name">{app.payeeName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Payee Account">{app.payeeAccount || '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Remark */}
      <Card title="Remark" bordered size="small" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: app.remark ? 'var(--character-title-85)' : 'var(--character-title-25)', minHeight: 40 }}>
          {app.remark || '—'}
        </div>
      </Card>

      {/* Supporting Documents */}
      <Card title="Supporting Documents" bordered size="small" style={{ marginBottom: 16 }}>
        {app.proofFiles.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--character-title-45)' }}>No documents uploaded.</div>
        ) : (
          <div className={styles.docGrid}>
            {app.proofFiles.map((f, i) => (
              <div key={i} className={styles.docTile}>
                <span className={styles.docTileIcon}>📄</span>
                <span className={styles.docTileName}>{f}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Operation Log */}
      <Card title="Operation Log" bordered size="small" style={{ marginBottom: 16 }}>
        {(app.operationLogs || []).length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--character-title-45)' }}>No records.</div>
        ) : (
          <div className={styles.logList}>
            {(app.operationLogs || []).map((log, i) => (
              <div key={i} className={styles.logRow}>
                <span className={styles.logTime}>{formatDateTime(log.time)}</span>
                <span className={styles.logActor}>{log.actor}</span>
                <span className={styles.logAction}>
                  {log.action}
                  {log.note && (
                    <span className={styles.logNote}>— {log.note}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};

export default AdvancePaymentDetail;
