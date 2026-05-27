import {
  EnumAccredCrewType,
  EnumAccredCrewTypeText,
  EnumAccredType,
  EnumAccredTypeText,
} from '@/enums';
import { Form, Modal, ModalProps, Radio, Select, Space } from 'antd';
import cls from 'classnames';
import { FC, useEffect, useState } from 'react';
import TypeCrewModify from './TypeCrewModify';
import TypeCrewNew from './TypeCrewNew';
import TypeTruck from './TypeTruck';
import TypeVendor from './TypeVendor';
import styles from './index.less';

export interface IAccreditationApplicationModal extends ModalProps {
  type?: EnumAccredType;
  truckParams?: {
    plateNumber?: string;
  };
  crewParams?: {
    crewType: EnumAccredCrewType;
    idNumber?: string;
  };
  onCancel?: () => void;
  onSubmit?: () => void;
  onSaveDraft?: () => void;
}

const AccreditationApplicationModal: FC<IAccreditationApplicationModal> = ({
  type = EnumAccredType.VENDOR,
  truckParams,
  crewParams,
  title = 'Add Accreditation Application',
  open,
  onCancel,
  onSubmit,
  onSaveDraft,
  ...restProps
}) => {
  const [form] = Form.useForm();
  const [applicationTypeDisabled, setApplicationTypeDisabled] =
    useState<boolean>(false);
  console.log('applicationTypeDisabled', applicationTypeDisabled);
  const [crewTypeDisabled, setCrewTypeDisabled] = useState<boolean>(false);

  const applicationTypeValue = Form.useWatch('applicationType', form);
  const crewTypeValue = Form.useWatch('crewType', form);

  useEffect(() => {
    if (open) {
      // TODO:
    } else {
      form.resetFields();
    }
  }, [open]);

  useEffect(() => {
    form.setFieldsValue({
      applicationType: type,
    });
  }, [type]);

  useEffect(() => {
    if (truckParams || crewParams) {
      setApplicationTypeDisabled(true);
    } else {
      setApplicationTypeDisabled(false);
    }
  }, [truckParams, crewParams]);

  useEffect(() => {
    if (crewParams) {
      if (crewParams.crewType) {
        setCrewTypeDisabled(true);
        form.setFieldsValue({
          crewType: crewParams.crewType,
        });
      }
    } else {
      setCrewTypeDisabled(false);
    }
  }, [crewParams]);

  return (
    <>
      <Modal
        wrapClassName={cls([
          'accred-app-modal',
          styles.accreditationApplicationModal,
        ])}
        open={open}
        width={applicationTypeValue === EnumAccredType.CREW ? 1100 : 864}
        title={title}
        footer={null}
        destroyOnHidden
        maskClosable={false}
        onCancel={() => onCancel?.()}
        {...restProps}
      >
        <div className={cls('accred-app-modal-content', styles.content)}>
          <Form form={form} name="accred-app-form" layout="vertical">
            <Space>
              <Form.Item
                name="applicationType"
                label="Application Type:"
                initialValue={EnumAccredType.VENDOR}
                layout="horizontal"
              >
                <Select
                  placeholder="Select Application Type"
                  options={[
                    {
                      value: EnumAccredType.VENDOR,
                      label: EnumAccredTypeText[EnumAccredType.VENDOR],
                    },
                    {
                      value: EnumAccredType.TRUCK,
                      label: EnumAccredTypeText[EnumAccredType.TRUCK],
                    },
                    {
                      value: EnumAccredType.CREW,
                      label: EnumAccredTypeText[EnumAccredType.CREW],
                    },
                  ]}
                  style={{ width: '175px', marginLeft: '12px' }}
                  disabled={applicationTypeDisabled}
                />
              </Form.Item>
              {applicationTypeValue === EnumAccredType.CREW && (
                <Form.Item
                  name="crewType"
                  initialValue={EnumAccredCrewType.NEW}
                  layout="horizontal"
                >
                  <Radio.Group
                    disabled={crewTypeDisabled}
                    options={[
                      {
                        value: EnumAccredCrewType.MODIFY,
                        label:
                          EnumAccredCrewTypeText[EnumAccredCrewType.MODIFY],
                      },
                      {
                        value: EnumAccredCrewType.NEW,
                        label: EnumAccredCrewTypeText[EnumAccredCrewType.NEW],
                      },
                    ]}
                  />
                </Form.Item>
              )}
            </Space>
            {applicationTypeValue === EnumAccredType.VENDOR && (
              <TypeVendor
                form={form}
                onCancel={() => onCancel?.()}
                onSubmit={() => onSubmit?.()}
                onSaveDraft={() => onSaveDraft?.()}
              />
            )}
            {applicationTypeValue === EnumAccredType.TRUCK && (
              <TypeTruck
                form={form}
                plateNumber={truckParams?.plateNumber}
                onCancel={() => onCancel?.()}
                onSubmit={() => onSubmit?.()}
                onSaveDraft={() => onSaveDraft?.()}
              />
            )}
            {applicationTypeValue === EnumAccredType.CREW &&
              (crewTypeValue === EnumAccredCrewType.NEW ? (
                <TypeCrewNew
                  form={form}
                  onCancel={() => onCancel?.()}
                  onSubmit={() => onSubmit?.()}
                  onSaveDraft={() => onSaveDraft?.()}
                />
              ) : (
                <TypeCrewModify
                  form={form}
                  idNumber={crewParams?.idNumber}
                  onCancel={() => onCancel?.()}
                  onSubmit={() => onSubmit?.()}
                  onSaveDraft={() => onSaveDraft?.()}
                />
              ))}
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default AccreditationApplicationModal;
