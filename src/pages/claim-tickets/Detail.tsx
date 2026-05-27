import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import { ExclamationCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { history, useSearchParams } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Modal,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';
import DisputeClaimModal from './components/DisputeClaimModal';
import styles from './index.less';
import { CLAIM_TICKETS, type ClaimStatus } from './mock/claimTickets';

const { Text, Title } = Typography;

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

const ClaimTicketDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ticketNo = searchParams.get('ticketNo') || '';

  const ticket = CLAIM_TICKETS.find((t) => t.ticketNo === ticketNo);

  // Local state for status transitions (mock)
  const [statusOverride, setStatusOverride] = useState<ClaimStatus | null>(
    null,
  );
  const [disputeNote, setDisputeNote] = useState<{
    reason: string;
    files: string[];
  } | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);

  if (!ticket) {
    return (
      <>
        <BreadcrumbCase
          items={[
            { name: 'Claim Tickets', path: PATHS.CLAIM_TICKETS },
            { name: 'Detail', path: PATHS.CLAIM_TICKETS_DETAIL },
          ]}
        />
        <Card>
          <Empty description={`Ticket ${ticketNo} not found.`} />
        </Card>
      </>
    );
  }

  const status = displayStatus(statusOverride || ticket.status);
  const canAct = status === 'Pending Confirm';

  const handleConfirm = () => {
    Modal.confirm({
      title: 'Confirm Claim Ticket',
      icon: <ExclamationCircleOutlined />,
      content:
        'Are you sure you want to confirm this claim? The ticket will move to "For Deduction" status and become read-only.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: () => {
        setStatusOverride('For Deduction');
      },
    });
  };

  const handleDisputeSubmitted = (data: {
    reason: string;
    files: string[];
  }) => {
    setStatusOverride('Disputed');
    setDisputeNote(data);
    setDisputeModalOpen(false);
  };

  return (
    <div className={styles.claimDetailPage}>
      <BreadcrumbCase
        items={[
          { name: 'Claim Tickets', path: PATHS.CLAIM_TICKETS },
          { name: ticketNo, path: PATHS.CLAIM_TICKETS_DETAIL },
        ]}
      />

      {/* Header Card */}
      <Card className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div>
            <Title level={4} className={styles.ticketTitle}>
              {ticket.ticketNo}
            </Title>
            <div className={styles.ticketMeta}>
              Created by {ticket.creator} | {ticket.creationTime}
            </div>
          </div>
          <Tag color={getStatusColor(status)}>{status}</Tag>
        </div>

        {canAct && (
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
            message={
              <span>
                This Claim Ticket is awaiting your confirmation. Please verify
                the claim amount and evidence. You may choose{' '}
                <strong>Confirm</strong> (agree to deduct) or{' '}
                <strong>Dispute</strong> (submit objection with evidence).
              </span>
            }
          />
        )}
      </Card>

      {/* Claim Info Card */}
      <Card title="Claim Information" className={styles.sectionCard}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Claim Type L1">
            {ticket.claimTypeL1}
          </Descriptions.Item>
          <Descriptions.Item label="Claim Type L2">
            {ticket.claimTypeL2}
          </Descriptions.Item>
          <Descriptions.Item label="Claim Amount">
            <Text strong>
              {Math.abs(ticket.claimAmount).toLocaleString('en-US')} PHP
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Claimant">
            {ticket.claimant}
          </Descriptions.Item>
          <Descriptions.Item label="Responsible Party">
            {ticket.responsibleParty}
          </Descriptions.Item>
          <Descriptions.Item label="Waybill Based">
            {ticket.isWaybillBased
              ? `Yes | ${ticket.relatedWaybill || '-'}`
              : 'No'}
          </Descriptions.Item>
          <Descriptions.Item label="Deduction for Vendor">
            {ticket.deductionForVendor}
          </Descriptions.Item>
          <Descriptions.Item label="Linked Settlement">
            {ticket.linkedSettlementApNo || (
              <Text type="secondary">Not Linked</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Claim Details Card */}
      <Card title="Claim Details" className={styles.sectionCard}>
        <div className={styles.claimDetailsContent}>
          {ticket.claimDetails || (
            <Text type="secondary">(No details provided)</Text>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <Text
            strong
            style={{
              fontSize: 13,
              display: 'block',
              marginBottom: 8,
            }}
          >
            Attachments
          </Text>
          <Space wrap>
            <span className={styles.attachmentTag}>
              <PaperClipOutlined /> damage-photo-01.jpg
            </span>
            <span className={styles.attachmentTag}>
              <PaperClipOutlined /> customer-complaint.pdf
            </span>
          </Space>
        </div>
      </Card>

      {/* Resolution Note Card */}
      {(ticket.resolutionNote || disputeNote) && (
        <Card title="Resolution Note" className={styles.sectionCard}>
          {ticket.resolutionNote && (
            <div className={styles.claimDetailsContent}>
              {ticket.resolutionNote}
            </div>
          )}
          {disputeNote && (
            <div
              style={{
                marginTop: ticket.resolutionNote ? 16 : 0,
                paddingTop: ticket.resolutionNote ? 16 : 0,
                borderTop: ticket.resolutionNote
                  ? '1px solid #f0f0f0'
                  : undefined,
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>
                Dispute submitted by vendor
              </Text>
              <div className={styles.claimDetailsContent}>
                {disputeNote.reason}
              </div>
              {disputeNote.files.length > 0 && (
                <Space wrap style={{ marginTop: 10 }}>
                  {disputeNote.files.map((f, i) => (
                    <span key={i} className={styles.disputeProofTag}>
                      <PaperClipOutlined /> {f}
                    </span>
                  ))}
                </Space>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Action Bar */}
      {canAct && (
        <Card className={styles.sectionCard}>
          <div className={styles.actionBar}>
            <Button onClick={() => setDisputeModalOpen(true)}>Dispute</Button>
            <Button type="primary" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </Card>
      )}

      {/* Dispute Modal */}
      <DisputeClaimModal
        open={disputeModalOpen}
        ticketNo={ticketNo}
        onClose={() => setDisputeModalOpen(false)}
        onSubmitted={handleDisputeSubmitted}
      />
    </div>
  );
};

export default ClaimTicketDetail;
