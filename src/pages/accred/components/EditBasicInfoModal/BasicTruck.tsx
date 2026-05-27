import { accredTruckUpdateDraft } from '@/api/accred';
import { getTruckTypeList, queryTruckDetailByPlateNo } from '@/api/truck';
import { IAccredTruckDetail } from '@/api/types/accred';
import { ITruckTypeListItem } from '@/api/types/truck';
import FuzzyAutoComplete from '@/components/FuzzyAutoComplete';
import { ES_DTO_CLASS, MAX_LENGTH } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  OwnershipStatusEnum,
  OwnershipStatusEnumText,
  VendorTruckCodingDayEnum,
  VendorTruckCodingDayEnumText,
  VendorTruckVanTypeEnum,
  VendorTruckVanTypeEnumText,
} from '@/enums';
import { formatAmount } from '@/utils/utils';
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
} from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { FormInstance } from 'antd/lib';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

export interface IProps {
  detail: IAccredTruckDetail;
  form: FormInstance;
  onCancel: () => void;
  onFinish: () => void;
}

const BasicTruck: FC<IProps> = ({ detail, form, onCancel, onFinish }) => {
  const [initialing, setInitialing] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [truckTypeOptions, setTruckTypeOptions] = useState<DefaultOptionType[]>(
    [],
  );
  const truckIdRef = useRef<number>();
  const fetchTruckTypeList = async () => {
    setInitialing(true);
    const res = await getTruckTypeList().finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      const list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setTruckTypeOptions(list);
    }
  };

  const queryDetailByPlateNumber = async () => {
    const plateNumber = form.getFieldValue('plateNumber');
    if (!plateNumber) {
      return;
    }
    setInitialing(true);
    const res = await queryTruckDetailByPlateNo({ plateNumber }).finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      truckIdRef.current = res.data?.id;
      form.setFieldsValue({
        truckType: res.data?.truckType,
        ownership: res.data?.ownership,
        vanType: res.data?.vanType,
        grossCapacity: res.data?.grossCapacity,
        netCapacity: res.data?.netCapacity,
        volume: res.data?.volume,
        codingDay: res.data?.codingDay,
        registrationNumber: res.data?.registrationNumber,
        model: res.data?.model,
      });
    } else {
      truckIdRef.current = undefined;
    }
  };

  const onPlateNumberBlur = () => {
    queryDetailByPlateNumber();
  };

  const onOk = useCallback(async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    console.log(values);

    const payload = {
      accredId: detail.id,
      accredTruckId: detail.accredTruckId,
      plateNumber: values.plateNumber,
      truckType: values.truckType,
      vanType: values.vanType,
      registrationNumber: values.registrationNumber,
      grossCapacity: values.grossCapacity,
      netCapacity: values.netCapacity,
      volume: values.volume,
      model: values.model,
      codingDay: values.codingDay,
      ownership: values.ownership,
      truckId: truckIdRef.current,
    };
    setEditing(true);
    const res = await accredTruckUpdateDraft(payload).finally(() => {
      setEditing(false);
    });
    if (res.code === 200) {
      onFinish();
    }
  }, [detail]);

  const init = async () => {
    fetchTruckTypeList();
  };

  useEffect(() => {
    form.setFieldsValue?.({
      plateNumber: detail.plateNumber,
      truckType: detail.truckType,
      ownership: detail.ownership,
      vanType: detail.vanType,
      grossCapacity: detail.grossCapacity,
      netCapacity: detail.netCapacity,
      volume: detail.volume,
      codingDay: detail.codingDay,
      registrationNumber: detail.registrationNumber,
      model: detail.model,
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
          <div style={{ marginBottom: 24 }}>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item
                  label="Plate Number"
                  name="plateNumber"
                  layout="vertical"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter Plate Number',
                    },
                    {
                      max: MAX_LENGTH.NAME,
                      message: `Plate Number cannot exceed ${MAX_LENGTH.NAME} characters`,
                    },
                  ]}
                >
                  <FuzzyAutoComplete
                    fieldProps={{
                      placeholder: 'Plate Number',
                      onBlur: () => onPlateNumberBlur(),
                      disabled: true,
                    }}
                    request={{
                      field: 'plateNumber',
                      esDtoClass: ES_DTO_CLASS.TRUCK,
                      type: FieldQueryHighlightTypeEnum.VENDOR,
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Truck Type"
                  name="truckType"
                  layout="vertical"
                  rules={[
                    { required: true, message: 'Please select Truck Type' },
                  ]}
                >
                  <Select
                    placeholder="Truck Type"
                    options={truckTypeOptions}
                    showSearch
                    filterOption
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item
                  label="Ownership"
                  name="ownership"
                  layout="vertical"
                  rules={[
                    { required: true, message: 'Please select Ownership' },
                  ]}
                >
                  <Select
                    placeholder="Ownership"
                    options={[
                      {
                        value: OwnershipStatusEnum.OWNEDTRUCK,
                        label:
                          OwnershipStatusEnumText[
                            OwnershipStatusEnum.OWNEDTRUCK
                          ],
                      },
                      {
                        value: OwnershipStatusEnum.NONOWNEDTRUCK,
                        label:
                          OwnershipStatusEnumText[
                            OwnershipStatusEnum.NONOWNEDTRUCK
                          ],
                      },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Van Type" name="vanType" layout="vertical">
                  <Select
                    placeholder="Van Typ"
                    allowClear
                    options={[
                      {
                        value: VendorTruckVanTypeEnum.DRY,
                        label:
                          VendorTruckVanTypeEnumText[
                            VendorTruckVanTypeEnum.DRY
                          ],
                      },
                      {
                        value: VendorTruckVanTypeEnum.REEFER,
                        label:
                          VendorTruckVanTypeEnumText[
                            VendorTruckVanTypeEnum.REEFER
                          ],
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item
                  label="Gross Capacity"
                  name="grossCapacity"
                  layout="vertical"
                >
                  <InputNumber
                    placeholder="Gross Capacity"
                    style={{ width: '100%' }}
                    controls={false}
                    precision={2}
                    formatter={(val) => (val ? formatAmount(val) : '')}
                    min={0}
                    max={Math.pow(2, 52)}
                    suffix="MT"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Net Capacity"
                  name="netCapacity"
                  layout="vertical"
                >
                  <InputNumber
                    placeholder="Net Capacity"
                    style={{ width: '100%' }}
                    controls={false}
                    precision={2}
                    formatter={(val) => (val ? formatAmount(val) : '')}
                    min={0}
                    max={Math.pow(2, 52)}
                    suffix="MT"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item label="Volume" name="volume" layout="vertical">
                  <InputNumber
                    placeholder="Volume"
                    style={{ width: '100%' }}
                    controls={false}
                    precision={2}
                    formatter={(val) => (val ? formatAmount(val) : '')}
                    min={0}
                    max={Math.pow(2, 52)}
                    suffix="CBM"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Coding Day"
                  name="codingDay"
                  layout="vertical"
                >
                  <Select
                    placeholder="Coding Day"
                    allowClear
                    options={[
                      {
                        value: VendorTruckCodingDayEnum.NA,
                        label:
                          VendorTruckCodingDayEnumText[
                            VendorTruckCodingDayEnum.NA
                          ],
                      },
                      {
                        value: VendorTruckCodingDayEnum.MONDAY,
                        label:
                          VendorTruckCodingDayEnumText[
                            VendorTruckCodingDayEnum.MONDAY
                          ],
                      },
                      {
                        value: VendorTruckCodingDayEnum.TUESDAY,
                        label:
                          VendorTruckCodingDayEnumText[
                            VendorTruckCodingDayEnum.TUESDAY
                          ],
                      },
                      {
                        value: VendorTruckCodingDayEnum.WEDNESDAY,
                        label:
                          VendorTruckCodingDayEnumText[
                            VendorTruckCodingDayEnum.WEDNESDAY
                          ],
                      },
                      {
                        value: VendorTruckCodingDayEnum.THURSDAY,
                        label:
                          VendorTruckCodingDayEnumText[
                            VendorTruckCodingDayEnum.THURSDAY
                          ],
                      },
                      {
                        value: VendorTruckCodingDayEnum.FRIDAY,
                        label:
                          VendorTruckCodingDayEnumText[
                            VendorTruckCodingDayEnum.FRIDAY
                          ],
                      },
                      {
                        value: VendorTruckCodingDayEnum.SATURDAY,
                        label:
                          VendorTruckCodingDayEnumText[
                            VendorTruckCodingDayEnum.SATURDAY
                          ],
                      },
                      {
                        value: VendorTruckCodingDayEnum.SUNDAY,
                        label:
                          VendorTruckCodingDayEnumText[
                            VendorTruckCodingDayEnum.SUNDAY
                          ],
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Form.Item
                  label="Registration Number"
                  name="registrationNumber"
                  layout="vertical"
                  rules={[
                    {
                      max: MAX_LENGTH.NAME,
                      message: `Plate number cannot exceed ${MAX_LENGTH.NAME} characters`,
                    },
                  ]}
                >
                  <Input placeholder="Registration Number" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Model"
                  name="model"
                  layout="vertical"
                  rules={[
                    {
                      max: MAX_LENGTH.LONG_NAME,
                      message: `Model cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                    },
                  ]}
                >
                  <Input placeholder="Model" />
                </Form.Item>
              </Col>
            </Row>
          </div>
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

export default BasicTruck;
