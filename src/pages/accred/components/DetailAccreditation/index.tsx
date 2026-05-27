import { getImageSource } from '@/api/common';
import {
  IAccreditationCategoryItem,
  IAccreditationMaterialItem,
} from '@/api/types/accred';
import { IImageState, ISourceImage } from '@/api/types/common';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMAGE_TYPE, initialImageState } from '@/constants';
import { useSetState } from 'ahooks';
import { List } from 'antd';
import { memo, useCallback, useEffect } from 'react';
import ListItem from './ListItem';
import styles from './styles.less';

export default memo(function DetailAccreditation(props: {
  list: IAccreditationCategoryItem[];
  isDraft: boolean;
  reload?: () => void;
}) {
  const { list, isDraft, reload } = props;

  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const initPreview = useCallback(async () => {
    const materialList: any[] = [];
    const allSettled: Array<Promise<any>> = [];

    list?.forEach((item) => {
      item.accreditationMaterialList?.forEach(
        (material: IAccreditationMaterialItem) => {
          if (IMAGE_TYPE.includes(material.fileType)) {
            materialList.push(material);
          }
        },
      );
    });

    setImageState({
      pending: true,
    });
    materialList.forEach((material) => {
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
  }, [list]);

  useEffect(() => {
    initPreview();
  }, [list]);

  return (
    <>
      <div className={styles.accreditation}>
        <List
          size="large"
          split={false}
          dataSource={list}
          renderItem={(item: IAccreditationCategoryItem) => (
            <List.Item
              key={item.categoryAccreditationId}
              style={{ padding: 0 }}
            >
              <ListItem
                record={item}
                isDraft={isDraft}
                imageState={imageState}
                setImageState={setImageState}
                reload={() => reload?.()}
              />
            </List.Item>
          )}
        />
      </div>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
});
