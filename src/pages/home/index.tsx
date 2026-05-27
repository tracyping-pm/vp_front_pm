import WaybillStatusSummary from '@/components/WaybillStatusSummary';
import { useLayoutStyles } from '@/hooks/useLayoutStyles';
import cls from 'classnames';
import { FC, useEffect } from 'react';
import DistributionTruckType from './components/DistributionTruckType';
import HomeGoogleMap from './components/HomeGoogleMap';
import WaybillTrendStatistics from './components/WaybillTrendStatistics';
import styles from './index.less';

const topClassName = 'use-home';

const HomePage: FC = () => {
  const { setStyles, addClassName, removeClassName } = useLayoutStyles();

  useEffect(() => {
    setStyles({ backgroundColor: '#F5F5F5' });
    addClassName(topClassName);
    return () => {
      setStyles({ backgroundColor: '#FFFFFF' });
      removeClassName(topClassName);
    };
  }, []);

  return (
    <>
      <div className={cls('homePage', styles.homePage)}>
        <div className="homeItem">
          <WaybillStatusSummary bg="#FFFFFF" />
        </div>

        <div className="homeItem">
          <HomeGoogleMap />
        </div>

        <div className="homeItem">
          <WaybillTrendStatistics />
        </div>

        <div className="homeItem">
          <DistributionTruckType />
        </div>
      </div>
    </>
  );
};

export default HomePage;
