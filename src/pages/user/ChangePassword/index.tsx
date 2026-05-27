import { IChangePassword } from '@/api/types/user';
import { changePassword } from '@/api/user';
import { MAX_LENGTH, PATHS, REGEXP } from '@/constants';
import { AccountStatusEnum } from '@/enums';
import { openNewTag } from '@/utils/utils';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { App, Button, Form } from 'antd';
import cls from 'classnames';
import { noop } from 'lodash';
import { useState } from 'react';
import LoginLogo from '../../../../public/img/login_logo.jpg';
import styles from './index.less';
const ChangePasswordPage: React.FC = () => {
  const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [pending, setPending] = useState<boolean>(false);

  const repeatPasswordValidator = (
    _: any,
    value: any,
    callback: typeof noop,
  ) => {
    const { getFieldValue } = form;
    const newPassword = getFieldValue('newPassword');
    if (value && value !== newPassword) {
      callback('The two entered passwords do not match');
    }
    callback();
  };

  const repeatOldPasswordValidator = (
    _: any,
    value: any,
    callback: typeof noop,
  ) => {
    const { getFieldValue } = form;
    const oldPassword = getFieldValue('oldPassword');

    if (value) {
      if (!REGEXP.PASSWORD.test(value)) {
        callback('The new password entered does not meet the requirements');
      } else if (value === oldPassword) {
        callback('The old and new passwords cannot be the same');
      } else {
        callback();
      }
    }

    callback();
  };

  const onFinish = async (values: Partial<IChangePassword>) => {
    const { oldPassword, newPassword } = values;
    const payload = {
      email: initialState?.currentUser?.email,
      oldPassword,
      newPassword,
    };
    try {
      setPending(true);
      //@ts-ignore
      const res = await changePassword(payload);
      setPending(false);
      if (res.code === 200) {
        const userInfo = await initialState?.fetchUserInfo?.();
        // @ts-ignore
        await setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
        message.success('Change password successfully!');
        setTimeout(() => {
          // history.push(PATHS.HOME);

          const { accredApplicationId, name } = userInfo ?? {};
          // https://inteluck.atlassian.net/wiki/spaces/CPT/pages/844955675/S33+Vendor
          if (accredApplicationId) {
            history.replace(
              `${PATHS.ACCRED_APPLICATION_DETAIL}?type=Vendor&id=${accredApplicationId}&breadcrumbName=${name}`,
            );
          } else {
            history.replace(`${PATHS.ACCRED_APPLICATION}`);

            // https://github.com/ant-design/ant-design-pro/issues/10222
            // refresh();
            /** 此方法会跳转到 redirect 参数所在的位置 */
            // const redirect = searchParams.get('redirect');
            // console.log({ redirect });
            // // 刷新页面，防止特殊情异常出现
            // location.replace(redirect || PATHS.HOME);
          }
        }, 0);
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      setPending(false);
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      {/* <img src={ChangePasswordBackground} className={styles.background} /> */}
      <div className={styles.content}>
        <img src={LoginLogo} className={styles.logo} />
        <div className={styles.title}>Change Password</div>
        <div className={styles.desc}>
          To ensure the security of your account,please create a password that
          meets the following requirements:
        </div>
        <div className={styles.tips}>
          <p>Minimum length of 8 characters</p>
          <p>At least one uppercase letter (A-Z)</p>
          <p>At least one lowercase letter (a-z)</p>
          <p>At least one digit (0-9)</p>
          <p>At least one special character (e.g., !@#$%^&*)</p>
        </div>
        <section className={cls(styles.formWrap, styles.customFormItem)}>
          <ProForm
            form={form}
            submitter={{
              render: (props) => {
                return [
                  <Button
                    type="primary"
                    block
                    key="submit"
                    size="large"
                    loading={pending}
                    onClick={() => props.form?.submit?.()}
                  >
                    Confirm
                  </Button>,
                  initialState?.currentUser?.status !==
                  AccountStatusEnum.INACTIVE ? (
                    <Button
                      style={{
                        width:
                          initialState?.currentUser?.status !==
                          AccountStatusEnum.INACTIVE
                            ? '60%'
                            : '',
                      }}
                      key="cancel"
                      block
                      size="large"
                      onClick={() => history.back()}
                    >
                      Cancel
                    </Button>
                  ) : null,
                ];
              },
            }}
            onFinish={onFinish}
          >
            {initialState?.currentUser?.status !==
              AccountStatusEnum.INACTIVE && (
              <ProFormText.Password
                name="oldPassword"
                fieldProps={{
                  size: 'large',
                  style: { height: 48 },
                }}
                placeholder={'Current Password'}
                rules={[
                  {
                    required: true,
                    message: 'Please enter current password',
                  },
                  {
                    pattern: REGEXP.WHITESPACE,
                    message: 'Cannot contain spaces',
                  },
                ]}
              />
            )}
            <ProFormText.Password
              name="newPassword"
              fieldProps={{
                size: 'large',
                style: { height: 48 },
              }}
              placeholder={'New Password'}
              rules={[
                {
                  required: true,
                  message: 'Please enter new password',
                },
                {
                  pattern: REGEXP.WHITESPACE,
                  message: 'Cannot contain spaces',
                },
                {
                  max: MAX_LENGTH.PASSWORD,
                  message: `The new password cannot exceed ${MAX_LENGTH.PASSWORD} characters`,
                },
                initialState?.currentUser?.status !== AccountStatusEnum.INACTIVE
                  ? {
                      validator: repeatOldPasswordValidator,
                    }
                  : {
                      pattern: REGEXP.PASSWORD,
                      message:
                        'The new password entered does not meet the requirements',
                    },
              ]}
            />
            <ProFormText.Password
              name="repeatPassword"
              fieldProps={{
                size: 'large',
                style: { height: 48 },
              }}
              placeholder={'Repeat Password'}
              rules={[
                {
                  required: true,
                  message: 'Please enter repeat password',
                },
                {
                  validator: repeatPasswordValidator,
                },
              ]}
            />
          </ProForm>
          <div>
            {initialState?.currentUser?.status ===
              AccountStatusEnum.INACTIVE && (
              <div className={styles.agreement}>
                By clicking confrm, you agree to the{' '}
                <span
                  onClick={() => {
                    openNewTag('/user/greement');
                  }}
                >
                  Inteluck Vendor Portal User Agreement
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
      {/*</PageContainer>*/}
    </div>
  );
};

export default ChangePasswordPage;
