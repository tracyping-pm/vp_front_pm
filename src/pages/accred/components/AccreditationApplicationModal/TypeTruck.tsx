import { accredTruckSaveDraft, accredTruckSubmit } from '@/api/accred';
import {
  getTruckDefaultCategory,
  getTruckTypeList,
  queryTruckDetailByPlateNo,
} from '@/api/truck';
import {
  IAccredDocumentItem,
  IAccredTruckInfo,
  IAccreditationCategoryItem,
} from '@/api/types/accred';
import { ITruckTypeListItem } from '@/api/types/truck';
import FuzzyAutoComplete from '@/components/FuzzyAutoComplete';
import { ES_DTO_CLASS, MAX_LENGTH } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  OwnershipStatusEnum,
  OwnershipStatusEnumText,
  UploadPathTypeEnum,
  VendorTruckCodingDayEnum,
  VendorTruckCodingDayEnumText,
  VendorTruckVanTypeEnum,
  VendorTruckVanTypeEnumText,
} from '@/enums';
import { formatAmount } from '@/utils/utils';
import { InboxOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
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
import _ from 'lodash';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import AccreditationUpload from '../AccreditationUpload';
import { accreditationValidator } from './constant';

export interface IProps {
  form: FormInstance;
  plateNumber?: string;
  onCancel: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
}

const TypeTruck: FC<IProps> = ({
  form,
  plateNumber,
  onCancel,
  onSubmit,
  onSaveDraft,
}) => {
  // const plateNumberValue = Form.useWatch('plateNumber', form);
  // const truckTypeIdValue = Form.useWatch('truckType', form);
  // console.log('plateNumberValue', plateNumberValue);

  const [initialing, setInitialing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [saveDrafting, setSaveDrafting] = useState<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [truckTypeOptions, setTruckTypeOptions] = useState<DefaultOptionType[]>(
    [],
  );
  const [accreditationList, setAccreditationList] = useState<
    IAccreditationCategoryItem[]
  >([]);
  const truckIdRef = useRef<number>();
  const accreditionCacheMapRef = useRef<
    Map<string, IAccreditationCategoryItem>
  >(new Map());
  const [uniqueId, setUniqueId] = useState<string>();

  const setAccreditationCache = (
    accreditationCategoryList: IAccreditationCategoryItem[],
  ) => {
    if (accreditationCategoryList?.length > 0) {
      accreditationCategoryList?.forEach((item) => {
        accreditionCacheMapRef.current.set(item.id, item);
      });
    } else {
      accreditionCacheMapRef.current.clear();
    }
  };

  const mergeAccreditationCacheRequired = (
    accreditationCategoryList: IAccreditationCategoryItem[],
  ) => {
    accreditationCategoryList?.forEach((item) => {
      const cacheItem = accreditionCacheMapRef.current.get(
        item.id,
      ) as IAccreditationCategoryItem;
      const merged = cacheItem
        ? {
            ...cacheItem,
            required: item.required,
          }
        : item;
      accreditionCacheMapRef.current.set(item.id, merged);
    });
  };

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

  const transformSubmitDocumentList = useCallback(() => {
    const values = form.getFieldsValue();
    const documentList: IAccredDocumentItem[] = [];
    accreditationList?.forEach((item) => {
      const { id } = item;
      const value = values[id];
      if (value) {
        documentList.push(value);
      }
    });
    return documentList;
  }, [accreditationList]);

  const handleSubmit = useCallback(async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    console.log(values);

    const payload: IAccredTruckInfo = {
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
      documentList: transformSubmitDocumentList(),
      truckId: truckIdRef.current,
    };
    setSubmitting(true);
    const res = await accredTruckSubmit(payload).finally(() => {
      setSubmitting(false);
    });
    if (res.code === 200) {
      onSubmit();
    }
  }, [accreditationList]);

  const handleSaveDraft = useCallback(async () => {
    await form.validateFields(['plateNumber']);
    const values = form.getFieldsValue();

    const payload: IAccredTruckInfo = {
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
      documentList: transformSubmitDocumentList(),
      truckId: truckIdRef.current,
    };
    setSaveDrafting(true);
    const res = await accredTruckSaveDraft(payload).finally(() => {
      setSaveDrafting(false);
    });
    if (res.code === 200) {
      onSaveDraft();
    }
  }, [accreditationList]);

  const queryDetailByPlateNumber = async () => {
    const _plateNumber = form.getFieldValue('plateNumber');
    if (!_plateNumber) {
      return;
    }
    setSpinning(true);
    const res = await queryTruckDetailByPlateNo({
      plateNumber: _plateNumber,
    }).finally(() => {
      setSpinning(false);
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
      setAccreditationList(res.data?.accreditationCategoryList ?? []);
      setUniqueId(_.uniqueId());
      setAccreditationCache(res.data?.accreditationCategoryList ?? []);
    } else {
      truckIdRef.current = undefined;
    }
  };

  const onPlateNumberBlur = () => {
    queryDetailByPlateNumber();
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setSaveDrafting(true);
      setSubmitting(true);
    } else {
      setSaveDrafting(false);
      setSubmitting(false);
    }
  }, []);

  const onTrukTypeChange = async (truckTypeId: number) => {
    setSpinning(true);
    const res = await getTruckDefaultCategory({ truckTypeId }).finally(() => {
      setSpinning(false);
    });
    if (res.code === 200) {
      mergeAccreditationCacheRequired(res.data as IAccreditationCategoryItem[]);
      // 根据 accreditionCacheMapRef.current 设置 accreditationList
      const _accreditationList: IAccreditationCategoryItem[] = [];
      accreditionCacheMapRef.current.forEach((itemValue) => {
        _accreditationList.push({
          ...itemValue,
        });
      });
      console.log({ _accreditationList });
      setAccreditationList(_accreditationList);
      setUniqueId(_.uniqueId());
    }
  };

  const init = () => {
    fetchTruckTypeList();
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

  useEffect(() => {
    if (plateNumber) {
      form.setFieldsValue({
        plateNumber,
      });
      queryDetailByPlateNumber();
    }
  }, [plateNumber]);

  return (
    <>
      <Spin spinning={initialing || spinning} tip="Loading...">
        <section className="accred-content">
          <Divider plain>Basic Information</Divider>
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
                    onChange={(val) => onTrukTypeChange(val)}
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
                      message: `Registration Number cannot exceed ${MAX_LENGTH.NAME} characters`,
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
          <Divider plain>Accreditation</Divider>
          <div>
            {accreditationList?.map((accreditation) => (
              <Form.Item
                key={accreditation.fileCategory + uniqueId}
                name={accreditation.id}
                rules={[
                  {
                    validator: (_rule, value) =>
                      accreditationValidator(
                        value,
                        accreditation.required,
                        accreditation.fileCategory,
                      ),
                  },
                ]}
              >
                <AccreditationUpload
                  label={accreditation.fileCategory}
                  fileCategory={accreditation.fileCategory}
                  required={accreditation.required}
                  dto={{
                    customParamMap: {
                      // plateNumber: plateNumberValue,
                      // truckType: truckTypeIdValue,
                      fileCategory: accreditation.fileCategory,
                    },
                    pathType: UploadPathTypeEnum.TRUCK,
                  }}
                  // @ts-ignore
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

export default TypeTruck;
