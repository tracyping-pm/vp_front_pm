import {
  IAddress,
  IListShippingRecordResp,
  IShippingRecordVoListItem,
} from '@/api/types/waybill';
import { waybillListShippingRecord, waybillRoute } from '@/api/waybill';
import { CardCase } from '@/components/DetailCase';
import { WaybillStatusEnum } from '@/enums';
import { getPathByRoute, getSortRoutes, unzip } from '@/utils/map';
import { useModel } from '@umijs/max';
import { Col, Collapse, Row, Spin } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect } from 'react';
import { ReactComponent as IconDestination } from '../static/destination.svg';
import { ReactComponent as IconOrigin } from '../static/origin.svg';
import { ReactComponent as IconStopPoint } from '../static/stop_point_icon.svg';
import ShippingRecordMap from './ShippingRecordMap';

import { useSetState } from 'ahooks';
import styles from './common.less';

interface IMapState {
  visible: boolean;
  loading: boolean;
  shippingRecordData: IListShippingRecordResp;
  googleMapPoints: google.maps.LatLngLiteral[];
  originList: Array<google.maps.LatLngLiteral & { address: string }>;
  destinationList: Array<google.maps.LatLngLiteral & { address: string }>;
  actualPoints: IShippingRecordVoListItem[];
}

interface IRouteListState {
  loading: boolean;
  origins: IAddress[];
  destinations: IAddress[];
}

const ModuleRoute: FC = () => {
  const { state } = useModel('waybill.detail');
  const { basicInfo } = state;

  const [mapState, setMapState] = useSetState<IMapState>({
    visible: false,
    loading: false,
    // @ts-ignore
    shippingRecordData: {},
    googleMapPoints: [],
    originList: [],
    destinationList: [],
    actualPoints: [],
  });

  const [routeListState, setRouteListState] = useSetState<IRouteListState>({
    loading: false,
    origins: [],
    destinations: [],
  });

  const getPointsByRecord = (list: IShippingRecordVoListItem[] = []) => {
    return list?.reverse();
  };

  const getPointsBySelect = (mapJsonStr: string) => {
    try {
      const mapJson: any = unzip(mapJsonStr);
      const { routes, activeRouteIndex, originList, destinationList } = mapJson;
      console.log({ routes, activeRouteIndex, originList, destinationList });
      setMapState({ originList, destinationList });

      const _routeList = getSortRoutes(routes);
      const activeRoute = _routeList[activeRouteIndex];
      const pathList = getPathByRoute(activeRoute);
      return pathList;
    } catch (e) {
      return [];
    }
  };

  const formatMapData = (data: IListShippingRecordResp) => {
    const actualPoints = getPointsByRecord(data?.shippingRecordVoList ?? []);
    setMapState({ actualPoints });

    const googleMapPoints = getPointsBySelect(data?.mapJsonStr);
    setMapState({ googleMapPoints });
  };

  const fetchShippingRecordList = useCallback(async () => {
    setMapState({ loading: true });
    const { id, plateNumber, hasGps } = basicInfo;
    const res = await waybillListShippingRecord({
      waybillId: Number(id),
      plateNumber: plateNumber, // IOE691,
      hasGps: hasGps,
    });
    setMapState({ loading: false });
    if (res.code === 200) {
      setMapState({ shippingRecordData: res.data });
      formatMapData(res.data);
    }
  }, [basicInfo]);

  const fechWaybillRoute = useCallback(async () => {
    const { id } = basicInfo;
    setRouteListState({ loading: true });
    const res = await waybillRoute({
      id: Number(id),
    });
    setRouteListState({ loading: false });
    if (res.code === 200) {
      const { origins, destinations } = res.data;
      setRouteListState({
        origins: origins ?? [],
        destinations: destinations ?? [],
      });
    }
  }, [basicInfo]);

  useEffect(() => {
    const { status, preStatus } = basicInfo;
    if (!status) {
      return;
    }

    const hideMapStatusList = [
      WaybillStatusEnum.PLANNING,
      WaybillStatusEnum.PENDING,
    ];
    const isHideMap =
      hideMapStatusList.includes(status) ||
      (status === WaybillStatusEnum.CANCELED &&
        preStatus === WaybillStatusEnum.PENDING);

    if (isHideMap) {
      setMapState({ visible: false });
    } else {
      setMapState({ visible: true });
      fetchShippingRecordList();
    }
  }, [basicInfo]);

  useEffect(() => {
    if (basicInfo.id) {
      fechWaybillRoute();
    }
  }, [basicInfo]);

  return (
    <>
      <CardCase>
        <div className={cls(styles.moduleRoute, 'moduleRoute')}>
          {mapState.visible && (
            <div className="mapCase">
              <Collapse
                items={[
                  {
                    key: 'shippingRecordMap',
                    label: 'Tracks Map',
                    children: (
                      <ShippingRecordMap
                        loading={mapState.loading}
                        hasError={!!mapState.shippingRecordData?.callFmsFailed}
                        actualPoints={mapState.actualPoints}
                        googleMapPoints={mapState.googleMapPoints}
                        originList={mapState.originList}
                        destinationList={mapState.destinationList}
                      />
                    ),
                  },
                ]}
              />
            </div>
          )}
          <Spin spinning={routeListState.loading}>
            <div className="routeList">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="routeTitle">Origin</div>
                  <div className="contentList">
                    {routeListState.origins?.map((item) => {
                      const { padName, sadName, tadName, address } = item;
                      const region = [padName, sadName, tadName]
                        .filter(Boolean)
                        .join(' , ');

                      return (
                        <div className="contentItem" key={item.id}>
                          <div className="icon">
                            {item.isStop ? <IconStopPoint /> : <IconOrigin />}
                          </div>
                          <div className="contentItemText">
                            <div className="region">{region}</div>
                            <div className="address">{address}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="routeTitle">Destination</div>
                  <div className="contentList">
                    {routeListState.destinations?.map((item) => {
                      const { padName, sadName, tadName, address } = item;
                      const region = [padName, sadName, tadName]
                        .filter(Boolean)
                        .join(' , ');

                      return (
                        <div className="contentItem" key={item.id}>
                          <div className="icon">
                            {item.isStop ? (
                              <IconStopPoint />
                            ) : (
                              <IconDestination />
                            )}
                          </div>
                          <div className="contentItemText">
                            <div className="region">{region}</div>
                            <div className="address">{address}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            </div>
          </Spin>
        </div>
      </CardCase>
    </>
  );
};

export default ModuleRoute;
