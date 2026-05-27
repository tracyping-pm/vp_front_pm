import {
  IDestinationInTransitItem,
  IRouteInTransitItem,
} from '@/api/types/waybill';
import {
  getDestinationInTransit,
  getRouteInTransitDetail,
} from '@/api/waybill';
import {
  Overlay,
  dashSymbol,
  dashSymbolRepeat,
  defaultStrokeOpacity,
  fitPadding,
  polylineMainColor,
  useGoogleMap,
} from '@/hooks/useGoogleMap';
import { CacheQueue } from '@/utils/cacheQueue';
import {
  getDirectionsServiceParamsByPointList,
  getGoogleMapRoute,
  getMarkerSize,
  getPathByRoute,
  getSortRoutes,
  unzip,
} from '@/utils/map';
import { SplitMapPoints } from '@/utils/splitMapPoints';
import { useSetState } from 'ahooks';
import { App, Spin } from 'antd';
import _ from 'lodash';
import { FC, useCallback, useEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server';
import destinationUrl from '../../../../public/svg/map/destination.svg';
import originUrl from '../../../../public/svg/map/origin.svg';
import truckUrl from '../../../../public/svg/map/truck.svg';
import MarkerDetail from './MarkerDetail';
import MarkerDetailForOrigin from './MarkerDetailForOrigin';

const cacheQueue = new CacheQueue();
const destinationMarkersOverlay = new Overlay();
const activeWaybillOverlay = new Overlay();

const markerZIndex = 1;
const polylineZIndex = 1;
const destinationMarkerZIndex = 2;
const infoWindowZIndex = 3;
const activeZIndex = 4;

const destinationMarkOpacity = '0.8';
const destinationMarkActiveOpacity = '1';

const markerImageWidth = 40;
const markerImageHeight = 50;

const planRoutPoylineStyle: google.maps.PolylineOptions = {
  strokeColor: polylineMainColor,
  strokeWeight: 5,
  strokeOpacity: defaultStrokeOpacity,
  zIndex: polylineZIndex,
  clickable: false,
  icons: [
    {
      icon: dashSymbol,
      offset: '0',
      repeat: dashSymbolRepeat,
    },
  ],
};

const actualPoylineStyle: google.maps.PolylineOptions = {
  strokeColor: polylineMainColor,
  strokeWeight: 5,
  strokeOpacity: 1,
  zIndex: polylineZIndex,
  clickable: false,
};

interface IState {
  loadingText: string;
  destinationDataLoading: boolean;
  polylineDataLoading: boolean;
  list: IDestinationInTransitItem[];
}

const initialState: IState = {
  loadingText: '',
  destinationDataLoading: false,
  polylineDataLoading: false,
  list: [],
};

const HomeGoogleMap: FC = () => {
  const { message } = App.useApp();
  const { center, map, mapLoading, initMap } = useGoogleMap({
    tiltRotationControl: false,
  });
  const [state, setState] = useSetState<IState>(initialState);

  const mapInstanceRef = useRef<google.maps.Map>();
  const mapRef = useRef<HTMLDivElement>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow>();
  const destinationMarkersRef = useRef<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);
  const activeDestinationsRef = useRef<IDestinationInTransitItem | null>(null);
  const activeWaybillPoints = useRef<google.maps.LatLngLiteral[]>([]);

  const resetDestinationMarkersOverlay = useCallback(() => {
    destinationMarkersOverlay.clearOverlays();
  }, []);

  const resetActiveWaybillOverlay = useCallback(() => {
    activeWaybillOverlay.clearOverlays();
  }, []);

  const resetAll = () => {
    resetDestinationMarkersOverlay();
    resetActiveWaybillOverlay();
    infoWindowRef.current?.close?.();
    activeDestinationsRef.current = null;
  };

  const fetchData = useCallback(async () => {
    setState({
      destinationDataLoading: true,
      loadingText: 'Fetching Destinations...',
    });
    const res = await getDestinationInTransit().finally(() => {
      setState({ destinationDataLoading: false });
    });

    if (res.code === 200) {
      setState({ list: res.data });
    }
  }, []);

  const calcBounds = useCallback((pointList: google.maps.LatLngLiteral[]) => {
    const bounds = new google.maps.LatLngBounds();
    pointList?.forEach((latLngLiteral) => {
      bounds.extend(latLngLiteral);
    });
    fitPadding(bounds);
    mapInstanceRef.current?.panToBounds(bounds);
    mapInstanceRef.current?.fitBounds(bounds);
  }, []);

  const initInfoWindow = useCallback(() => {
    infoWindowRef.current = new google.maps.InfoWindow({
      maxWidth: 312,
      zIndex: infoWindowZIndex,
    });
  }, []);

  const getPointsBySelect = useCallback((mapJsonStr: string) => {
    try {
      const mapJson: any = unzip(mapJsonStr);
      console.log('mapJson', mapJson);

      const { routes, activeRouteIndex, originList, destinationList } = mapJson;
      const _routeList = getSortRoutes(routes);
      const activeRoute = _routeList[activeRouteIndex];
      const pathList = getPathByRoute(activeRoute);

      return { pathList, originList, destinationList };
    } catch (e) {
      return { pathList: [], originList: [], destinationList: [] };
    }
  }, []);

  const showPlanRoute = useCallback((mapJsonStr: string) => {
    const { pathList, originList } = getPointsBySelect(mapJsonStr);

    if (pathList?.length > 0) {
      const polyline = new google.maps.Polyline({
        map: mapInstanceRef.current,
        path: pathList,
        ...planRoutPoylineStyle,
      });
      activeWaybillOverlay?.addOverlay?.(polyline);
      const sampleList = _.sampleSize(pathList, 2000);
      activeWaybillPoints.current.push(...sampleList);

      let origin = originList[0];
      const content = document.createElement('img');
      content.src = originUrl;
      content.width = markerImageWidth;
      content.height = markerImageHeight;
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: origin,
        content,
        zIndex: markerZIndex,
      });
      activeWaybillOverlay?.addOverlay?.(marker);

      // https://stackoverflow.com/questions/76860379/google-maps-advancedmarker-hover-listener-function-not-working
      marker.addListener('click', () => {});
      marker.content?.addEventListener('mouseover', () => {
        marker.zIndex = activeZIndex;
        const originContent = `
          <div>
          ${renderToString(
            <MarkerDetailForOrigin description={origin?.address} />,
          )}
          </div>
    
          <style>
            .gm-ui-hover-effect {
              display: none !important;
            }
          </style>
          `;
        infoWindowRef.current?.setContent(originContent);
        infoWindowRef.current?.open({
          map: mapInstanceRef.current,
          anchor: marker,
        });
      });

      marker.content?.addEventListener('mouseout', () => {
        marker.zIndex = markerZIndex;
        infoWindowRef.current?.close();
      });
    }
  }, []);

  const showActualRoute = useCallback(async (item: IRouteInTransitItem) => {
    const shippingRecords = item.shippingRecords?.filter(
      (point) => point.lat && point.lng,
    );

    const latLngPoints: google.maps.LatLngLiteral[] = shippingRecords?.map(
      (point) => {
        return { lat: point.lat, lng: point.lng };
      },
    );
    const points = latLngPoints?.reverse();
    if (points?.length >= 2) {
      activeWaybillPoints.current.push(...points);
      setState({
        polylineDataLoading: true,
        loadingText: 'Fetching Route...',
      });
      if (points?.length > 20) {
        // 切片加载
        const instance = new SplitMapPoints(points);
        instance
          .getResult()
          .then((allPointList) => {
            const polyline = new google.maps.Polyline({
              map: mapInstanceRef.current,
              path: allPointList,
              ...actualPoylineStyle,
            });

            activeWaybillOverlay?.addOverlay?.(polyline);
          })
          .catch((err) => {
            message.error(err?.message);
          })
          .finally(() => {
            setState({
              polylineDataLoading: false,
            });
          });
      } else {
        // 调用Google Map API 获得路线
        const directionsServiceParams =
          getDirectionsServiceParamsByPointList(points);
        getGoogleMapRoute(directionsServiceParams)
          .then((pathList) => {
            const polyline = new google.maps.Polyline({
              map: mapInstanceRef.current,
              path: pathList,
              ...actualPoylineStyle,
            });

            activeWaybillOverlay?.addOverlay?.(polyline);
          })
          .catch((err) => {
            message.error(err?.message);
          })
          .finally(() => {
            setState({
              polylineDataLoading: false,
            });
          });
      }
    } else {
      console.warn('Points less than 2');
    }

    if (item.truckLat && item.truckLng) {
      const truckPosition = {
        lat: item.truckLat,
        lng: item.truckLng,
      };
      const content = document.createElement('div');
      const label = document.createElement('div');
      content.className = 'marker-truck-wrap';
      label.className = 'marker-plate-number';
      label.innerText = item.plateNumber;

      const img = document.createElement('img');
      img.src = truckUrl;
      img.width = markerImageWidth;
      img.height = markerImageHeight;

      content.appendChild(label);
      content.appendChild(img);
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: truckPosition,
        content,
        zIndex: markerZIndex,
        gmpClickable: false,
      });
      activeWaybillOverlay?.addOverlay?.(marker);
    }
  }, []);

  const showRoute = useCallback((item: IRouteInTransitItem) => {
    // 显示预设路径
    showPlanRoute(item.mapJson);
    // 显示实际路径
    showActualRoute(item);
    // 计算视野
    calcBounds(activeWaybillPoints.current);
  }, []);

  const showInfoWindowDetail = useCallback(
    (
      marker: google.maps.marker.AdvancedMarkerElement,
      detail?: IDestinationInTransitItem,
    ) => {
      if (!detail) {
        return;
      }
      const content = `
          <div>
            ${renderToString(<MarkerDetail data={detail} />)}
          </div>
    
          <style>
            .gm-ui-hover-effect {
              display: none !important;
            }
          </style>
          `;
      infoWindowRef.current?.setContent(content);
      infoWindowRef.current?.open({
        map: mapInstanceRef.current,
        anchor: marker,
      });
    },
    [],
  );

  const getInfoWindowData = useCallback(
    (
      marker: google.maps.marker.AdvancedMarkerElement,
      item: IDestinationInTransitItem,
    ) => {
      showInfoWindowDetail(marker, item);
    },
    [],
  );

  const getPolylineData = useCallback(
    async (item: IDestinationInTransitItem) => {
      resetActiveWaybillOverlay();

      const cacheItem = cacheQueue.get(item.destinationAddress);
      if (cacheItem) {
        cacheItem.value?.forEach((subItem: IRouteInTransitItem) => {
          showRoute(subItem);
        });
      } else {
        setState({
          polylineDataLoading: true,
          loadingText: 'Fetching Route...',
        });
        const res = await getRouteInTransitDetail({
          ids: item.waybillIds,
        }).finally(() => {
          setState({ polylineDataLoading: false });
        });
        if (res.code === 200) {
          cacheQueue.set(item.destinationAddress, res.data);
          res.data?.forEach((subItem) => {
            showRoute(subItem);
          });
        }
      }
    },
    [],
  );

  const highlightLocationMarker = useCallback(() => {
    if (destinationMarkersRef.current?.length > 0) {
      const markers = destinationMarkersRef.current;
      const activeIndex = _.findIndex(
        state.list,
        (x) =>
          x.destinationAddress ===
          activeDestinationsRef.current?.destinationAddress,
      );
      const activeMarker = destinationMarkersRef.current?.[activeIndex];

      markers?.forEach?.((marker) => {
        marker.element.style.opacity = destinationMarkOpacity;
      });
      if (activeMarker) {
        activeMarker.element.style.opacity = destinationMarkActiveOpacity;
      }
    }
  }, [state.list]);

  const bindMarkEvent = useCallback(
    (markers: google.maps.marker.AdvancedMarkerElement[]) => {
      markers.forEach((marker, index) => {
        const item = state.list[index];

        marker.addListener('click', async () => {
          if (!item.lat || !item.lng) {
            console.error('log: lat or lng is null');
            return;
          }
          const centerPos = { lat: item.lat, lng: item.lng };
          // mapInstanceRef.current?.panTo?.(center);

          if (
            item.destinationAddress ===
            activeDestinationsRef.current?.destinationAddress
          ) {
            // 取消选中
            console.log('取消选中');
            activeDestinationsRef.current = null;
            resetActiveWaybillOverlay();
            highlightLocationMarker();
          } else {
            // 选中
            console.log('选中');
            activeWaybillPoints.current = [centerPos];
            activeDestinationsRef.current = item;
            highlightLocationMarker();
            getPolylineData(item);
          }
        });

        marker.content?.addEventListener('mouseover', () => {
          marker.zIndex = activeZIndex;
          marker.element.style.opacity = destinationMarkActiveOpacity;
          getInfoWindowData(marker, item);
        });

        marker.content?.addEventListener('mouseout', () => {
          marker.zIndex = destinationMarkerZIndex;
          infoWindowRef.current?.close();
          const activeIndex = _.findIndex(
            state.list,
            (x) =>
              x.destinationAddress ===
              activeDestinationsRef.current?.destinationAddress,
          );
          if (index !== activeIndex) {
            marker.element.style.opacity = destinationMarkOpacity;
          }
        });
      });
    },
    [state.list],
  );

  const initMarks = useCallback(() => {
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
    state.list.forEach((item) => {
      if (item.lat && item.lng) {
        const position: google.maps.LatLngLiteral = {
          lat: item.lat,
          lng: item.lng,
        };
        const markerSize = getMarkerSize(item.trucks, 1, 2);

        const content = document.createElement('img');
        content.src = destinationUrl;
        content.style.transform = `scale(${markerSize})`;
        content.width = markerImageWidth;
        content.height = markerImageHeight;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position,
          content,
          zIndex: destinationMarkerZIndex,
        });
        marker.element.style.opacity = destinationMarkOpacity;
        destinationMarkersOverlay?.addOverlay?.(marker);
        markers.push(marker);
      }
    });

    destinationMarkersRef.current = markers;
    bindMarkEvent(markers);
  }, [state.list]);

  useEffect(() => {
    if (map) {
      mapInstanceRef.current = map;
      if (state.list?.length > 0) {
        // 计算最佳视野
        const filterPointList = state.list.filter(
          (item) => item.lat && item.lng,
        );
        const pointList = filterPointList.map((item) => {
          return { lat: item.lat, lng: item.lng };
        });
        calcBounds(pointList);
        // 初始化 infoWindow
        initInfoWindow();
        // 初始化 markerList
        initMarks();
      }
    }
  }, [map, state.list]);

  useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current, {
        center: center,
        mapTypeControl: true,
        scrollwheel: false,
        disableDoubleClickZoom: false,
      });
    }
  }, [mapRef]);

  useEffect(() => {
    fetchData();

    return () => {
      resetAll();
    };
  }, []);

  return (
    <>
      <Spin
        spinning={
          mapLoading ||
          state.destinationDataLoading ||
          state.polylineDataLoading
        }
        tip={mapLoading ? 'Map Loading...' : state.loadingText}
      >
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '700px',
            backgroundColor: '#fff',
            borderRadius: '2px',
            position: 'relative',
          }}
        ></div>
      </Spin>
    </>
  );
};

export default HomeGoogleMap;
