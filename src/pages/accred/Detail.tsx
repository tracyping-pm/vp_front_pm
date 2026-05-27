import {
  accredCrewDetail,
  accredDelete,
  accredSubmitDraft,
  accredTruckDetail,
  accredVendorDetail,
  accredWithDraw,
} from '@/api/accred';
import {
  IAccredCrewDetail,
  IAccredTruckDetail,
  IAccredVendorDetail,
} from '@/api/types/accred';
import { useKeepAliveTabs } from '@/components/BreadcrumbTags/useKeepAliveTabs';
import { CardCase, HistoryBackCase } from '@/components/DetailCase';
import InfoItem from '@/components/DetailCase/InfoListCase/InfoItem';
import { PATHS } from '@/constants';
import {
  EnumAccredType,
  EnumVendorAccredStatus,
  EnumVendorAccredStatusTextColor,
  VendorTruckVanTypeEnumText,
} from '@/enums';
import { formatAmount } from '@/utils/utils';
import { history, useModel, useSearchParams } from '@umijs/max';
import { App, Badge, Button, Popconfirm, Space, Spin } from 'antd';
import cls from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import DetailAccreditation from './components/DetailAccreditation';
import EditBasicInfoModal from './components/EditBasicInfoModal';
import styles from './style.less';

export type IDetail =
  | IAccredVendorDetail
  | IAccredTruckDetail
  | IAccredCrewDetail;

export const isVendorDetail = (
  detail?: IDetail,
): detail is IAccredVendorDetail => {
  return detail?.type === EnumAccredType.VENDOR;
};

export const isTruckDetail = (
  detail?: IDetail,
): detail is IAccredTruckDetail => {
  return detail?.type === EnumAccredType.TRUCK;
};

export const isCrewDetail = (detail?: IDetail): detail is IAccredCrewDetail => {
  return detail?.type === EnumAccredType.CREW;
};

const Detail: React.FC = () => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};
  const name = currentUser?.name;
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const [submitDrafting, setSubmitDrafting] = useState(false);
  const [withDrawing, setWithDrawing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detail, setDetail] = useState<IDetail>();
  const [serviceableArea, setServiceableArea] = useState<string>();
  const [crewType, setCrewType] = useState<string>();
  const [editBasicInfoModalOpen, setEditBasicInfoModalOpen] = useState(false);
  const { closeTabByNode } = useKeepAliveTabs();

  const fetchDetail = useCallback(async () => {
    let detailApi = null;
    switch (type) {
      case EnumAccredType.VENDOR:
        detailApi = accredVendorDetail;
        break;
      case EnumAccredType.TRUCK:
        detailApi = accredTruckDetail;
        break;

      case EnumAccredType.CREW:
        detailApi = accredCrewDetail;
        break;
      default:
        break;
    }
    if (!detailApi) {
      return;
    }
    setLoading(true);
    const res = await detailApi({
      id: Number(id),
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDetail(res.data);

      if (isVendorDetail(res.data)) {
        const vendorAreaList = [
          res.data.countryName,
          res.data.padName,
          res.data.sadName,
          res.data.tadName,
        ];
        setServiceableArea(vendorAreaList.filter(Boolean).join(','));
      }

      if (isCrewDetail(res.data)) {
        const crewTypeList = [
          res.data.driverFlag ? 'Driver' : null,
          res.data.helperFlag ? 'Helper' : null,
        ];
        setCrewType(crewTypeList.filter(Boolean).join(','));
      }
    }
  }, [type, id]);

  const reload = () => {
    fetchDetail();
  };

  const onSubmitDraft = async () => {
    setSubmitDrafting(true);
    const res = await accredSubmitDraft({ id: Number(id) }).finally(() => {
      setSubmitDrafting(false);
    });
    if (res.code === 200) {
      message.success('Submit Draft Successfully!');
      reload();
    }
  };

  const onWithdraw = async () => {
    setWithDrawing(true);
    const res = await accredWithDraw({ id: Number(id) }).finally(() => {
      setWithDrawing(false);
    });
    if (res.code === 200) {
      message.success('Withdraw Successfully!');
      reload();
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    const res = await accredDelete({ id: Number(id) }).finally(() => {
      setDeleting(false);
    });
    if (res.code === 200) {
      message.success('Delete Successfully!');
      closeTabByNode(location.pathname + location.search);
      history.push(PATHS.ACCRED_APPLICATION);
    }
  };

  const onBasicInfoEdit = () => {
    setEditBasicInfoModalOpen(true);
  };

  useEffect(() => {
    if (type && id) {
      fetchDetail();
    } else {
      console.error('no type or id');
    }
  }, [type, id]);

  const isDraft = detail?.status === EnumVendorAccredStatus.DRAFT;
  const isUnderReview = detail?.status === EnumVendorAccredStatus.UNDER_REVIEW;

  return (
    <>
      <Spin spinning={loading} tip="Loading Detail...">
        <div className={cls('accred-detail', styles.accredDetail)}>
          <HistoryBackCase>
            <Space align="center" size={12}>
              {isDraft && (
                <>
                  <Popconfirm
                    title={`Submit`}
                    description={`Submit the Application for review?`}
                    onConfirm={() => onSubmitDraft()}
                    placement="leftTop"
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary" loading={submitDrafting}>
                      Submit
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title={`Delete`}
                    description={`Delete this Application?`}
                    onConfirm={() => onDelete()}
                    placement="leftTop"
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger loading={deleting}>
                      Delete
                    </Button>
                  </Popconfirm>
                </>
              )}
              {isUnderReview && (
                <>
                  <Popconfirm
                    title={`Withdraw`}
                    description={`Revert the Application to draft?`}
                    onConfirm={() => onWithdraw()}
                    placement="leftTop"
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button loading={withDrawing}>Withdraw</Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          </HistoryBackCase>
          <CardCase title={'Application No.'}>
            <div className="application-no">{detail?.number}</div>
            <Space size={24}>
              <InfoItem
                label="Status"
                value={
                  detail?.status ? (
                    <Badge
                      color={EnumVendorAccredStatusTextColor[detail?.status]}
                      text={detail?.status}
                    />
                  ) : null
                }
              />
              <InfoItem label="Type" value={detail?.type} />
              <InfoItem label="Object" value={detail?.objectName} />
              <InfoItem label="Updated Time" value={detail?.updatedAt} />
              {detail?.status === EnumVendorAccredStatus.REJECTED ? (
                <InfoItem
                  label="Reason for rejection"
                  value={detail?.rejectReason}
                />
              ) : null}
            </Space>
          </CardCase>
          <CardCase
            title={'Basic Info.'}
            extra={
              isDraft && (
                <Button
                  color="primary"
                  variant="link"
                  style={{ padding: 0 }}
                  onClick={() => onBasicInfoEdit()}
                >
                  Edit
                </Button>
              )
            }
          >
            {isVendorDetail(detail) && (
              <Space size={24} wrap>
                <InfoItem label="Name" value={name} />
                <InfoItem label="Serviceable Area" value={serviceableArea} />
              </Space>
            )}
            {isTruckDetail(detail) && (
              <Space size={24} wrap>
                <InfoItem label="Plate No." value={detail?.plateNumber} />
                <InfoItem label="Ownership" value={detail?.ownership} />
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
              </Space>
            )}
            {isCrewDetail(detail) && (
              <Space size={24} wrap>
                <InfoItem label="Crew Name" value={detail?.name} />
                <InfoItem label="Type" value={crewType} />
                <InfoItem label="ID Number" value={detail?.idNumber} />
                <InfoItem label="License No." value={detail?.licenseNumber} />
                {detail?.phoneNum ? (
                  <InfoItem
                    label="Contact"
                    value={`${detail?.phoneCode} ${detail.phoneNum}`}
                  />
                ) : null}
                <InfoItem label="Vendor" value={name} />
              </Space>
            )}
          </CardCase>
          <CardCase title={'Accreditation.'}>
            <DetailAccreditation
              list={detail?.accreditationCategoryList ?? []}
              isDraft={isDraft}
              reload={() => reload()}
            />
          </CardCase>
        </div>
      </Spin>
      <EditBasicInfoModal
        open={editBasicInfoModalOpen}
        detail={detail}
        onCancel={() => setEditBasicInfoModalOpen(false)}
        onFinish={() => {
          message.success('Edit Successfully!');
          setEditBasicInfoModalOpen(false);
          reload();
        }}
      />
    </>
  );
};

export default Detail;
