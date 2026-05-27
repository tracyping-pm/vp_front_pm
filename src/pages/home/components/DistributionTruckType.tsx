import { getTruckTypeYear } from '@/api/home';
import { ITruckTypeYearItem } from '@/api/types/home';
import { useSize } from 'ahooks';
import { Skeleton } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from 'react';
import styles from './styles.less';

const DistributionTruckType = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<ITruckTypeYearItem[]>([]);
  const [totalNum, setTotalNum] = useState<number>(0);
  const [truckList, setTruckList] = useState<string[]>([]);
  const waybillRef = useRef<HTMLDivElement>(null); // waybill Dom实例
  const waybillChartRef = useRef<echarts.ECharts | null>(null); // waybill chart图表实例
  const size = useSize(waybillRef);

  const init = async () => {
    setLoading(true);
    const res = await getTruckTypeYear();
    setLoading(false);
    if (res.code === 200) {
      const total = res?.data?.reduce((acc, obj) => acc + obj.num, 0);
      const list = res?.data?.map((item) => item.name);
      setTruckList(list);
      setTotalNum(total ? total : 0);
      setDetail(res?.data ?? []);
    }
  };

  useEffect(() => {
    const option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        icon: 'rect',
        top: 0,
        right: 48,
        padding: [0, 0, 16, 0],
        itemWidth: 24,
        itemHeight: 14,
        data: truckList,
      },
      color: [
        '#14B8A6',
        '#3B7BDD',
        '#6361D8',
        '#EC4899',
        '#FF4000',
        '#F5960A',
        '#FAC213',
        '#FFDBA7',
        '#0A0909',
        '#736D67',
        '#D9CEC3',
      ],
      series: [
        {
          name: 'Truck Type',
          type: 'pie',
          radius: ['48%', '68%'],
          padAngle: 0.8,
          avoidLabelOverlap: true,
          center: ['45%', '47%'],
          label: {
            formatter: (val: any) => {
              return `${val.name}\n${val.value} (${(
                (val.value / totalNum) *
                100
              )?.toFixed(2)}%)`;
            },
            color: '#404040',
            fontSize: 11,
            lineHeight: 12,
          },
          labelLine: {
            length: 36,
            length2: 16,
          },
          itemStyle: {
            borderRadius: 2,
          },
          tooltip: {
            valueFormatter: (val: number) => {
              return `${val} (${((val / totalNum) * 100)?.toFixed(2)}%)`;
            },
          },
          data: detail?.map((d) => ({ value: d.num, name: d.name })),
        },
      ],
    };
    waybillChartRef.current = echarts.init(
      waybillRef.current as HTMLDivElement,
    );
    waybillChartRef.current?.setOption(option as any);
    waybillChartRef.current?.resize();
  }, [detail]);

  useEffect(() => {
    waybillChartRef.current?.resize();
  }, [size]);

  useEffect(() => {
    init();
  }, []);

  return (
    <div className={styles.waybill}>
      <div className={styles.waybill_header} style={{ border: 'none' }}>
        <div className={styles.waybill_title}>
          Distribution of Truck Types Provided This Year
        </div>
      </div>
      <div style={{ padding: '16px 0 8px' }}>
        {loading ? (
          <Skeleton
            title={false}
            paragraph={{
              rows: 13,
              width: [
                '48%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '100%',
                '64%',
              ],
            }}
            style={{ height: '400px', padding: '24px 24px' }}
            active
          />
        ) : (
          <div ref={waybillRef} style={{ width: '100%', height: '400px' }} />
        )}
      </div>
    </div>
  );
};

export default DistributionTruckType;
