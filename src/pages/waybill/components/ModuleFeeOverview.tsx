import { IWaybillListFee } from '@/api/types/waybill';
import { waybillFeeDetail } from '@/api/waybill';
import CardCase from '@/components/DetailCase/CardCase';
import { CountryCurrencyEnumText } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { useSearchParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Col, Row } from 'antd';
import { useCallback, useEffect } from 'react';
import styles from './common.less';

interface IModeState {
  loading?: boolean;
  feeInfo: IWaybillListFee;
}

const initialModeState: IModeState = {
  loading: false,
  feeInfo: {} as IWaybillListFee,
};

const ModuleFeeOverview = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [modeState, setModeState] = useSetState<IModeState>(initialModeState);

  const CommonLine = useCallback(
    ({ label, value }: { label: string; value: string | number }) => {
      return (
        <div className={styles.fee_item_line}>
          <span className={styles.fee_item_label}>{label}</span>
          <span className={styles.fee_item_value}>{value}</span>
        </div>
      );
    },
    [],
  );

  const fetchFeeInfo = useCallback(async () => {
    setModeState({ loading: true });
    const res = await waybillFeeDetail({ id: Number(id) });
    setModeState({ loading: false });
    if (res.code === 200) {
      setModeState({ feeInfo: res.data ?? {} });
    }
  }, []);

  useEffect(() => {
    fetchFeeInfo();
  }, []);

  return (
    <CardCase title={'Fees Overview'}>
      <div className={styles.fee_header}>
        <span>Waybill Receivable Amount</span>
        <span>
          {CountryCurrencyEnumText[modeState.feeInfo?.country]}
          {formatAmount(Number(modeState.feeInfo?.waybillReceivableAmount))}
        </span>
      </div>
      <Row style={{ marginTop: '16px' }} gutter={[16, 16]}>
        <Col span={12}>
          <div className={styles.fee_item}>
            <CommonLine
              label="Basic amount receivable"
              value={`${
                CountryCurrencyEnumText[modeState.feeInfo?.country]
              }${formatAmount(
                Number(modeState.feeInfo?.basicAmountReceivable),
              )}`}
            />
            <CommonLine
              label="Additional amount receivable"
              value={`${
                CountryCurrencyEnumText[modeState.feeInfo?.country]
              }${formatAmount(
                Number(modeState.feeInfo?.additionalAmountReceivable),
              )}`}
            />
          </div>
        </Col>
        <Col span={12}>
          <div className={styles.fee_item}>
            <CommonLine
              label="Amount of payment advance"
              value={`${
                CountryCurrencyEnumText[modeState.feeInfo?.country]
              }${formatAmount(
                Number(modeState.feeInfo?.amountOfPaymentAdvance),
              )}`}
            />
            <CommonLine
              label="Percentage of payment advance"
              value={`${modeState.feeInfo?.percentageOfPaidInAdvance}%`}
            />
          </div>
        </Col>
      </Row>
    </CardCase>
  );
};

export default ModuleFeeOverview;
