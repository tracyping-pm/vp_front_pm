import { emailLogin } from '@/api/auth';
import { MAX_LENGTH, PATHS, REGEXP, TOKEN_KEY } from '@/constants';
import { GlobalOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { useSize } from 'ahooks';
import cls from 'classnames';
import Cookie from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import LoginBg from '../../../../public/svg/login/login_bg.svg';
import LoginLogo from '../../../../public/svg/login/login_logo.svg';
import { ReactComponent as LoginMessage } from '../../../../public/svg/login_message.svg';
import styles from './index.less';

const UI_DESIGN_WIDTH = 1920;

const LoginPage: React.FC = () => {
  // const [searchParams] = useSearchParams();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [scale, setScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  const loginSuccess = async (token: string) => {
    // 目前后台设置了1个小时过期，有新操作会续期，前端这里先设置7天过期
    Cookie.set(TOKEN_KEY, token, { expires: 7 });
    const userInfo = await initialState?.fetchUserInfo?.();
    // @ts-ignore
    await setInitialState((s) => ({
      ...s,
      currentUser: userInfo,
    }));

    if (!history) return;
    setTimeout(() => {
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
  };

  const onFinish = async (values: any) => {
    const { email, password } = values;
    try {
      const res = await emailLogin({ email, password });
      if (res.code === 200 && res.data) {
        await loginSuccess(res.data);
      } else {
        // TODO: 捕获错误信息，显示在页面上
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (size) {
      if ((size?.width ?? 0) > 0 && (size?.height ?? 0) > 0) {
        const newScale = size.width / UI_DESIGN_WIDTH;
        console.log('size', size, newScale);
        setScale(newScale);
      }
    }
  }, [size]);

  return (
    <>
      <div
        className={cls('sso-container', styles.ssoContainer)}
        ref={containerRef}
      >
        <img
          className={styles.loginBg}
          src={LoginBg}
          alt="bg"
          // style={{
          //   transform: `scale(${scale})`,
          //   transformOrigin: 'right bottom',
          // }}
        />
        <div
          className="loginContainer"
          style={{
            top: 190 * scale < 160 ? 160 : 190 * scale,
            left: 144 * scale,
          }}
        >
          <div className="loginLogoBox">
            <img className="loginLogo" alt="logo" src={LoginLogo} />
            <div className="loginLogoBeta">BETA</div>
          </div>
          <div className="loginTitle">Welcome to Vendor Portal</div>
          <div className="loginSubTitle">
            Log in to the Vendor Portal now for the best experience
          </div>
          <LoginForm
            actions={
              <div className="actionsWrap">
                <div>
                  If you forget your account or password, contact Inteluck staff
                </div>
                <div className="dotLine">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="418"
                    height="2"
                    viewBox="0 0 418 2"
                    fill="none"
                  >
                    <path d="M0 1H420" stroke="#CFCFCF" strokeDasharray="4" />
                  </svg>
                </div>
                <div className="formText">
                  For more information please contact us
                </div>
                <div
                  className="formText link"
                  onClick={() => window.open('https://www.inteluck.com/SG/')}
                >
                  <GlobalOutlined /> https://www.inteluck.com/SG/
                </div>
                <div
                  className="formText link"
                  onClick={() =>
                    window.open('mailto:https://support@inteluck.com')
                  }
                >
                  <LoginMessage />
                  support@inteluck.com
                </div>
              </div>
            }
            submitter={{
              searchConfig: {
                submitText: 'Login',
              },
              submitButtonProps: {
                style: {
                  maxWidth: '420px',
                  width: '100%',
                  borderRadius: '8px',
                },
              },
            }}
            onFinish={onFinish}
          >
            <div className={styles.form}>
              <ProFormText
                name="email"
                fieldProps={{
                  style: { width: 420, height: 48 },
                  size: 'large',
                }}
                placeholder={'input your email'}
                rules={[
                  {
                    required: true,
                    message: 'Please enter email',
                  },
                  {
                    pattern: REGEXP.WHITESPACE,
                    message: 'Cannot contain spaces',
                  },
                  {
                    pattern: REGEXP.EMAIL,
                    message: 'Please enter valid email',
                  },
                  {
                    max: MAX_LENGTH.EMAIL,
                    message: `Email cannot exceed ${MAX_LENGTH.EMAIL} characters`,
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  style: { width: 420, height: 48 },
                  size: 'large',
                }}
                placeholder={'input password'}
                rules={[
                  {
                    required: true,
                    message: 'Please enter password',
                  },
                  {
                    max: MAX_LENGTH.PASSWORD,
                    message: `Password cannot exceed ${MAX_LENGTH.PASSWORD} characters`,
                  },
                ]}
              />
            </div>
          </LoginForm>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
