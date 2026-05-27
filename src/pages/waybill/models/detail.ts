import { IWaybillBasicInfoResp } from '@/api/types/waybill';
import { waybillBasicInfo } from '@/api/waybill';
import { useSetState } from 'ahooks';

const State = () => {
  const [state, setState] = useSetState({
    basicInfo: {} as IWaybillBasicInfoResp,
    loading: false,
  });

  const startUp = async (id: number) => {
    setState({ loading: true });
    const [infoRes] = await Promise.all([waybillBasicInfo({ id })]);
    setState({ loading: false });
    if (infoRes.code === 200) {
      setState({ basicInfo: infoRes.data ?? {} });
    }
  };

  const reset = () => {
    setState({
      basicInfo: {} as IWaybillBasicInfoResp,
      loading: false,
    });
  };

  return {
    startUp,
    reset,
    state,
  };
};

export default State;
