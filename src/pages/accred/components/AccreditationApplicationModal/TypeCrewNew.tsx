import { accredCrewSaveDraft, accredCrewSubmit } from '@/api/accred';
import { getCountryPhone } from '@/api/common';
import { getCrewDefaultCategory } from '@/api/crew';
import {
  IAccredCrewPayload,
  IAccredDocumentItem,
  IAccreditationCategoryItem,
} from '@/api/types/accred';
import CustomFormInput from '@/components/CustomFormInput';
import {
  COUNTRY_PHONE_REGULAR_EXPRESSION,
  DEFAULT_COUNTRY_PHONE_CODE,
  MAX_LENGTH,
} from '@/constants';
import { PROMPT_ID_OCR, PROMPT_LICENSE_OCR } from '@/constants/prompt';
import { IPhoneSelectOptionsItem, UploadPathTypeEnum } from '@/enums';
import { InboxOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { useSetState } from 'ahooks';
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
} from 'antd';
import { FormInstance } from 'antd/lib';
import _ from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import AccreditationUpload from '../AccreditationUpload';
import { FILE_CATEGORY_WITH_GEN_AI } from '../AccreditationUpload/constants';
import OcrFormInput from '../OcrFormInput';
import { accreditationValidator } from './constant';

export interface IProps {
  form: FormInstance;
  onCancel: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
}

const TypeCrewNew: FC<IProps> = ({ form, onCancel, onSubmit, onSaveDraft }) => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};
  const countryId = currentUser?.countryId ?? 1;
  const countryOcrFieldObj = FILE_CATEGORY_WITH_GEN_AI[countryId];

  const [initialing, setInitialing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [saveDrafting, setSaveDrafting] = useState<boolean>(false);
  const [accreditationList, setAccreditationList] = useState<
    IAccreditationCategoryItem[]
  >([]);
  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);
  const [codeOption, setCodeOption] = useState<any>(null);
  const [uniqueId, setUniqueId] = useState<string>();

  const [ocrResultObj, setOcrResultObj] = useSetState<{
    idNumber: string;
    licenseNumber: string;
  }>({
    idNumber: '',
    licenseNumber: '',
  });

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

    const driverFlag = values.type?.includes('driverFlag');
    const helperFlag = values.type?.includes('helperFlag');

    const payload: IAccredCrewPayload = {
      name: values.name,
      driverFlag,
      helperFlag,
      idNumber: values.idNumber,
      phoneCode: codeOption.show,
      phoneCodeId: codeOption.value,
      phoneNum: values.phoneNum,
      licenseNumber: values.licenseNumber,
      documentList: transformSubmitDocumentList(),
    };
    setSubmitting(true);
    const res = await accredCrewSubmit(payload).finally(() => {
      setSubmitting(false);
    });
    if (res.code === 200) {
      onSubmit();
    }
  }, [codeOption, accreditationList]);

  const handleSaveDraft = useCallback(async () => {
    await form.validateFields(['idNumber']);
    const values = form.getFieldsValue();

    const driverFlag = values.type?.includes('driverFlag');
    const helperFlag = values.type?.includes('helperFlag');

    const payload: IAccredCrewPayload = {
      name: values.name,
      driverFlag,
      helperFlag,
      idNumber: values.idNumber,
      phoneCode: codeOption.show,
      phoneCodeId: codeOption.value,
      phoneNum: values.phoneNum,
      licenseNumber: values.licenseNumber,
      documentList: transformSubmitDocumentList(),
    };
    setSaveDrafting(true);
    const res = await accredCrewSaveDraft(payload).finally(() => {
      setSaveDrafting(false);
    });
    if (res.code === 200) {
      onSaveDraft();
    }
  }, [codeOption, accreditationList]);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setSaveDrafting(true);
      setSubmitting(true);
    } else {
      setSaveDrafting(false);
      setSubmitting(false);
    }
  }, []);

  const getDefaultCategory = async () => {
    const type = form.getFieldValue('type') ?? [];
    const driverFlag = type?.includes?.('driverFlag') ? true : false;
    setInitialing(true);
    const res = await getCrewDefaultCategory({
      driverFlag,
    }).finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      const { data = [] } = res;
      setAccreditationList(data as IAccreditationCategoryItem[]);
      setUniqueId(_.uniqueId());
    }
  };

  const getCityCode = async () => {
    setInitialing(true);
    const res = await getCountryPhone().finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      setCodeList(res.data ?? []);
      form.setFieldValue(
        'areaCode',
        DEFAULT_COUNTRY_PHONE_CODE[countryId!]?.value,
      );
      setCodeOption(DEFAULT_COUNTRY_PHONE_CODE[countryId!]);
    }
  };

  const init = async () => {
    form.resetFields(['type']);
    // getDefaultCategory();
    getCityCode();
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

  const prefixSelector = (
    <Form.Item name="areaCode" noStyle>
      <Select
        style={{ width: 92, textAlign: 'left' }}
        options={codeList}
        optionLabelProp="show"
        popupMatchSelectWidth={false}
        showSearch
        filterOption={true}
        optionFilterProp="label"
        onChange={(_value, option) => setCodeOption(option)}
      ></Select>
    </Form.Item>
  );

  return (
    <>
      <Spin spinning={initialing} tip="Loading...">
        <section className="accred-content">
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select Type' }]}
            layout="horizontal"
          >
            <Checkbox.Group style={{ marginLeft: '80px' }}>
              <Checkbox
                value={'driverFlag'}
                onChange={() =>
                  setTimeout(() => {
                    getDefaultCategory();
                  }, 0)
                }
              >
                Driver
              </Checkbox>
              <Checkbox
                value={'helperFlag'}
                onChange={() =>
                  setTimeout(() => {
                    getDefaultCategory();
                  }, 0)
                }
              >
                Helper
              </Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Divider plain>Accreditation</Divider>
          <Row gutter={[24, 24]}>
            {accreditationList?.map((accreditation) => {
              const fieldKey: 'idNumber' | 'licenseNumber' =
                countryOcrFieldObj[accreditation.id];
              const withGenAI = !!fieldKey;
              const prompt =
                fieldKey === 'idNumber' ? PROMPT_ID_OCR : PROMPT_LICENSE_OCR;
              const totalMaxUploadCount = withGenAI ? 1 : Infinity;
              const materialList =
                accreditation?.accreditationMaterialList ?? [];

              return (
                <Col span={12} key={accreditation.id}>
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
                          ),
                      },
                    ]}
                  >
                    <AccreditationUpload
                      key={accreditation.fileCategory + uniqueId}
                      withGenAI={withGenAI}
                      prompt={prompt}
                      label={accreditation.fileCategory}
                      fileCategory={accreditation.fileCategory}
                      required={accreditation.required}
                      getUploadingSize={getUploadingSize}
                      totalMaxUploadCount={totalMaxUploadCount}
                      materialList={materialList}
                      dto={{
                        customParamMap: {
                          fileCategory: accreditation.fileCategory,
                        },
                        pathType: UploadPathTypeEnum.CREW,
                      }}
                      onGenAIChange={(ocrResult: string) => {
                        // @ts-ignore
                        setOcrResultObj({ [fieldKey]: ocrResult });
                      }}
                    />
                  </Form.Item>
                </Col>
              );
            })}
          </Row>
          <Divider plain>Basic Information</Divider>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Form.Item
                label="Crew Name:"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Please enter Crew Name',
                  },
                  {
                    max: MAX_LENGTH.LONG_NAME,
                    message: `Crew Name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                  },
                ]}
                layout="horizontal"
                labelAlign="left"
                labelCol={{ span: 6 }}
              >
                <CustomFormInput placeholder="Crew Name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Contact:"
                name="phoneNum"
                required
                rules={[
                  {
                    max: MAX_LENGTH.PASSWORD,
                    message: `Contact cannot exceed ${MAX_LENGTH.PASSWORD} characters`,
                  },
                  {
                    validator: (_rule, value) => {
                      if (!value) {
                        return Promise.reject('Please enter contact');
                      }
                      const areaCode = form.getFieldValue('areaCode');
                      if (!areaCode) {
                        return Promise.reject(
                          'Please enter the phone area code',
                        );
                      }
                      if (areaCode !== 167 && areaCode !== 214) {
                        return Promise.resolve();
                      }
                      const findOption = codeList?.find(
                        (item) => item.value === areaCode,
                      );
                      const phoneNumber = findOption?.show + value;
                      const mobileReg =
                        COUNTRY_PHONE_REGULAR_EXPRESSION[countryId!].mobile;
                      const phoneReg =
                        COUNTRY_PHONE_REGULAR_EXPRESSION[countryId!].phone;
                      if (
                        mobileReg.test(phoneNumber) ||
                        phoneReg.test(phoneNumber)
                      ) {
                        return Promise.resolve();
                      } else {
                        return Promise.reject(
                          'Please enter the correct phone number',
                        );
                      }
                    },
                  },
                ]}
                layout="horizontal"
                labelAlign="left"
                labelCol={{ span: 8 }}
              >
                <Input placeholder="Contact" addonBefore={prefixSelector} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Form.Item
                label="ID Number:"
                name="idNumber"
                rules={[
                  {
                    required: true,
                    message: 'Please enter ID Number:',
                  },
                  {
                    max: MAX_LENGTH.NAME,
                    message: `ID Number: cannot exceed ${MAX_LENGTH.NAME} characters`,
                  },
                ]}
                layout="horizontal"
                labelAlign="left"
                labelCol={{ span: 6 }}
              >
                <OcrFormInput
                  fieldProps={{ placeholder: 'ID Number' }}
                  ocrResult={ocrResultObj.idNumber}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="License Number:"
                name="licenseNumber"
                rules={[
                  {
                    required: form
                      .getFieldValue('type')
                      ?.includes('driverFlag'),
                    message: 'Please enter License Number',
                  },
                  {
                    max: MAX_LENGTH.NAME,
                    message: `License Number cannot exceed ${MAX_LENGTH.NAME} characters`,
                  },
                ]}
                layout="horizontal"
                labelAlign="left"
                labelCol={{ span: 8 }}
              >
                <OcrFormInput
                  fieldProps={{ placeholder: 'License' }}
                  ocrResult={ocrResultObj.licenseNumber}
                />
              </Form.Item>
            </Col>
          </Row>
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

export default TypeCrewNew;
