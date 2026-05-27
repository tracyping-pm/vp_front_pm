import CommonFileItem from '@/components/CommonFileItem';
import styles from '@/components/DetailTimeLineItem/styles.less';
import { EditOutlined } from '@ant-design/icons';

import { memo } from 'react';
import { ReactComponent as CustomerEditIcon } from '../../../public/svg/customer_edit_icon.svg';
import CustomConfirmModal from '../CustomConfirmModal';

export default memo(function DetailTimeLineItem(props: {
  data: any;
  time: string;
  description: string;
  fileList: any[];
  showEditBtn?: boolean;
  showDeleteBtn?: boolean;
  editHandle?: (d: any) => void;
  deleteHandle?: (d: any) => void;
}) {
  const {
    data,
    time = '',
    description = '',
    fileList = [],
    showEditBtn = true,
    showDeleteBtn = true,
    editHandle = () => {},
    deleteHandle = () => {},
  } = props;
  return (
    <div className={styles.item}>
      <div className={styles.item_time}>
        {time}
        <>
          {showEditBtn ? (
            <EditOutlined
              className={styles.item_time_editIcon}
              onClick={() => editHandle(data)}
            />
          ) : null}
          {showDeleteBtn ? (
            <CustomConfirmModal
              key="delete"
              title="Delete"
              content="Confirm delete item"
              onOk={() => deleteHandle(data)}
            >
              <CustomerEditIcon className={styles.item_time_delIcon} />
            </CustomConfirmModal>
          ) : null}
        </>
      </div>
      <div className={styles.item_desc}>
        <p className={styles.item_desc_title}>Description</p>
        <p className={styles.item_desc_content}>{description}</p>
      </div>
      {fileList.length ? (
        <div className={styles.item_mater}>
          <p className={styles.item_mater_title}>Material</p>
          <div className={styles.item_mater_file}>
            {fileList.map((item: any) => (
              <CommonFileItem
                key={item.fileId || item.fileDriveId}
                className={styles.file_item}
                thumbnail={item.fileBase64String || item.fileThumbnailUrl}
                fileType={item.fileType}
                fileName={item.fileName}
                materialId={item.fileId || item.fileMaterialId}
                driveFileId={item.fileDriveId}
                fileMimeType={item.fileMimeType}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});
