import { crewDetail } from '@/api/crew';
import { ICrewDetail } from '@/api/types/crew';
import { CardCase, HistoryBackCase } from '@/components/DetailCase';
import InfoItem from '@/components/DetailCase/InfoListCase/InfoItem';
import {
  CrewStatusEnum,
  CrewStatusEnumColor,
  CrewStatusEnumText,
  EnumAccredCrewType,
  EnumAccredType,
  EnumTransportationStatusColor,
  EnumTransportationStatusText,
} from '@/enums';
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
  const [detail, setDetail] = useState<ICrewDetail>();
  const [crewType, setCrewType] = useState<string>();
  const [applicationModalOpen, setApplicationModalOpen] =
    useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    const res = await crewDetail({
      id: Number(id),
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDetail(res.data);
      const crewTypeList = [
        res.data.driverFlag ? 'Driver' : null,
        res.data.helperFlag ? 'Helper' : null,
      ];
      setCrewType(crewTypeList.filter(Boolean).join(','));
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

  const isAccredited = detail?.status === CrewStatusEnum.ACCREDITED;
  const isReaccredit =
    detail?.status === CrewStatusEnum.UNACCREDITED ||
    detail?.status === CrewStatusEnum.INACTIVE;

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
          <CardCase title={'Crew Name'}>
            <div className="application-no">{detail?.name}</div>
            <Space size={24} wrap>
              <Space size={24} wrap>
                <InfoItem
                  label="Accreditation Status"
                  value={
                    detail?.status ? (
                      <Badge
                        color={CrewStatusEnumColor[detail.status]}
                        text={CrewStatusEnumText[detail.status]}
                      />
                    ) : null
                  }
                />
                <InfoItem
                  label="Transportation Status"
                  value={
                    detail?.transportationStatus ? (
                      <Badge
                        color={
                          EnumTransportationStatusColor[
                            detail.transportationStatus
                          ]
                        }
                        text={
                          EnumTransportationStatusText[
                            detail.transportationStatus
                          ]
                        }
                      />
                    ) : null
                  }
                />
                <InfoItem label="Type" value={crewType} />
                <InfoItem label="ID Number" value={detail?.idNumber} />
                <InfoItem label="License No." value={detail?.licenseNumber} />
                {detail?.phoneNum ? (
                  <InfoItem
                    label="Contact"
                    value={`${detail?.phoneCode} ${detail.phoneNum}`}
                  />
                ) : null}
                {detail?.status === CrewStatusEnum.BLOCKED ? (
                  <InfoItem label="Block Reason" value={detail?.blockReason} />
                ) : null}
                <InfoItem label="Updated Time" value={detail?.updatedAt} />
              </Space>
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
          type={EnumAccredType.CREW}
          crewParams={{
            idNumber: detail?.idNumber,
            crewType: EnumAccredCrewType.MODIFY,
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
