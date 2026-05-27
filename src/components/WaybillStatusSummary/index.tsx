import { IWaybillStatisticsTotalQuantityResp } from '@/api/types/waybill';
import { getWaybillStatisticsTotalQuantity } from '@/api/waybill';
import { useSetState } from 'ahooks';
import { Skeleton, Space } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect } from 'react';
import Item from './Item';
import styles from './index.less';
import { ReactComponent as IconAllCrew } from './static/all-crew.svg';
import { ReactComponent as IconAllTrucks } from './static/all-trucks.svg';
import { ReactComponent as IconAllWaybils } from './static/all-waybills.svg';
import { ReactComponent as IconDelivered } from './static/delivered.svg';

interface IProps {
  bg: '#FFFFFF' | '#FAFAFA';
}

interface IState {
  loading: boolean;
  data: IWaybillStatisticsTotalQuantityResp;
}

const initialState: IState = {
  loading: false,
  data: {} as IWaybillStatisticsTotalQuantityResp,
};

const WaybillStatusSummary: FC<IProps> = ({ bg }) => {
  const [state, setState] = useSetState<IState>(initialState);

  const fetchData = useCallback(async () => {
    setState({ loading: true });
    const res = await getWaybillStatisticsTotalQuantity().finally(() => {
      setState({ loading: false });
    });

    if (res.code === 200) {
      setState({ data: res.data });
    }
  }, []);

  const renderSkeleton = () => {
    return (
      <div
        style={{
          height: '112px',
          overflow: 'hidden',
          // backgroundColor: '#f5f5f5',
        }}
      >
        <Space direction="vertical">
          <Space size={'small'}>
            <Skeleton.Avatar active size="small" />
            <Skeleton.Button active block size="small" />
            <Skeleton.Input active block size="small" />
          </Space>
          <Space size={'small'}>
            <Skeleton.Input active block size="small" />
            <Skeleton.Input active block size="small" />
          </Space>
          <Skeleton.Input active block size="small" />
          <Skeleton.Input active block size="small" />
        </Space>
      </div>
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className={cls('waybillStatusSummary', styles.waybillStatusSummary)}>
        <div className="summary-item">
          {state.loading ? (
            renderSkeleton()
          ) : (
            <Item
              title="All Waybills"
              num={state.data.waybillNum ?? 0}
              statusColor="#009688"
              bg={bg}
              icon={<IconAllWaybils />}
            />
          )}
        </div>
        <div className="summary-item">
          {state.loading ? (
            renderSkeleton()
          ) : (
            <Item
              title="Delivered Waybills"
              num={state.data.deliveredWaybillNum ?? 0}
              statusColor="#13C2C2"
              bg={bg}
              icon={<IconDelivered />}
            />
          )}
        </div>
        <div className="summary-item">
          {state.loading ? (
            renderSkeleton()
          ) : (
            <Item
              title="All Trucks"
              num={state.data.truckNum ?? 0}
              statusColor="#FA8C16"
              bg={bg}
              icon={<IconAllTrucks />}
            />
          )}
        </div>
        <div className="summary-item">
          {state.loading ? (
            renderSkeleton()
          ) : (
            <Item
              title="All Crew"
              num={state.data.crewNum ?? 0}
              statusColor="#2F54EB"
              bg={bg}
              icon={<IconAllCrew />}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default WaybillStatusSummary;
