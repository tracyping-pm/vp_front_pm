import '@/animation.less';
import { ILatesExportRecord } from '@/api/types/waybill';
import { DownloadExport, LatestExportRecord } from '@/api/waybill';
import { DownLoadStatusEnum } from '@/enums';
import { CloseSquareOutlined } from '@ant-design/icons';
import { List, Spin, message } from 'antd';
import cls from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { ReactComponent as CsvIcon } from '../../../public/svg/csv.svg';
import { ReactComponent as DownLoadIcon } from '../../../public/svg/downLoad.svg';
import { ReactComponent as DownLoadLoading } from '../../../public/svg/downLoadLoading.svg';
import CustomPopover from '../CustomPopover';
import styles from './index.less';
const ExportCase = () => {
  const [isBouncing, setIsBouncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const time = useRef<NodeJS.Timeout>();
  const [dataSource, setDataSource] = useState<ILatesExportRecord[]>([]);
  const startBouncing = () => {
    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 500);
  };

  useEffect(() => {
    startBouncing();
  }, []);

  const getDataSource = async () => {
    const handle = async () => {
      setLoading(true);
      const res = await LatestExportRecord();
      setLoading(false);
      if (res.code === 200) {
        setDataSource(res?.data);
        if (
          res?.data?.every(
            (i: ILatesExportRecord) =>
              i.status === DownLoadStatusEnum.COMPLETED,
          ) ||
          res?.data?.some(
            (i: ILatesExportRecord) =>
              i.status === DownLoadStatusEnum.EXCEPTION,
          )
        ) {
          clearTimeout(time.current);
          return;
        }
      }
      time.current = setTimeout(handle, 5 * 1000);
    };

    handle();
  };

  const onDownLoadData = async (record: ILatesExportRecord) => {
    const { id, spreadsheetId, fileName } = record;
    const res = await DownloadExport({ id, spreadsheetId });
    if (res.code === 200) {
      const link = document.createElement('a');
      link.href = res.data;
      link.download = `${fileName}`;

      link.click();
      URL.revokeObjectURL(link.href);
    }
  };
  const onOpenChange = (open: boolean) => {
    if (open) {
      getDataSource();
    } else {
      clearTimeout(time.current);
    }
  };

  const downLoadContent = () => {
    return (
      <Spin spinning={loading}>
        <div className={styles.dowmLoadList}>
          <List
            dataSource={dataSource}
            renderItem={(i: ILatesExportRecord) => (
              <div className={styles.dowmLoadItem} key={i.id}>
                <div className={styles.dowmLoadName}>
                  <CsvIcon /> <span>{i.fileName ?? 'Generating'}</span>
                </div>
                {i.status === DownLoadStatusEnum.COMPLETED && (
                  <DownLoadIcon
                    className={styles.dowmLoadIcon}
                    onClick={() => {
                      onDownLoadData(i);
                    }}
                  ></DownLoadIcon>
                )}
                {i.status === DownLoadStatusEnum.EXPORTING && (
                  <DownLoadLoading
                    className={styles.rotateIcon}
                  ></DownLoadLoading>
                )}
                {i.status === DownLoadStatusEnum.EXCEPTION && (
                  <CloseSquareOutlined
                    style={{ fontSize: 18 }}
                    onClick={() => {
                      message.error('File generation failed!');
                    }}
                  />
                )}
              </div>
            )}
          />
        </div>
      </Spin>
    );
  };
  return (
    <>
      <CustomPopover
        styles={{ body: { padding: 0 } }}
        placement="bottom"
        content={downLoadContent}
        trigger={'click'}
        onOpenChange={onOpenChange}
      >
        <div
          className={cls(
            styles.exportCase,
            'exportCase',
            isBouncing && 'bounce',
          )}
        >
          <DownLoadIcon style={{ fontSize: '20px' }} />
        </div>
      </CustomPopover>
    </>
  );
};

export default ExportCase;
