import { CardCase } from '@/components/DetailCase';
import { WaybillStatusEnum } from '@/enums';
import { useModel } from '@umijs/max';
import { Spin, Steps } from 'antd';
import cls from 'classnames';
import { useEffect, useState } from 'react';
import { ReactComponent as IconAbnormal } from '../static/abnormal.svg';
import { ReactComponent as IconCanceled } from '../static/canceled.svg';
import styles from './common.less';

const status_steps = [
  {
    title: WaybillStatusEnum.PENDING,
    description:
      'You have been assigned a waybill, please wait for shipping to begin',
  },
  {
    title: WaybillStatusEnum.IN_TRANSIT,
    description:
      'The waybill has been started, please ensure transportation efficiency and cargo safety',
  },
  {
    title: WaybillStatusEnum.DELIVERED,
    description:
      'The goods have been confirmed delivered, please wait for confirmation from the platform',
  },
  {
    title: WaybillStatusEnum.COMPLETED,
    description: 'The waybill has ended, thank you for your service',
  },
];

const status_exceptions = {
  [WaybillStatusEnum.CANCELED]: {
    title: 'Canceled',
    description: 'The waybill has been canceled',
    icon: <IconCanceled />,
    color: '#262626',
    bgColor: 'rgba(202,202,202,0.1)',
  },
  [WaybillStatusEnum.ABNORMAL]: {
    title: 'Rejected',
    description: 'The waybill has been marked as abnormal',
    icon: <IconAbnormal />,
    color: '#F5222D',
    bgColor: '#FDE8E9',
  },
};

const ModuleStatusDescription: React.FC = () => {
  const { state } = useModel('waybill.detail');
  const { basicInfo, loading } = state;
  const { status } = basicInfo;
  const [current, setCurrent] = useState<number>(0);

  // 如果是异常状态，显示异常状态的描述
  const isException = Object.keys(status_exceptions).includes(status);

  // 得到 status_steps 当前status的index
  const activeIndex = status_steps.findIndex((item) => item.title === status);
  const activeItem = status_steps[activeIndex] ?? {};
  const { title, description } = activeItem;

  // @ts-ignore
  const exceptionItem = status_exceptions[status] ?? {};

  useEffect(() => {
    if (state.basicInfo.status === WaybillStatusEnum.PENDING) {
      setCurrent(0);
    }
    if (state.basicInfo.status === WaybillStatusEnum.IN_TRANSIT) {
      setCurrent(1);
    }
    if (
      state.basicInfo.status === WaybillStatusEnum.DELIVERED ||
      state.basicInfo.status === WaybillStatusEnum.COMPLETED
    ) {
      setCurrent(2);
    }
  }, [state]);

  return (
    <>
      <Spin spinning={loading}>
        {isException ? (
          <div className={cls(styles.exceptionCase, 'exceptionCase')}>
            {exceptionItem?.icon}
            <div
              className="exception-title"
              style={{
                backgroundColor: exceptionItem?.bgColor,
                color: exceptionItem?.color,
              }}
            >
              {exceptionItem?.description}
            </div>
          </div>
        ) : (
          <CardCase>
            <div className={cls(styles.statusDescription, 'statusDescription')}>
              <div className="status-text">
                <div className="status-title">{title}</div>
                <div className="status-description">{description}</div>
              </div>
              <div className="status-step">
                <Steps
                  current={current}
                  progressDot
                  items={[
                    {
                      description: 'Pending',
                    },
                    {
                      description: 'In Transit',
                    },
                    {
                      description: 'Delivered',
                    },
                  ]}
                />
              </div>
            </div>
          </CardCase>
        )}
      </Spin>
    </>
  );
};

export default ModuleStatusDescription;
