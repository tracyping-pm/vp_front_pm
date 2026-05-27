import { getImageSource } from '@/api/common';
import { ICommonMaterial } from '@/api/types/common';
import { IPodItem } from '@/api/types/waybill';
import { waybillDeletePod, waybillListPod } from '@/api/waybill';
import CommonFileItem from '@/components/CommonFileItem';
import NormalUpload from '@/components/CustomUpload/NormalUpload';
import CardCase from '@/components/DetailCase/CardCase';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { BELONG_IMG_EXTS, IMAGE_TYPE } from '@/constants';
import { WaybillStatusEnum } from '@/enums';
import { useModel, useSearchParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Empty, Space } from 'antd';
import _ from 'lodash';
import { useCallback, useEffect } from 'react';
import PodListItemPreview from './PodListItemPreview';
import styles from './common.less';

const BELONG_IMGLIST = BELONG_IMG_EXTS.map((item) => item.split('.')[1]);
const url = `/api/vendor-portal/waybill/editPod`;

interface ISourceImage {
  material: ICommonMaterial;
  src: string;
}

interface IImageState {
  pending: boolean;
  visible: boolean;
  index: number;
  sourceImages: ISourceImage[];
}

const initialImageState: IImageState = {
  pending: false,
  visible: false,
  index: 0,
  sourceImages: [],
};

interface IModeState {
  loading?: boolean;
  materialVoList: ICommonMaterial[];
  list: IPodItem[];
}

const initialModeState: IModeState = {
  loading: false,
  materialVoList: [],
  list: [],
};

const ModulePod = () => {
  const { message } = App.useApp();
  const { state } = useModel('waybill.detail');
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [modeState, setModeState] = useSetState<IModeState>(initialModeState);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const dto = {
    waybillId: Number(id),
  };

  const getPODList = async () => {
    setModeState({ loading: true });
    const res = await waybillListPod({ id: Number(id) }).finally(() => {
      setModeState({ loading: false });
    });
    if (res.code === 200) {
      // 过滤出POD 的 podType = "Vendor Update" 的数据
      const predicate = (podItem: IPodItem) =>
        podItem.generateType === 'auto' && podItem.podType === 'Vendor Update';
      const vendorUpdateItem =
        _.find(res.data?.podList, predicate) ?? ({} as IPodItem);

      if (vendorUpdateItem?.materialVoList?.length > 0) {
        setModeState({
          materialVoList: vendorUpdateItem.materialVoList,
          list: [vendorUpdateItem],
        });
      } else {
        setModeState({ materialVoList: [] });
      }
    }
  };

  const onDeleteFile = async (item: ICommonMaterial) => {
    setModeState({ loading: true });
    const res = await waybillDeletePod({
      waybillId: Number(id),
      deletedFileMaterialIdList: [item.fileMaterialId],
    }).finally(() => {
      setModeState({ loading: true });
    });

    if (res.code === 200) {
      message.success('Delete success!');
      getPODList();
    }
  };

  const initPreview = useCallback(async () => {
    const allMaterialList: ICommonMaterial[] = [];
    const allSettled: Array<Promise<any>> = [];

    modeState.materialVoList?.forEach((material) => {
      if (IMAGE_TYPE.includes(material.fileType)) {
        allMaterialList.push(material);
      }
    });

    setImageState({
      pending: true,
    });
    allMaterialList.forEach((material) => {
      allSettled.push(getImageSource(material));
    });

    Promise.allSettled(allSettled)
      .then((values) => {
        const sourceImages: ISourceImage[] = [];
        values?.forEach((value) => {
          if (value.status === 'fulfilled') {
            sourceImages.push(value.value);
          }
        });

        setImageState({
          sourceImages,
        });
      })
      .finally(() => {
        setImageState({
          pending: false,
        });
      });
  }, [modeState.materialVoList]);

  const onCustomPreview = useCallback(
    (material: ICommonMaterial) => {
      const index = _.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileMaterialId === material.fileMaterialId,
      );
      setImageState({
        index,
        visible: true,
      });
    },
    [imageState],
  );

  useEffect(() => {
    getPODList();
  }, []);

  useEffect(() => {
    initPreview();
  }, [modeState.materialVoList]);

  return (
    <CardCase title={'POD'} spinning={modeState.loading || imageState.pending}>
      {state.basicInfo.status !== WaybillStatusEnum.IN_TRANSIT &&
      modeState.materialVoList?.length === 0 ? (
        <div className={styles.empty}>
          <Empty description="no data" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : state.basicInfo.status !== WaybillStatusEnum.IN_TRANSIT &&
        modeState.materialVoList?.length > 12 ? (
        <Space size={24} direction="vertical" align="start" wrap>
          {modeState?.list?.map((item) => (
            <PodListItemPreview
              key={item.waybillPodId}
              item={item}
              onCustomPreview={onCustomPreview}
            />
          ))}
        </Space>
      ) : (
        <div className={styles.pod}>
          {modeState.materialVoList?.map((item) => {
            const isBelongImg = BELONG_IMGLIST.includes(item.fileType);

            return (
              <CommonFileItem
                key={item.fileMaterialId}
                materialId={item.fileMaterialId}
                driveFileId={item.fileDriveId}
                fileMimeType={item.fileMimeType}
                thumbnail={item.fileThumbnailUrl}
                fileType={item.fileType}
                fileName={item.fileName}
                showPreview={isBelongImg}
                showDelete={
                  state.basicInfo.status === WaybillStatusEnum.IN_TRANSIT
                }
                onDeleteTrigger={() => onDeleteFile(item)}
                onCustomPreview={() => onCustomPreview(item)}
              />
            );
          })}

          {state.basicInfo.status === WaybillStatusEnum.IN_TRANSIT && (
            <div className={styles.pod_file}>
              <NormalUpload
                name="newFiles"
                url={url}
                dto={dto}
                onFulfilled={() => getPODList()}
              />
              <div className={styles.pod_file_text}>
                A single file cannot exceed 50 MB
              </div>
            </div>
          )}
        </div>
      )}

      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </CardCase>
  );
};

export default ModulePod;
