import { fieldQueryHighlight } from '@/api/common';
import { AutoComplete } from 'antd';
import cls from 'classnames';
import { debounce } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import { DEFAULT_CUSTOM_PROPS, DEFAULT_FIELD_PROPS } from './constant';
import styles from './index.less';
import {
  ENUM_NOT_FOUND_STATUS,
  I_FUZZY_API_REQUEST,
  I_FUZZY_SELECTOR,
  I_OPTION,
} from './types';
// polyfill abort controller if needed
import { formatString } from '@/utils/format';
import _ from 'lodash';
import 'yet-another-abortcontroller-polyfill';
import Label from './Label';
import NotFoundContent from './NotFoundContent';

let controller: AbortController | undefined;

const FuzzyAutoComplete: FC<I_FUZZY_SELECTOR> = ({
  customProps,
  fieldProps,
  request,
  value,
  onChange,
}) => {
  const _customProps = _.merge({}, DEFAULT_CUSTOM_PROPS, customProps);
  const _fieldProps = _.merge({}, DEFAULT_FIELD_PROPS, fieldProps);
  const { debounceTime, startupLength, requestWithoutSpace } = _customProps;

  const [notFoundStatus, setNotFoundStatus] = useState<ENUM_NOT_FOUND_STATUS>(
    ENUM_NOT_FOUND_STATUS.INIT,
  );
  const [options, setOptions] = useState<I_OPTION[]>([]);

  const onClear = () => {
    onChange?.(undefined);
  };

  const doQuery = async (payload: I_FUZZY_API_REQUEST) => {
    setOptions([]);
    setNotFoundStatus(ENUM_NOT_FOUND_STATUS.PENDING);

    if (controller) {
      controller?.abort?.();
    }
    controller = new AbortController();
    const { signal } = controller;

    try {
      const res = await fieldQueryHighlight(payload, signal);
      if (res.code === 200) {
        const { data } = res;
        const list = data.map((item) => {
          const { name } = item;
          const labelContent = name.replace(
            new RegExp(payload.value, 'gi'),
            (match) => `<span style="color: red;">${match}</span>`,
          );

          return {
            ...item,
            title: item.name,
            disabled: item.disabled,
            label: (
              <div title={item.name} className="custom-option">
                <Label
                  content={labelContent}
                  additionalRemark={item.additionalRemark}
                  disableTip={item.disabledTip}
                  extraFields={item.extraFields}
                />
              </div>
            ),
            // value: item.id,
            value: item.name,
          };
        });
        if (list.length <= 0) {
          setNotFoundStatus(ENUM_NOT_FOUND_STATUS.EMPTY);
        }
        // @ts-ignore
        setOptions([...list]);
      } else {
        setNotFoundStatus(ENUM_NOT_FOUND_STATUS.INIT);
      }
    } catch (error) {
      console.log('fetch aborted');
    }
  };

  const onSearch = async (keywords: string) => {
    let _keywords = keywords;
    if (requestWithoutSpace) {
      _keywords = formatString(keywords);
    }
    if (!_keywords || _keywords?.length < startupLength!) {
      setNotFoundStatus(ENUM_NOT_FOUND_STATUS.INIT);
      return;
    }

    const payload = {
      ...request,
      value: _keywords,
    };
    doQuery(payload);
  };

  const onInnerChange = (val: string) => {
    onChange?.(val);
  };

  const resetAll = useCallback(() => {
    if (controller) {
      controller?.abort?.();
    }
    setOptions([]);
    setNotFoundStatus(ENUM_NOT_FOUND_STATUS.INIT);
  }, []);

  useEffect(() => {
    return () => {
      resetAll();
    };
  }, []);

  return (
    <>
      <div className={cls('fuzzy-selector', styles.fuzzySelectorContainer)}>
        <AutoComplete
          {..._fieldProps}
          value={value}
          notFoundContent={
            <NotFoundContent
              status={notFoundStatus}
              startupLength={startupLength!}
            />
          }
          options={options}
          onClear={onClear}
          onSearch={debounce(onSearch, debounceTime)}
          onChange={onInnerChange}
        />
      </div>
    </>
  );
};

export default FuzzyAutoComplete;
