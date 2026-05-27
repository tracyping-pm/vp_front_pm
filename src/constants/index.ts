import { IImageState } from '@/api/types/common';

export { default as PATHS } from './paths';
export { default as REGEXP } from './regexp';

export const DEFAULT_NAME = 'tms';
export const TOKEN_KEY = 'tms_vendor_token';
export const USER_KEY = 'userInfo';
export const MAX_LENGTH = {
  NAME: 50,
  LONG_NAME: 100,
  LONGEST_NAME: 1000,
  PASSWORD: 20,
  PHONE: 11,
  EMAIL: 50,
  ADDRESS: 200,
  REMARK: 400,
  CODE: 6,
};
export const COMMON_TABLE_FORM_SETTING = {
  className: 'proTableForm',
  defaultColsNumber: 4,
  searchGutter: 24,
  labelWidth: 0,
  labelCol: { span: 0 },
  // span: 6,
  syncToUrl: true,
  syncToInitialValues: false,
  // submitterColSpanProps: { span: 4 },
  submitter: {
    searchConfig: {
      submitText: 'Search',
      resetText: 'Reset',
    },
  },
};

export const DEFAULT_PAGINATION = {
  list: [],
  pageNum: 1,
  pageSize: 30,
  total: 0,
  pages: 0,
};

export const ES_DTO_CLASS = {
  CUSTOMER: 'Customer',
  USER: 'User',
  DRIVER: 'Driver',
  TRUCK: 'Truck',
  VENDOR: 'Vendor',
  PROJECT: 'Project',
  CAPACITY: 'Capacity',
  ROUTE_LIBRARY: 'RouteLibrary',
  HELPER: 'Helper',
  WAYBILL: 'Waybill',
  ACCRED_APPLICATION: 'AccredApplication',
  CREW: 'Crew',
};

export const FILE_UPLOAD_TIMEOUT = 1000 * 60 * 10;

// https://inteluck.atlassian.net/wiki/spaces/CPT/pages/448823354
export const IMAGE_TYPE = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

export const BELONG_IMG_EXTS = IMAGE_TYPE.map((item) => `.${item}`);

export const FILE_ACCEPT = [
  '.txt',
  '.doc',
  '.docx',
  '.pdf',
  '.xls',
  '.xlsx',
  '.csv',
  '.ppt',
  '.pptx',
  '.zip',
  '.rar',
  '.7z',
  ...BELONG_IMG_EXTS,
];

export const LIMIT_SIZE = 1024 * 1024 * 50;
export const TOTAL_LIMIT_SIZE = LIMIT_SIZE * 2;

export const LAYOUT_HEDAER_HEIGHT = 50;
export const LAYOUT_HEADER_HEIGHT = LAYOUT_HEDAER_HEIGHT;

export const initialImageState: IImageState = {
  pending: false,
  visible: false,
  index: 0,
  sourceImages: [],
};

export const COUNTRY_PHONE_REGULAR_EXPRESSION: Record<number, any> = {
  1: { mobile: /^\+63(0)?9\d{9}$/, phone: /^\+63\d{1,2}\d{6,7}$/ },
  2: { mobile: /^\+66(0?[2-9]\d{7})$/, phone: /^\+66(0?[689]\d{8})$/ },
};

export const DEFAULT_COUNTRY_PHONE_CODE: Record<number, any> = {
  1: {
    label: 'Philippines(+63)',
    value: 167,
    show: '+63',
  },
  2: {
    label: 'Thailand(+66)',
    value: 214,
    show: '+66',
  },
};
