import { HistoryBackCase } from '@/components/DetailCase';
import { SHOW_WAYBILL_POD, WaybillStatusEnum } from '@/enums';
// import ModuleFeeOverview from '@/pages/waybill/components/ModuleFeeOverview';
import ModuleInformation from '@/pages/waybill/components/ModuleInformation';
import ModulePOD from '@/pages/waybill/components/ModulePOD';
import { useLocation, useModel, useSearchParams } from '@umijs/max';
import cls from 'classnames';
import { useEffect } from 'react';
import ModuleRoute from './components/ModuleRoute';
import ModuleStatusDescription from './components/ModuleStatusDescription';
import styles from './components/common.less';

const Detail: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { state, startUp, reset } = useModel('waybill.detail');

  useEffect(() => {
    startUp(Number(id));

    return () => {
      reset();
    };
  }, [location]);

  return (
    <>
      <div className={cls(styles.detailContainer, 'detailContainer')}>
        {/* <BreadcrumbCase
          items={[
            { name: 'Waybills', path: PATHS.WAYBILL_LIST },
            { name: 'Details', path: PATHS.WAYBILL_DETAIL },
          ]}
        /> */}
        <HistoryBackCase />
        <ModuleStatusDescription />
        {/*<ModuleFeeOverview />*/}
        {SHOW_WAYBILL_POD.includes(state.basicInfo.status) ||
        (state.basicInfo.status === WaybillStatusEnum.CANCELED &&
          state.basicInfo?.preStatus !== WaybillStatusEnum.PENDING) ? (
          <ModulePOD />
        ) : null}
        <ModuleRoute />
        <ModuleInformation />
      </div>
    </>
  );
};

export default Detail;
