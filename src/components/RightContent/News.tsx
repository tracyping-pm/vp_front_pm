import { msgList, msgRead, msgReadAll, msgUnreadCount } from '@/api/news';
import { INewsListRecord, INewsRes } from '@/api/types/news';
import { EnumNewsType } from '@/enums';
import { useScrollPenetration } from '@/hooks/useScrollPenetration';
import { BellOutlined } from '@ant-design/icons';
import { Badge, List, Skeleton, Spin, Tabs, TabsProps } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomPopover from '../CustomPopover';
import styles from './index.less';

const News: React.FC = () => {
  const { disableScroll, enableScroll } = useScrollPenetration();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<INewsListRecord[]>([]);
  const [allDataSource, setAllDataSource] = useState<INewsRes>({} as INewsRes);
  const [unReadNumber, setUnReadNumber] = useState<number>(0);
  const [listItemsContainerRef, setListItemsContainerRef] = useState();
  const [currentTabKey, setCurrentTabKey] = useState<EnumNewsType>(
    EnumNewsType.Application,
  );
  const currentTabKeyRef = useRef<EnumNewsType>(EnumNewsType.Application);

  const getUnReadNumber = useCallback(async () => {
    const res = await msgUnreadCount();
    if (res.code === 200) {
      setUnReadNumber(res?.data?.unreadCount ?? 0);
    }
  }, []);

  const onReadMessage = async (values: INewsListRecord) => {
    const { id, hasRead } = values;
    if (hasRead) {
      return;
    }
    const payload = {
      id,
    };
    const res = await msgRead(payload);
    if (res.code === 200) {
      getUnReadNumber();
      dataSource.forEach((item: INewsListRecord) => {
        if (item.id === id) {
          item.hasRead = true;
        }
        return { ...item };
      });
      setDataSource([...dataSource]);
    }
  };

  const onReadAll = async () => {
    const res = await msgReadAll();
    if (res.code === 200) {
      getUnReadNumber();
      dataSource.forEach((item: INewsListRecord) => {
        item.hasRead = true;
        return { ...item };
      });
      setDataSource([...dataSource]);
    }
  };

  const onToPage = (value: string) => {
    window.open(JSON.parse(value)?.linkUrl);
  };

  const reset = () => {
    setDataSource([]);
    // @ts-ignore
    setAllDataSource({});
  };

  const getInitDataSource = useCallback(async () => {
    const payload = {
      pageNum: 1,
      pageSize: 10,
      type: currentTabKeyRef.current,
    };
    setLoading(true);
    const res = await msgList(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDataSource([...res?.data?.list]);
      setAllDataSource(res?.data);
    }
  }, []);

  const getNextData = useCallback(async () => {
    if (
      typeof allDataSource.hasNextPage === 'boolean' &&
      !allDataSource.hasNextPage
    ) {
      return;
    }
    const payload = {
      pageNum: allDataSource.nextPage ?? 1,
      pageSize: 10,
      type: currentTabKey,
    };
    setLoading(true);
    const res = await msgList(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDataSource([...dataSource, ...res?.data?.list]);
      setAllDataSource(res?.data);
    }
  }, [allDataSource, dataSource, currentTabKey]);

  // 由于Popover的渲染机制问题，需要确保能够成功绑定InfiniteScroll的滚动容器的scrollableTarget，
  // 因此采用ref实时获取滚动容器，并确保在ref有值时绑定InfiniteScroll
  const onListItemsContainerRefChange = useCallback((node: any) => {
    if (node !== null) {
      setListItemsContainerRef(node);
    }
  }, []);

  const onOpenChange = (open: boolean) => {
    reset();
    if (open) {
      getInitDataSource();
      getUnReadNumber();
      disableScroll();
    } else {
      enableScroll();
      setCurrentTabKey(EnumNewsType.Application);
      currentTabKeyRef.current = EnumNewsType.Application;
    }
  };

  const onTabsChange = (key: string) => {
    reset();
    setCurrentTabKey(key as EnumNewsType);
    currentTabKeyRef.current = key as EnumNewsType;
    getInitDataSource();
  };

  useEffect(() => {
    getUnReadNumber();
  }, []);

  const NewsHeader = () => {
    return (
      <div className={styles.newsHeader}>
        <p>Notifications （{unReadNumber} Unread）</p>
        <p onClick={onReadAll} className={styles.newsHeader_allRead}>
          Mark all as read
        </p>
      </div>
    );
  };

  const items: TabsProps['items'] = [
    {
      key: EnumNewsType.Application,
      label: 'Application Notification',
      children: null,
    },
    {
      key: EnumNewsType.Expiration,
      label: 'Expiration Notification',
      children: null,
    },
  ];

  const NewsContent = () => {
    return (
      <Spin spinning={loading}>
        <div className={styles.newTabs}>
          <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={onTabsChange}
            activeKey={currentTabKey}
          />
        </div>
        <div className={styles.newsContent} ref={onListItemsContainerRefChange}>
          {listItemsContainerRef && (
            <InfiniteScroll
              dataLength={dataSource?.length}
              next={debounce(() => {
                getNextData();
              }, 200)}
              hasMore={dataSource?.length < allDataSource.total}
              loader={
                <Skeleton loading={loading} paragraph={{ rows: 1 }} active />
              }
              // endMessage={<Divider plain>It is all, nothing more </Divider>}
              scrollableTarget={listItemsContainerRef}
            >
              <List
                size="small"
                dataSource={dataSource}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => {
                      onReadMessage(item);
                    }}
                    key={item.id}
                    style={{ padding: '16px 0 16px 8px', cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      title={
                        <div className={styles.newsItemHeader}>
                          <p
                            className={`${styles.newsItemTitle} ${
                              item.hasRead ? styles.newsRead : ''
                            }`}
                            title={item.content}
                          >
                            {item.content}
                          </p>
                          {!item.hasRead && (
                            <span className={styles.readDot}></span>
                          )}
                        </div>
                      }
                      description={
                        item.customParam !== '{}' ? (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              onClick={() => {
                                onToPage(item.customParam);
                              }}
                              className={styles.newsItemDes}
                            >
                              View Details
                            </span>
                            <span>{item.createdAt}</span>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <span>{item.createdAt}</span>
                          </div>
                        )
                      }
                    />
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          )}
        </div>
      </Spin>
    );
  };

  return (
    <CustomPopover
      classNames={{ root: 'newsPopover' }}
      styles={{ body: { padding: 0 } }}
      placement="bottom"
      content={NewsContent}
      title={NewsHeader}
      trigger={'click'}
      onOpenChange={onOpenChange}
    >
      <div className={styles.news}>
        <Badge count={unReadNumber} offset={[7, 0]} overflowCount={9}>
          <BellOutlined className={styles.newsIcon} />
        </Badge>
      </div>
    </CustomPopover>
  );
};

export default News;
