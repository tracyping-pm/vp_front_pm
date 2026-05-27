import cls from 'classnames';
import { FC, ReactNode } from 'react';
import CountUp from 'react-countup';
import styles from './index.less';

interface IProps {
  title: string;
  num: number;
  bg: '#FFFFFF' | '#FAFAFA';
  icon: ReactNode;
  statusColor: string;
  active?: boolean;
  onClick?: () => void;
}

const Item: FC<IProps> = ({
  title,
  num,
  statusColor,
  icon,
  active,
  bg,
  onClick,
}) => {
  return (
    <>
      <div
        className={cls(
          'waybillStatusItem',
          styles.waybillStatusItem,
          active && styles.active,
        )}
        style={{ backgroundColor: bg }}
        onClick={() => onClick?.()}
      >
        <div className="header">
          <span className="left">
            <span className="title-wrap">
              <span
                className={cls('dot')}
                style={{ backgroundColor: statusColor }}
              />
              <span className="title">{title}</span>
            </span>
            <span className="num">
              <CountUp end={num} separator="," />
            </span>
          </span>
          <span className="right">{icon}</span>
        </div>
      </div>
    </>
  );
};

export default Item;
