import { ICustomerCodeVosItem } from '@/api/types/waybill';
import CustomPopover from '@/components/CustomPopover';
import CardCase from '@/components/DetailCase/CardCase';
import { useModel } from '@umijs/max';
import { transform } from 'lodash';
import { ReactNode, memo, useEffect, useState } from 'react';
import styles from './common.less';

export const aggregateToJsonArray = (
  data: ICustomerCodeVosItem[],
): Array<{ customerCodeType: string; numbers: string }> => {
  const aggregated = transform(
    data,
    (acc: Record<string, any[]>, obj: ICustomerCodeVosItem) => {
      if (!acc[obj['customerCodeType']]) {
        acc[obj['customerCodeType']] = [];
      }
      acc[obj['customerCodeType']].push(obj.number);
    },
    {} as Record<string, any[]>,
  );

  return Object.keys(aggregated).map((key) => {
    const list = aggregated[key].filter((item) => !!item || item !== '');
    return {
      customerCodeType: key,
      numbers: list?.length === 0 ? '' : list.join(','),
    };
  });
};

const InforItem = memo(
  ({ label, value }: { label: string; value: string | number | ReactNode }) => {
    return (
      <div className={styles.infor_item}>
        <div className={styles.infor_item_label}>{label}</div>
        <div className={styles.infor_item_value}>{value ? value : '-'}</div>
      </div>
    );
  },
);

const ModuleInformation = () => {
  const { state } = useModel('waybill.detail');

  const [newCustomerCodeVos, setNewCustomerCodeVos] = useState<
    Array<{ customerCodeType: string; numbers: string }>
  >([]);

  useEffect(() => {
    const jsonArray = aggregateToJsonArray(state?.basicInfo.customerCodeVos);
    setNewCustomerCodeVos(jsonArray);
  }, [state?.basicInfo]);

  return (
    <CardCase title={'Information'}>
      <div className={styles.infor}>
        <InforItem label="Status" value={state.basicInfo?.status} />
        <InforItem
          label="Position Time"
          value={state.basicInfo?.positionTime}
        />
        <InforItem label="Creation Time" value={state.basicInfo?.createdAt} />
        <InforItem
          label="Waybill Number"
          value={state.basicInfo?.waybillNumber}
        />
        <InforItem label="Customer" value={state.basicInfo?.customerName} />
        <InforItem
          label="Inteluck Dispatcher"
          value={
            <CustomPopover content={state.basicInfo?.dispatcherName}>
              <div className={styles.infor_item_value}>
                {state.basicInfo?.dispatcherName}
              </div>
            </CustomPopover>
          }
        />
        <InforItem label="Plate Number" value={state.basicInfo?.plateNumber} />
        <InforItem label="Driver" value={state.basicInfo?.driverName} />
        {state.basicInfo?.helpers?.map((h, index) => (
          <InforItem
            key={h.id}
            label={`Helper ${index + 1}`}
            value={h.helperName}
          />
        ))}
      </div>
      {!!newCustomerCodeVos.length ? (
        <div className={styles.customerCode}>
          <div className={styles.customerCode_list}>
            {newCustomerCodeVos?.map((item) => {
              return (
                <CustomPopover
                  key={item?.customerCodeType}
                  content={
                    <div className={styles.customerCode_popover}>
                      {`${item.customerCodeType}${
                        !!item.numbers ? `:${item.numbers}` : ''
                      }`}
                    </div>
                  }
                  placement="topLeft"
                >
                  <div className={styles.customerCode_item}>
                    <div className={styles.customerCode_label}>
                      {item.customerCodeType}
                    </div>
                    <div className={styles.customerCode_value}>
                      {item.numbers}
                    </div>
                  </div>
                </CustomPopover>
              );
            })}
          </div>
        </div>
      ) : null}
    </CardCase>
  );
};

export default ModuleInformation;
