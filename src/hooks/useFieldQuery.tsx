import { fieldQueryHighlight } from '@/api/common';
import {
  IDynamicFuzzyParams,
  IFieldQueryHighlightParams,
  IFieldQueryHighlightRes,
} from '@/api/types/common';
import { SearchOutlined, StopOutlined } from '@ant-design/icons';
import { styled } from '@umijs/max';
import { SelectProps, Spin, Tooltip } from 'antd';
import { debounce } from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
// polyfill abort controller if needed
import 'yet-another-abortcontroller-polyfill';

const MIN_LEN = 2;

const enum NotFoundStatusEnum {
  INIT = 'init',
  PENDING = 'pending',
  EMPTY = 'empty',
}

const Span = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const LabelWrap = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
`;

const LabelExtra = styled.span`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Ellipsis = styled.span`
  display: inline-block;
  width: 156px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
`;

interface ILabel {
  content: string;
  additionalRemark?: React.ReactNode;
  disableTip?: string;
}

const Label: FC<ILabel> = ({ content, additionalRemark, disableTip }) => {
  return (
    <LabelWrap>
      <span
        className="ellipsis"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <LabelExtra>
        {additionalRemark && <Ellipsis>{additionalRemark}</Ellipsis>}
        {disableTip && (
          <Tooltip
            placement="topLeft"
            title={disableTip}
            align={{ offset: [-12, -6] }}
            color="#FAAD14"
            styles={{ body: { color: 'var(--character-title-85)' } }}
          >
            <span>
              <StopOutlined />
            </span>
          </Tooltip>
        )}
      </LabelExtra>
    </LabelWrap>
  );
};

let controller: AbortController | undefined;

interface Option extends IFieldQueryHighlightRes {
  label: React.ReactNode | string;
  value: number | undefined;
}

export type IFieldQueryParams = {
  startupLength?: number;
  debounceTime?: number;
} & Omit<IFieldQueryHighlightParams, 'value'>;

export const useFieldQuery = (params: IFieldQueryParams) => {
  const { debounceTime } = params;
  const [notFoundStatus, setNotFoundStatus] = useState<NotFoundStatusEnum>(
    NotFoundStatusEnum.INIT,
  );
  const [options, setOptions] = useState<Option[]>([]);
  const [value, setValue] = useState<number | string | undefined>(undefined);

  const NotFoundContent = useCallback(() => {
    return notFoundStatus === NotFoundStatusEnum.INIT ? (
      <Span>{`Minimum length of ${MIN_LEN} characters to search`}</Span>
    ) : notFoundStatus === NotFoundStatusEnum.PENDING ? (
      <Spin size="small" />
    ) : (
      <Span>No results found</Span>
    );
  }, [notFoundStatus]);

  const onSelect = (option: Option) => {
    setValue(option.value);
  };

  const onClear = () => {
    setValue(undefined);
  };

  const DEFAULT_FIELD_PROPS: SelectProps = {
    showSearch: true,
    defaultActiveFirstOption: false,
    notFoundContent: <NotFoundContent />,
    labelInValue: true,
    optionLabelProp: 'name',
    filterOption: false,
    getPopupContainer: (triggerNode) => triggerNode.parentElement,
    prefixCls: 'fuzzy-query',
    // value,
    onSelect: onSelect,
    onClear: onClear,
    suffixIcon: <SearchOutlined />,
  };

  const doQuery = async (payload: IFieldQueryHighlightParams) => {
    setNotFoundStatus(NotFoundStatusEnum.PENDING);

    if (controller) {
      controller?.abort?.();
    }
    controller = new AbortController();
    const { signal } = controller;

    try {
      const res = await fieldQueryHighlight(payload, signal);

      if (res.code === 200) {
        const { data } = res;
        const list = data.map((item) => ({
          ...item,
          title: item.name,
          disabled: item.disabled,
          label: (
            <div title={item.name} className="custom-option">
              <Label
                content={item.nameHighlight || item.name}
                additionalRemark={item.additionalRemark}
                disableTip={item.disabledTip}
              />
            </div>
          ),
          value: item.id,
        }));
        if (list.length <= 0) {
          setNotFoundStatus(NotFoundStatusEnum.EMPTY);
        }
        setOptions([...list]);
      } else {
        setNotFoundStatus(NotFoundStatusEnum.INIT);
      }
    } catch (error) {
      console.log('fetch aborted');
    }
  };

  const onSearch = async (
    keywords: string,
    dynamicParams?: IDynamicFuzzyParams,
  ) => {
    setOptions([]);
    const { startupLength = MIN_LEN, field, esDtoClass, type } = params;
    if (!keywords || keywords?.length < startupLength) {
      setNotFoundStatus(NotFoundStatusEnum.INIT);
      return;
    }

    const payload = {
      field,
      esDtoClass,
      value: keywords,
      type: type,
      projectId: params?.projectId ? params?.projectId : undefined,
      approved: params?.approved ? params?.approved : undefined,
      ...dynamicParams,
    };
    doQuery(payload);
  };

  const resetAll = useCallback(() => {
    if (controller) {
      controller?.abort?.();
    }
    setOptions([]);
    setNotFoundStatus(NotFoundStatusEnum.INIT);
    setValue(undefined);
  }, []);

  useEffect(() => {
    return () => {
      resetAll();
    };
  }, []);

  return {
    options,
    onSearch: debounceTime ? debounce(onSearch, debounceTime) : onSearch,
    defaultFieldProps: DEFAULT_FIELD_PROPS,
    value,
    setValue,
    resetAll,
  };
};
