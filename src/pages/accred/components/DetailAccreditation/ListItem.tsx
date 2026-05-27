import {
  IAccreditationCategoryItem,
  IAccreditationMaterialItem,
} from '@/api/types/accred';
import { IImageState } from '@/api/types/common';
import CommonFileItem from '@/components/CommonFileItem';
import { EditOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import lodash from 'lodash';
import { useCallback, useState } from 'react';
import EditCategoryModal from './EditCategoryModal';
import styles from './styles.less';

interface ItemProps {
  record: IAccreditationCategoryItem;
  isDraft: boolean;
  imageState: IImageState;
  setImageState: (imageState: any) => void;
  reload: () => void;
}
export default function ListItem({
  record,
  isDraft,
  reload,
  imageState,
  setImageState,
}: ItemProps) {
  const [editCategoryModalOpen, setEditCategoryModalOpen] =
    useState<boolean>(false);

  const onEdit = () => {
    setEditCategoryModalOpen(true);
  };

  const onCustomPreview = useCallback(
    (material: IAccreditationMaterialItem) => {
      const index = lodash.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileMaterialId === material.fileMaterialId,
      );
      setImageState({
        index,
        visible: true,
      });
    },
    [imageState, setImageState],
  );

  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_title}>
          <div>
            {record.required ? (
              <span style={{ color: '#ff4d4f' }}>*</span>
            ) : null}
            <span>{record.fileCategory}</span>
            {record.validIndefinitely ? (
              <Tag style={{ marginLeft: 10 }}> Permanently Valid</Tag>
            ) : (
              ''
            )}
          </div>
          {isDraft && (
            <span className={styles.item_title_deleteIcon} onClick={onEdit}>
              <EditOutlined />
            </span>
          )}
        </div>
        {!record.validIndefinitely &&
          record.validDateStart &&
          record.validDateEnd && (
            <div className={styles.item_time}>
              validDate:
              {record.validDateStart
                ? dayjs(record.validDateStart).format('YYYY/MM/DD')
                : ''}
              -
              {record.validDateEnd
                ? dayjs(record.validDateEnd).format('YYYY/MM/DD')
                : ''}
            </div>
          )}
        <div className={styles.item_content}>
          {record.accreditationMaterialList?.map(
            (fileItem: IAccreditationMaterialItem) => (
              <CommonFileItem
                key={fileItem.fileAccreditationId}
                className={styles.file_item}
                thumbnail={fileItem.fileThumbnailUrl}
                fileType={fileItem.fileType}
                fileName={fileItem.fileName}
                materialId={record.categoryMaterialId}
                driveFileId={fileItem.fileDriveId}
                fileMimeType={fileItem.fileMimeType}
                onCustomPreview={() => onCustomPreview(fileItem)}
              />
            ),
          )}
        </div>
      </div>
      <EditCategoryModal
        open={editCategoryModalOpen}
        record={record}
        reload={reload}
        onCancel={() => setEditCategoryModalOpen(false)}
        onClose={() => setEditCategoryModalOpen(false)}
      />
    </>
  );
}
