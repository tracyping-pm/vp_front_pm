import { Col, Row } from 'antd';
import { Gutter } from 'antd/es/grid/row';
import { FC, ReactNode } from 'react';
import InfoItem from './InfoItem';
import styles from './index.less';

interface IInfoItem {
  label: string;
  value: string | number | ReactNode;
  hasDivider?: boolean;
  labelColor?: string;
  valueColor?: string;
}

export interface IContentCase {
  infoList: IInfoItem[];
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
  gutter?: [Gutter, Gutter];
  span?: number;
  flex?: any;
}

const InfoListCase: FC<IContentCase> = ({
  infoList = [],
  justify = 'space-between',
  gutter = [24, 16], // [水平间距, 垂直间距]
  span = 4,
  flex,
}) => {
  return (
    <>
      <section className={styles.infoList}>
        <Row gutter={gutter} justify={justify}>
          {infoList.map((item, index) => (
            <Col key={index} span={span} flex={flex}>
              <InfoItem
                label={item.label}
                value={item.value}
                hasDivider={item.hasDivider}
                labelColor={item.labelColor}
                valueColor={item.valueColor}
              />
            </Col>
          ))}
        </Row>
      </section>
    </>
  );
};

export default InfoListCase;
