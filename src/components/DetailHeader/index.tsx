import { ICommonListItem } from '@/api/types/common';
import styles from '@/components/DetailHeader/styles.less';
import { EditFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { memo } from 'react';

// info item
const InfoItem = memo(function (props: {
  label: string | number;
  name: string | number;
}) {
  const { label, name } = props;
  return (
    <div className={styles.item}>
      <p className={styles.item_label}>{label}</p>
      <div className={styles.item_name}>{name}</div>
    </div>
  );
});

export default memo(function DetailHeader(props: {
  headerName: string;
  headerTitle: string;
  infoList: ICommonListItem[];
  showEdit?: boolean;
  editDisabled?: boolean;
  editClick: () => void;
}) {
  const {
    headerName,
    headerTitle,
    infoList = [],
    showEdit = true,
    editDisabled = false,
    editClick,
  } = props;

  return (
    <div className={styles.header}>
      <div className={styles.header_title}>
        <p className={styles.header_title_name}>{headerName}</p>
        {showEdit ? (
          <Button
            className={styles.header_title_edit}
            disabled={editDisabled}
            onClick={editClick}
          >
            <EditFilled className={styles.header_title_icon} />
            Edit
          </Button>
        ) : null}
      </div>
      <p className={styles.header_name} title={headerTitle}>
        {headerTitle}
      </p>
      <div className={styles.header_content}>
        {infoList.map((item, index) => (
          <InfoItem key={index} label={item.label} name={item?.value} />
        ))}
      </div>
    </div>
  );
});
