import { CloseOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input, Modal, Tag, Upload } from 'antd';
import { useState } from 'react';
import styles from '../index.less';

interface DisputeClaimModalProps {
  open: boolean;
  ticketNo: string;
  onClose: () => void;
  onSubmitted: (data: { reason: string; files: string[] }) => void;
}

const DisputeClaimModal: React.FC<DisputeClaimModalProps> = ({
  open,
  ticketNo,
  onClose,
  onSubmitted,
}) => {
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  const canSubmit = reason.trim().length > 0 && files.length > 0;
  const remaining = 2000 - reason.length;

  const addFile = () => {
    const n = files.length + 1;
    setFiles([...files, `dispute-proof-${String(n).padStart(2, '0')}.pdf`]);
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    onSubmitted({ reason, files });
    setReason('');
    setFiles([]);
  };

  const handleCancel = () => {
    onClose();
    setReason('');
    setFiles([]);
  };

  return (
    <Modal
      title={`Dispute Claim Ticket · ${ticketNo}`}
      open={open}
      onCancel={handleCancel}
      width={580}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Submit Dispute
        </Button>,
      ]}
    >
      <div className={styles.disputeModal}>
        <Alert
          type="warning"
          showIcon
          className={styles.warningAlert}
          message={
            <span>
              After submitting a Dispute, the ticket status will change to{' '}
              <strong>Disputed</strong> and be re-reviewed by the TMS Claim
              team. Please provide specific reasons and evidence.
            </span>
          }
        />

        <Form layout="vertical">
          <Form.Item label="Reason" required>
            <Input.TextArea
              rows={5}
              maxLength={2000}
              placeholder="Please describe your objection reason, e.g.: Both parties verified the quantity before loading, the signed receipt has been stamped..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className={styles.charCount}>
              {remaining} / 2000
            </div>
          </Form.Item>

          <Form.Item
            label="Discrepancy Proof (At least 1 file required)"
            required
          >
            <div className={styles.fileList}>
              {files.map((f, i) => (
                <Tag
                  key={i}
                  className={styles.fileTag}
                  closable
                  onClose={() => removeFile(i)}
                  closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                >
                  <PaperClipOutlined /> {f}
                </Tag>
              ))}
            </div>
            <Upload
              beforeUpload={() => {
                addFile();
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                Upload Proof (PDF / Image)
              </Button>
            </Upload>
            <div className={styles.supportText}>
              Supported: transport receipt, loading records, GPS tracks,
              communication records, etc.
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default DisputeClaimModal;
