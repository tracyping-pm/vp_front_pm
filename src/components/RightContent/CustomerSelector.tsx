import { changeLastSelection } from '@/api/user';
import { useKeepAliveTabs } from '@/components/BreadcrumbTags/useKeepAliveTabs';
import { ES_DTO_CLASS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { useModel } from '@umijs/max';
import { Select, Space } from 'antd';
import React from 'react';
import styles from './index.less';

const CustomerSelector: React.FC = () => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};
  const { clearAliveTabs } = useKeepAliveTabs();

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });

  if (!currentUser) return null;

  return (
    <Space>
      <div>Vendor:</div>
      <div>
        <Select
          className={styles.vendorSelector}
          {...defaultFieldProps}
          options={vendorNameOptions}
          getPopupContainer={() => document.body}
          onSearch={(keywords) =>
            vendorNameSearch(keywords, {
              uniqueLogic:
                FieldQueryHighlightUniqueLogicEnum.CP_VP_INTERNAL_TAG,
            })
          }
          onSelect={async (option) => {
            const res = await changeLastSelection({
              id: option.value,
            });
            if (res.code !== 200) return;
            clearAliveTabs();
            // history.push(`${PATHS.HOME}`);
            // location.reload();
          }}
          defaultValue={currentUser.lastSelection}
        />
      </div>
    </Space>
  );
};

export default CustomerSelector;
