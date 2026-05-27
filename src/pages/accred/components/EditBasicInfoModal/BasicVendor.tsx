import { accredVendorUpdateDraft } from '@/api/accred';
import { placeCity, placeProvince, placeRegion } from '@/api/place';
import { IAccredVendorDetail } from '@/api/types/accred';
import { IPlaceRecord } from '@/api/types/place';
import { getVendorDetail } from '@/api/vendor';
import {
  CountryEnumLabelListMap,
  CountryMapEnum,
  VendorTypeEnum,
} from '@/enums';
import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Col, Flex, Form, Input, Row, Spin } from 'antd';
import { FormInstance } from 'antd/lib';
import { FC, useCallback, useEffect, useState } from 'react';

export interface IProps {
  detail: IAccredVendorDetail;
  form: FormInstance;
  onCancel: () => void;
  onFinish: () => void;
}

const BasicVendor: FC<IProps> = ({ detail, form, onCancel, onFinish }) => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};
  const countryId = currentUser?.countryId;
  const labelLevelList = CountryEnumLabelListMap[countryId as CountryMapEnum];
  const [initialing, setInitialing] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [vendorType, setVendorType] = useState<VendorTypeEnum>();

  // 清空指定的表单项
  const resetAreaFields = (fields?: string[]) => {
    form.resetFields?.(fields);
  };

  const onOk = useCallback(async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    console.log(values);

    const payload = {
      accredId: detail.id,
      accredVendorId: detail.accredVendorId,
      pad: values.pad,
      sad: values.sad,
      tad: values.tad,
      vendorType: vendorType!,
    };
    setEditing(true);
    const res = await accredVendorUpdateDraft(payload).finally(() => {
      setEditing(false);
    });
    if (res.code === 200) {
      onFinish();
    }
  }, [vendorType, detail]);

  const init = async () => {
    setInitialing(true);
    const res = await getVendorDetail().finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      const { data } = res;
      setVendorType(data.vendorType);
    }
  };

  useEffect(() => {
    form.setFieldsValue?.({
      pad: detail.pad,
      sad: detail.sad,
      tad: detail.tad,
    });
  }, [detail]);

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Spin spinning={initialing} tip="Loading...">
        <section className="accred-content">
          {/* <Divider plain>Basic Information</Divider> */}
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
        </section>

        <section className="accred-footer">
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => onCancel()}>Cancel</Button>
            <Button type="primary" loading={editing} onClick={onOk}>
              OK
            </Button>
          </Flex>
        </section>
      </Spin>
    </>
  );
};

export default BasicVendor;
