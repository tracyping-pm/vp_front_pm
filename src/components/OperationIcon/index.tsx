import cls from 'classnames';
import { FC } from 'react';
import { ReactComponent as ListOptionsDelete } from '../../../public/svg/list_options_delete.svg';
import { ReactComponent as ListOptionsDetail } from '../../../public/svg/list_options_detail.svg';
import { ReactComponent as ListOptionsEdit } from '../../../public/svg/list_options_edit.svg';
import CustomPopover from '../CustomPopover';
import styles from './index.less';

export interface IIconItem {
  showPopover?: boolean;
  onClick?: () => void;
}

const IconDelete: FC<IIconItem> = ({ showPopover = true, onClick }) => {
  return (
    <>
      {showPopover ? (
        <CustomPopover key="delete" content="Delete" placement="top">
          <ListOptionsDelete
            className={cls(styles.iconItem, styles.deleteIcon)}
            onClick={() => onClick?.()}
          />
        </CustomPopover>
      ) : (
        <ListOptionsDelete
          className={cls(styles.iconItem, styles.deleteIcon)}
          onClick={() => onClick?.()}
        />
      )}
    </>
  );
};

const IconDetail: FC<IIconItem> = ({ showPopover = true, onClick }) => {
  return (
    <>
      {showPopover ? (
        <CustomPopover key="detail" content="Detail" placement="top">
          <ListOptionsDetail
            className={cls(styles.iconItem)}
            onClick={() => onClick?.()}
          />
        </CustomPopover>
      ) : (
        <ListOptionsDetail
          className={cls(styles.iconItem)}
          onClick={() => onClick?.()}
        />
      )}
    </>
  );
};

const IconEdit: FC<IIconItem> = ({ showPopover = true, onClick }) => {
  return (
    <>
      {showPopover ? (
        <CustomPopover key="edit" content="Edit" placement="top">
          <ListOptionsEdit
            className={cls(styles.iconItem)}
            onClick={() => onClick?.()}
          />
        </CustomPopover>
      ) : (
        <ListOptionsEdit
          className={cls(styles.iconItem)}
          onClick={() => onClick?.()}
        />
      )}
    </>
  );
};

export { IconDelete, IconDetail, IconEdit };
