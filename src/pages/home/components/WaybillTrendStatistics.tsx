import { getWaybillTrendStatistics } from '@/api/home';
import { IWaybillTrendStatistics } from '@/api/types/home';
import { ProFormDatePicker } from '@ant-design/pro-components';
import { useSize } from 'ahooks';
import { App, Button, Skeleton } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import * as echarts from 'echarts';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

type TimeType = 0 | 7 | 30 | 90;

const WaybillTrendStatistics = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [timeType, setTimeType] = useState<TimeType>(7);
  const [startTime, setStartTime] = useState<any>(
    dayjs().subtract(6, 'day').startOf('day'),
  );
  const [endTime, setEndTime] = useState<any>(dayjs().endOf('day'));
  const [detail, setDetail] = useState<IWaybillTrendStatistics>(
    {} as IWaybillTrendStatistics,
  );
  const waybillRef = useRef<HTMLDivElement>(null); // waybill Dom实例
  const waybillChartRef = useRef<echarts.ECharts | null>(null); // waybill chart图表实例
  const size = useSize(waybillRef);

  const init = async () => {
    setLoading(true);
    const res = await getWaybillTrendStatistics({
      startDate: dayjs(startTime).format('YYYY-MM-DD'),
      endDate: dayjs(endTime).format('YYYY-MM-DD'),
    });
    setLoading(false);
    if (res.code === 200) {
      setDetail(res.data);
    }
  };

  useEffect(() => {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
      },
      legend: {
        icon: 'rect',
        bottom: 16,
        itemGap: 88,
        itemWidth: 10,
        itemHeight: 8,
        data: ['Delivered waybills', 'Canceled Waybills', 'Abnormal Waybills'],
      },
      grid: {
        top: '8%',
        left: '5%',
        right: '2%',
        bottom: '10%',
        containLabel: true,
      },
      // color: ['#FFE7BA', '#B5F5EC', '#BAE7FF'],
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            interval:
              detail.timeArr?.length >= 360
                ? 6
                : detail.timeArr?.length >= 300
                  ? 5
                  : detail.timeArr?.length >= 240
                    ? 4
                    : detail.timeArr?.length >= 180
                      ? 3
                      : detail.timeArr?.length >= 120
                        ? 2
                        : detail.timeArr?.length >= 60
                          ? 1
                          : 0,
            rotate: 40,
          },
          data: detail?.timeArr ? detail.timeArr : [],
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: 'Delivered waybills',
          type: 'line',
          stack: 'Total',
          areaStyle: {
            color: '#BAE7FF',
          },
          lineStyle: {
            color: '#009688',
          },
          itemStyle: {
            color: '#009688',
          },
          emphasis: {
            focus: 'series',
          },
          data: detail?.deliveredWaybills ? detail.deliveredWaybills : [],
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
  }, [startTime, endTime]);

  const timeChange = useCallback(
    (val: any, type?: 'start' | 'end') => {
      if (!val) return;
      let diffInDays;
      if (type === 'start') {
        diffInDays = dayjs(endTime).diff(dayjs(val), 'month');
      } else {
        diffInDays = dayjs(val).diff(dayjs(startTime), 'month');
      }
      if (diffInDays > 12) {
        return message.error(
          'The statistical time range must not be greater than 12 months',
        );
      }
      if (type === 'start') {
        setStartTime(dayjs(val).startOf('day'));
        setTimeType(0);
      } else {
        setEndTime(dayjs(val).endOf('day'));
        setTimeType(0);
      }
    },
    [startTime, endTime],
  );

  return (
    <div className={styles.waybill}>
      <div className={styles.waybill_header}>
        <div className={styles.waybill_title}>
          Waybill Trend Statistics
          {/* <CustomPopover
            content={
              'The number of waybills and income and spending during the statistical period'
            }
            placement="top"
          >
            <QuestionCircleOutlined
              style={{ color: '#838CA1', marginLeft: 8 }}
            />
          </CustomPopover> */}
        </div>
        <div className={styles.waybill_tool}>
          <Button
            type={timeType === 7 ? 'primary' : 'default'}
            onClick={() => {
              setTimeType(7);
              setStartTime(dayjs().subtract(6, 'day').startOf('day'));
              setEndTime(dayjs().endOf('day'));
            }}
          >
            7DAYS
          </Button>
          <Button
            type={timeType === 30 ? 'primary' : 'default'}
            onClick={() => {
              setTimeType(30);
              setStartTime(dayjs().subtract(29, 'day').startOf('day'));
              setEndTime(dayjs().endOf('day'));
            }}
          >
            30DAYS
          </Button>
          <Button
            type={timeType === 90 ? 'primary' : 'default'}
            onClick={() => {
              setTimeType(90);
              setStartTime(dayjs().subtract(89, 'day').startOf('day'));
              setEndTime(dayjs().endOf('day'));
            }}
          >
            90DAYS
          </Button>
          <div className={styles.waybill_tool_line}></div>
          <div className={styles.waybill_tool_time}>
            <ProFormDatePicker
              fieldProps={{
                value: startTime,
                onChange: (val: Dayjs | null) => {
                  timeChange(val, 'start');
                },
                disabledDate: (current: Dayjs) => {
                  return current > dayjs(endTime).startOf('day');
                },
              }}
              style={{ width: '180px' }}
            />
            <span style={{ marginTop: 7 }}>-</span>
            <ProFormDatePicker
              fieldProps={{
                value: endTime,
                onChange: (val: Dayjs | null) => {
                  timeChange(val, 'end');
                },
                disabledDate: (current: Dayjs) => {
                  return (
                    current > dayjs().endOf('day') ||
                    current < dayjs(startTime).startOf('day')
                  );
                },
              }}
              style={{ width: '180px' }}
            />
          </div>
        </div>
      </div>
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
          style={{ height: '480px', padding: '24px 24px' }}
          active
        />
      ) : (
        <div ref={waybillRef} style={{ width: '100%', height: '480px' }} />
      )}
    </div>
  );
};

export default WaybillTrendStatistics;
