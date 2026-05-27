import cls from 'classnames';
import { FC } from 'react';
import styles from './styles.less';

interface IProps {
  description: string;
}

const MarkerDetailForOrigin: FC<IProps> = ({ description }) => {
  return (
    <>
      <div className={cls('markerDetail', styles.markerDetail)}>
        <div className="normalItem">
          <span className="label">Pick Up Origin: </span>
          <span className="value">{description}</span>
        </div>
      </div>
    </>
  );
};

export default MarkerDetailForOrigin;
