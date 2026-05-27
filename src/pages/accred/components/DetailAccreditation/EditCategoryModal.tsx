import { accredMaterialUpdate } from '@/api/accred';
import { IAccreditationCategoryItem } from '@/api/types/accred';
import { EnumAccredType, UploadPathTypeEnum } from '@/enums';
import { useModel, useSearchParams } from '@umijs/max';
import { App, Form, Modal, ModalProps } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { accreditationValidator } from '../AccreditationApplicationModal/constant';
import AccreditationUpload from '../AccreditationUpload';
import { FILE_CATEGORY_WITH_GEN_AI } from '../AccreditationUpload/constants';

interface IEditCategoryModal extends ModalProps {
  record: IAccreditationCategoryItem;
  onClose?: () => void;
  reload?: () => void;
}

const EditCategoryModal = ({
  record,
  reload,
  onClose,
  ...restProps
}: IEditCategoryModal) => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};
  const countryId = currentUser?.countryId ?? 1;
  const countryOcrFieldObj = FILE_CATEGORY_WITH_GEN_AI[countryId];
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [dto, setDto] = useState<any>();

  const onOk = async () => {
    await form.validateFields();
    const values = form.getFieldValue(record.id);

    setLoading(true);
    const res = await accredMaterialUpdate({
      ...values,
      id: Number(id),
    }).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      message.success('Edit successfully!');

      form.resetFields();
      onClose?.();
      reload?.();
    }
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (type) {
      let dtoObj = null;
      switch (type) {
        case EnumAccredType.VENDOR:
          dtoObj = {
            customParamMap: {
              fileCategory: record.fileCategory,
              vendorName: currentUser?.name,
            },
            pathType: UploadPathTypeEnum.VENDOR,
          };
          break;
        case EnumAccredType.TRUCK:
          dtoObj = {
            customParamMap: {
              // plateNumber: plateNumberValue,
              // truckType: truckTypeIdValue,
              fileCategory: record.fileCategory,
            },
            pathType: UploadPathTypeEnum.TRUCK,
          };
          break;

        case EnumAccredType.CREW:
          dtoObj = {
            customParamMap: {
              fileCategory: record.fileCategory,
            },
            pathType: UploadPathTypeEnum.CREW,
          };
          break;
        default:
          break;
      }
      setDto(dtoObj);
    }
  }, [type, record]);

  useEffect(() => {
    if (record) {
      form.setFieldValue(record.id, {
        fileCategory: record.fileCategory,
        subFileCategory: record.subFileCategory,
        validDateStart: record.validDateStart,
        validDateEnd: record.validDateEnd,
        validIndefinitely: record.validIndefinitely,
        materialIdList: record.accreditationMaterialList?.map(
          (item) => item.fileMaterialId,
        ),
      });
    }
  }, [record]);

  const fieldKey: 'idNumber' | 'licenseNumber' = countryOcrFieldObj[record.id];
  const withGenAI = !!fieldKey;
  const totalMaxUploadCount = withGenAI ? 1 : Infinity;

  return (
    <Modal
      {...restProps}
      destroyOnHidden
      maskClosable={false}
      title="Edit Category"
      width={600}
      onOk={onOk}
      okButtonProps={{ loading }}
    >
      <Form
        name="vendor-edit-validDate-modal"
        form={form}
        initialValues={{ validDate: record }}
      >
        <Form.Item
          name={record.id}
          rules={[
            {
              validator: (_rule, value) =>
                accreditationValidator(
                  value,
                  record.required,
                  record.fileCategory,
                  record.id,
                ),
            },
          ]}
        >
          <AccreditationUpload
            withGenAI={false}
            label={record.fileCategory}
            id={record.id}
            fileCategory={record.fileCategory}
            required={record.required}
            getUploadingSize={getUploadingSize}
            totalMaxUploadCount={totalMaxUploadCount}
            materialList={record?.accreditationMaterialList}
            dto={dto}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCategoryModal;
