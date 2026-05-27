import { accredCrewUpdateDraft } from '@/api/accred';
import { getCountryPhone } from '@/api/common';
import { queryCrewDetailByIdNumber } from '@/api/crew';
import { IAccredCrewDetail } from '@/api/types/accred';
import FuzzyAutoComplete from '@/components/FuzzyAutoComplete';
import {
  COUNTRY_PHONE_REGULAR_EXPRESSION,
  DEFAULT_COUNTRY_PHONE_CODE,
  ES_DTO_CLASS,
  MAX_LENGTH,
} from '@/constants';
import { FieldQueryHighlightTypeEnum, IPhoneSelectOptionsItem } from '@/enums';
import { useModel } from '@umijs/max';
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
import { FC, useCallback, useEffect, useRef, useState } from 'react';

export interface IProps {
  detail: IAccredCrewDetail;
  form: FormInstance;
  onCancel: () => void;
  onFinish: () => void;
}

const BasicCrew: FC<IProps> = ({ detail, form, onCancel, onFinish }) => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};
  const countryId = currentUser?.countryId;
  const [initialing, setInitialing] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);
  const [codeOption, setCodeOption] = useState<any>(null);
  const crewIdRef = useRef<number>();

  const onOk = useCallback(async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    console.log(values);
    const driverFlag = values.type?.includes('driverFlag');
    const helperFlag = values.type?.includes('helperFlag');

    const payload = {
      accredId: detail.id,
      accredCrewId: detail.accredCrewId,
      name: values.name,
      driverFlag,
      helperFlag,
      idNumber: values.idNumber,
      phoneCode: codeOption.show,
      phoneCodeId: codeOption.value,
      phoneNum: values.phoneNum,
      licenseNumber: values.licenseNumber,
      crewId: crewIdRef.current,
    };
    setEditing(true);
    const res = await accredCrewUpdateDraft(payload).finally(() => {
      setEditing(false);
    });
    if (res.code === 200) {
      onFinish();
    }
  }, [codeOption, detail]);

  const queryDetailByIdNumber = async () => {
    const idNumber = form.getFieldValue('idNumber');
    if (!idNumber) {
      return;
    }
    setInitialing(true);
    const res = await queryCrewDetailByIdNumber({ idNumber }).finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      crewIdRef.current = res.data?.id;
      const type = [
        res.data?.driverFlag ? 'driverFlag' : null,
        res.data?.helperFlag ? 'helperFlag' : null,
      ].filter(Boolean);

      form.setFieldsValue({
        name: res.data?.name,
        type,
        phoneNum: res.data?.phoneNum,
        licenseNumber: res.data?.licenseNumber,
      });

      if (res.data?.phoneCodeId) {
        form.setFieldsValue({
          areaCode: res.data.phoneCodeId,
        });

        setCodeOption({
          label: res.data?.phoneNum,
          value: res.data?.phoneCodeId,
          show: res.data?.phoneCode,
        });
      } else {
        const defaultPhoneCodeId =
          DEFAULT_COUNTRY_PHONE_CODE[countryId!]?.value;
        const findOption = codeList?.find(
          (item) => item.value === defaultPhoneCodeId,
        );
        form.setFieldsValue({
          areaCode: findOption?.value,
        });
        setCodeOption({
          label: findOption?.label,
          value: findOption?.value,
          show: findOption?.show,
        });
      }
    } else {
      crewIdRef.current = undefined;
    }
  };

  const onIdNumberBlur = () => {
    queryDetailByIdNumber();
  };

  const getCityCode = async () => {
    setInitialing(true);
    const res = await getCountryPhone().finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      setCodeList(res.data ?? []);
      // form.setFieldValue(
      //   'areaCode',
      //   DEFAULT_COUNTRY_PHONE_CODE[countryId!]?.value,
      // );
      setCodeOption(DEFAULT_COUNTRY_PHONE_CODE[countryId!]);
    }
  };

  const init = async () => {
    getCityCode();
  };

  useEffect(() => {
    const type = [
      detail.driverFlag ? 'driverFlag' : null,
      detail.helperFlag ? 'helperFlag' : null,
    ].filter(Boolean);
    form.setFieldsValue?.({
      idNumber: detail.idNumber,
      name: detail.name,
      type,
      phoneNum: detail.phoneNum,
      areaCode: detail.phoneCodeId,
      licenseNumber: detail.licenseNumber,
    });
    setCodeOption({
      label: detail?.phoneNum,
      value: detail?.phoneCodeId,
      show: detail?.phoneCode,
    });
  }, [detail]);

  useEffect(() => {
    init();
  }, []);

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
            label="ID Number:"
            name="idNumber"
            layout="horizontal"
            rules={[
              {
                required: true,
                message: 'Please enter ID Number',
              },
              {
                max: MAX_LENGTH.NAME,
                message: `ID Number cannot exceed ${MAX_LENGTH.NAME} characters`,
              },
            ]}
          >
            <FuzzyAutoComplete
              fieldProps={{
                style: { marginLeft: '40px', width: '175px' },
                placeholder: 'ID Number',
                onBlur: () => onIdNumberBlur(),
                disabled: true,
              }}
              request={{
                field: 'idNumber',
                esDtoClass: ES_DTO_CLASS.CREW,
                type: FieldQueryHighlightTypeEnum.COUNTRY,
              }}
            />
          </Form.Item>
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
                <Input placeholder="Crew Name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: 'Please select Type' }]}
                layout="horizontal"
                labelAlign="left"
                labelCol={{ span: 8 }}
              >
                <Checkbox.Group>
                  <Checkbox value={'driverFlag'}>Driver</Checkbox>
                  <Checkbox value={'helperFlag'}>Helper</Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
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
                labelCol={{ span: 6 }}
              >
                <Input placeholder="Contact" addonBefore={prefixSelector} />
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
                    message: `Contact cannot exceed ${MAX_LENGTH.NAME} characters`,
                  },
                ]}
                layout="horizontal"
                labelAlign="left"
                labelCol={{ span: 8 }}
              >
                <Input placeholder="License" />
              </Form.Item>
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

export default BasicCrew;
