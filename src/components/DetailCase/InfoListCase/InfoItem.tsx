import { FC, ReactNode } from 'react';
import styles from './index.less';

interface IInfoItem {
  label: string;
  value: ReactNode;
  hasDivider?: boolean;
  labelColor?: string;
  valueColor?: string;
}

const InfoItem: FC<IInfoItem> = ({
  label,
  value,
  labelColor = '#838ca1',
  valueColor = '#262626',
  hasDivider = false,
}) => {
  return (
    <div className={styles.infoItemWrap}>
      <div className={styles.infoItem}>
        <div
          className={styles.infoItemLabel}
          style={{ color: labelColor }}
          title={label}
        >
          {label}
        </div>
        <div className={styles.infoItemValue} style={{ color: valueColor }}>
          {value || '-'}
        </div>
      </div>
      {hasDivider && <div className={styles.divider} />}
    </div>
  );
};

export default InfoItem;
