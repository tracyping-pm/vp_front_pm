import { accredVendorSaveDraft, accredVendorSubmit } from '@/api/accred';
import { placeCity, placeProvince, placeRegion } from '@/api/place';
import {
  IAccredDocumentItem,
  IAccredVendorInfo,
  IAccreditationCategoryItem,
} from '@/api/types/accred';
import { IPlaceRecord } from '@/api/types/place';
import { getVendorDetail } from '@/api/vendor';
import {
  CountryEnumLabelListMap,
  CountryMapEnum,
  UploadPathTypeEnum,
  VendorTypeEnum,
} from '@/enums';
import { InboxOutlined } from '@ant-design/icons';
import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Col, Divider, Flex, Form, Input, Row, Spin } from 'antd';
import { FormInstance } from 'antd/lib';
import { FC, useCallback, useEffect, useState } from 'react';
import AccreditationUpload from '../AccreditationUpload';
import { accreditationValidator } from './constant';

export interface IProps {
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
}

const TypeVendor: FC<IProps> = ({ form, onCancel, onSubmit, onSaveDraft }) => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};
  const countryId = currentUser?.countryId;
  const labelLevelList = CountryEnumLabelListMap[countryId as CountryMapEnum];
  const [initialing, setInitialing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [saveDrafting, setSaveDrafting] = useState<boolean>(false);
  const [accreditationList, setAccreditationList] = useState<
    IAccreditationCategoryItem[]
  >([]);
  const [vendorType, setVendorType] = useState<VendorTypeEnum>();

  // 清空指定的表单项
  const resetAreaFields = (fields?: string[]) => {
    form.resetFields?.(fields);
  };

  const transformSubmitDocumentList = useCallback(() => {
    const values = form.getFieldsValue();
    const documentList: IAccredDocumentItem[] = [];
    accreditationList?.forEach((item) => {
      const { id } = item;
      const value = values[id];
      if (value) {
        value.validIndefinitely = !!value.validIndefinitely;
        documentList.push(value);
      }
    });
    return documentList;
  }, [accreditationList]);

  const handleSubmit = useCallback(async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    console.log(values);

    const payload: IAccredVendorInfo = {
      pad: values.pad,
      sad: values.sad,
      tad: values.tad,
      vendorType: vendorType!,
      documentList: transformSubmitDocumentList(),
    };
    setSubmitting(true);
    const res = await accredVendorSubmit(payload).finally(() => {
      setSubmitting(false);
    });
    if (res.code === 200) {
      onSubmit();
    }
  }, [vendorType, accreditationList]);

  const handleSaveDraft = useCallback(async () => {
    // await form.validateFields();
    const values = form.getFieldsValue();

    const payload: IAccredVendorInfo = {
      pad: values.pad,
      sad: values.sad,
      tad: values.tad,
      vendorType: vendorType!,
      documentList: transformSubmitDocumentList(),
    };
    setSaveDrafting(true);
    const res = await accredVendorSaveDraft(payload).finally(() => {
      setSaveDrafting(false);
    });
    if (res.code === 200) {
      onSaveDraft();
    }
  }, [vendorType, accreditationList]);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setSaveDrafting(true);
      setSubmitting(true);
    } else {
      setSaveDrafting(false);
      setSubmitting(false);
    }
  }, []);

  const init = async () => {
    setInitialing(true);
    const res = await getVendorDetail().finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      const { data } = res;
      const { accreditationCategoryList } = data;
      setVendorType(data.vendorType);
      setAccreditationList(accreditationCategoryList);
      form.setFieldsValue({
        countryName: data.countryName,
        pad: data.pad,
        sad: data.sad,
        tad: data.tad,
      });
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    accreditationList?.forEach((item) => {
      const { id } = item;
      form.setFieldsValue({
        [id]: {
          fileCategory: item.fileCategory,
          subFileCategory: item.subFileCategory,
          validDateStart: item.validDateStart,
          validDateEnd: item.validDateEnd,
          validIndefinitely: item.validIndefinitely,
          materialIdList: item.accreditationMaterialList?.map(
            (accredMaterial) => accredMaterial.fileMaterialId,
          ),
        },
      });
    });
  }, [accreditationList]);

  return (
    <>
      <Spin spinning={initialing} tip="Loading...">
        <section className="accred-content">
          <Divider plain>Basic Information</Divider>
          <Form.Item
            label="Vendor Name:"
            name="vendorName"
            layout="horizontal"
            initialValue={currentUser?.name}
          >
            <Input
              style={{ width: '380px', marginLeft: '32px' }}
              placeholder="Vendor Name"
              disabled
            />
          </Form.Item>

          <Row gutter={12} align={'bottom'}>
            <Col span={6}>
              <ProFormText
                label="Serviceable Area"
                name="countryName"
                placeholder={labelLevelList?.[0]}
                disabled={true}
              />
            </Col>

            <Col span={6}>
              <ProFormSelect
                name="pad"
                placeholder={labelLevelList?.[1]}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                rules={[
                  {
                    required: true,
                    message: `Please select ${labelLevelList?.[1]}`,
                  },
                ]}
                request={async () => {
                  const payload = {
                    country: countryId,
                  };
                  const res = await placeRegion(payload);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceRecord) => {
                      return {
                        label: item.description,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
                onChange={() => resetAreaFields(['sad', 'tad'])}
              />
            </Col>

            <Col span={6}>
              <ProFormSelect
                name="sad"
                placeholder={labelLevelList?.[2]}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                dependencies={['pad']}
                request={async (params) => {
                  if (!params.pad) {
                    return [];
                  }
                  const payload = {
                    region: params.pad,
                  };
                  const res = await placeProvince(payload);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceRecord) => {
                      return {
                        label: item.description,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
                onChange={() => resetAreaFields(['tad'])}
              />
            </Col>

            <Col span={6}>
              <ProFormSelect
                name="tad"
                placeholder={labelLevelList?.[3]}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                dependencies={['pad', 'sad']}
                request={async (params) => {
                  if (!params.pad || !params.sad) {
                    return [];
                  }
                  const payload = {
                    province: params.sad,
                  };
                  const res = await placeCity(payload);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceRecord) => {
                      return {
                        label: item.description,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
              />
            </Col>
          </Row>

          <Divider plain>Accreditation</Divider>
          <div>
            {accreditationList?.map((accreditation) => (
              <Form.Item
                key={accreditation.id}
                name={accreditation.id}
                rules={[
                  {
                    validator: (_rule, value) =>
                      accreditationValidator(
                        value,
                        accreditation.required,
                        accreditation.fileCategory,
                        accreditation.id,
                      ),
                  },
                ]}
              >
                <AccreditationUpload
                  label={accreditation.fileCategory}
                  id={accreditation.id}
                  fileCategory={accreditation.fileCategory}
                  required={accreditation.required}
                  dto={{
                    customParamMap: {
                      fileCategory: accreditation.fileCategory,
                      vendorName: currentUser?.name,
                    },
                    pathType: UploadPathTypeEnum.VENDOR,
                  }}
                  materialList={accreditation?.accreditationMaterialList ?? []}
                  getUploadingSize={getUploadingSize}
                />
              </Form.Item>
            ))}
          </div>
        </section>

        <section className="accred-footer">
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => onCancel()}>Cancel</Button>
            <Button
              icon={<InboxOutlined />}
              loading={saveDrafting}
              onClick={handleSaveDraft}
            >
              Save as Draft
            </Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              Submit
            </Button>
          </Flex>
        </section>
      </Spin>
    </>
  );
};

export default TypeVendor;
