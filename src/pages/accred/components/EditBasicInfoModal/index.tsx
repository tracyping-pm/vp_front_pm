import { Form, Modal, ModalProps } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import {
  IDetail,
  isCrewDetail,
  isTruckDetail,
  isVendorDetail,
} from '../../Detail';
import BasicCrew from './BasicCrew';
import BasicTruck from './BasicTruck';
import BasicVendor from './BasicVendor';
import styles from './index.less';

export interface IEditBasicInfoModal extends ModalProps {
  open: boolean;
  detail?: IDetail;
  onCancel: () => void;
  onFinish: () => void;
}

const EditBasicInfoModal: FC<IEditBasicInfoModal> = ({
  detail,
  onCancel,
  onFinish,
  ...restProps
}) => {
  const [form] = Form.useForm();

  return (
    <>
      <Modal
        {...restProps}
        title={`Edit ${detail?.type} Accreditation Application Basic Info`}
        destroyOnHidden
        maskClosable={false}
        footer={null}
        width={800}
        onCancel={onCancel}
      >
        <div
          className={cls('edit-basic-info-modal', styles.editBasicInfoModal)}
        >
          <Form form={form} name="accred-edit-form" layout="vertical">
            {isVendorDetail(detail) && (
              <BasicVendor
                form={form}
                detail={detail}
                onCancel={onCancel}
                onFinish={onFinish}
              />
            )}

            {isTruckDetail(detail) && (
              <BasicTruck
                form={form}
                detail={detail}
                onCancel={onCancel}
                onFinish={onFinish}
              />
            )}

            {isCrewDetail(detail) && (
              <BasicCrew
                form={form}
                detail={detail}
                onCancel={onCancel}
                onFinish={onFinish}
              />
            )}
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default EditBasicInfoModal;
