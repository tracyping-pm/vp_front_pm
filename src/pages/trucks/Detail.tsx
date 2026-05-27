import { truckDetail } from '@/api/truck';
import { ITruckDetail } from '@/api/types/truck';
import { CardCase, HistoryBackCase } from '@/components/DetailCase';
import InfoItem from '@/components/DetailCase/InfoListCase/InfoItem';
import {
  EnumAccredType,
  VendorTruckStatusEnum,
  VendorTruckStatusEnumColor,
  VendorTruckStatusEnumText,
  VendorTruckVanTypeEnumText,
} from '@/enums';
import { formatAmount } from '@/utils/utils';
import { useParams } from '@umijs/max';
import { App, Badge, Button, Space, Spin } from 'antd';
import cls from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import AccreditationApplicationModal from '../accred/components/AccreditationApplicationModal';
import DetailAccreditation from '../accred/components/DetailAccreditation';
import styles from './style.less';

const Detail: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ITruckDetail>();
  const [applicationModalOpen, setApplicationModalOpen] =
    useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    const res = await truckDetail({
      id: Number(id),
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDetail(res.data);
    }
  }, [id]);

  const reload = () => {
    fetchDetail();
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    } else {
      console.error('no type or id');
    }
  }, [id]);

  const isAccredited = detail?.status === VendorTruckStatusEnum.ACCREDITED;
  const isReaccredit =
    detail?.status === VendorTruckStatusEnum.UNACCREDITED ||
    detail?.status === VendorTruckStatusEnum.INACTIVE;

  return (
    <>
      <Spin spinning={loading} tip="Loading Detail...">
        <div className={cls('accred-detail', styles.accredDetail)}>
          <HistoryBackCase>
            <Space align="center" size={12}>
              {isAccredited && (
                <Button
                  type="primary"
                  onClick={() => setApplicationModalOpen(true)}
                >
                  Add Edit Application
                </Button>
              )}
              {isReaccredit && (
                <Button
                  type="primary"
                  onClick={() => setApplicationModalOpen(true)}
                >
                  Reaccredit
                </Button>
              )}
            </Space>
          </HistoryBackCase>
          <CardCase title={'Plate No.'}>
            <div className="application-no">{detail?.plateNumber}</div>
            <Space size={24} wrap>
              <InfoItem
                label="Status"
                value={
                  detail?.status ? (
                    <Badge
                      color={VendorTruckStatusEnumColor[detail.status]}
                      text={VendorTruckStatusEnumText[detail.status]}
                    />
                  ) : null
                }
              />
              <InfoItem label="Truck Type" value={detail?.truckTypeName} />
              <InfoItem
                label="Van Type"
                value={
                  detail?.vanType
                    ? VendorTruckVanTypeEnumText[detail.vanType]
                    : null
                }
              />
              <InfoItem
                label="Registration No."
                value={detail?.registrationNumber}
              />
              <InfoItem
                label="Gross Capacity"
                value={
                  detail?.grossCapacity
                    ? formatAmount(detail.grossCapacity) + ' MT'
                    : null
                }
              />
              <InfoItem
                label="Net Capacity"
                value={
                  detail?.netCapacity
                    ? formatAmount(detail.netCapacity) + ' MT'
                    : null
                }
              />
              <InfoItem
                label="Volume"
                value={
                  detail?.volume ? formatAmount(detail.volume) + ' CBM' : null
                }
              />
              <InfoItem label="Model" value={detail?.model} />
              <InfoItem label="Coding Day" value={detail?.codingDay} />
              <InfoItem label="Ownership" value={detail?.ownership} />
              <InfoItem label="Updated Time" value={detail?.updatedAt} />
            </Space>
          </CardCase>
          <CardCase title={'Accreditation.'}>
            <DetailAccreditation
              isDraft={false}
              list={detail?.accreditationCategoryList ?? []}
              reload={() => reload()}
            />
          </CardCase>
        </div>
      </Spin>
      {applicationModalOpen && (
        <AccreditationApplicationModal
          type={EnumAccredType.TRUCK}
          truckParams={{
            plateNumber: detail?.plateNumber,
          }}
          open={applicationModalOpen}
          onCancel={() => setApplicationModalOpen(false)}
          onSubmit={() => {
            message.success('Add Accreditation Application Successfully!');
            setApplicationModalOpen(false);
            reload();
          }}
          onSaveDraft={() => {
            setApplicationModalOpen(false);
            reload();
          }}
        />
      )}
    </>
  );
};

export default Detail;
