import { IDestinationInTransitItem } from '@/api/types/waybill';
import cls from 'classnames';
import { FC } from 'react';
import styles from './styles.less';

interface IProps {
  data: IDestinationInTransitItem;
}

const MarkerDetail: FC<IProps> = ({ data }) => {
  return (
    <>
      <div className={cls('markerDetail', styles.markerDetail)}>
        {data?.labels && (
          <div className="normalItem">
            <span className="label">Label: </span>
            <span className="value">{data.labels}</span>
          </div>
        )}
        <div className="normalItem">
          <span className="label">Number Of Trucks: </span>
          <span className="value">{data?.trucks}</span>
        </div>
        <div className="normalItem">
          <span className="label">Delivered Destination: </span>
          <span className="value">{data?.destinationAddress}</span>
        </div>
      </div>
    </>
  );
};

export default MarkerDetail;
