import { TOKEN_KEY } from '@/constants';
import Cookie from 'js-cookie';

export const refreshToken = (newToken: Token) => {
  Cookie.set(TOKEN_KEY, newToken, { expires: 7 });
};

export const isSameList = (list1: any[], list2: any[], fieldName?: string) => {
  if (list1?.length !== list2?.length) {
    return false;
  }

  const field = fieldName ?? 'id';

  const ids1 = new Set(list1?.map((item) => item[field]));
  const ids2 = new Set(list2?.map((item) => item[field]));

  if (ids1?.size !== ids2?.size) {
    return false;
  }

  for (let id of ids1) {
    if (!ids2?.has(id)) {
      return false;
    }
  }

  return true;
};

export const openNewTag = (relativeUrl: string) => {
  const url = window.location.origin + relativeUrl;
  window.open(url, '_blank');
};

export const formatAmount = (amount: number): string => {
  if (amount === 0) {
    return '0';
  }
  if (!amount) {
    return '';
  }
  let str = amount?.toString?.();

  let int = str?.split?.('.')[0];
  let decimal = str?.split?.('.')[1];

  // 使用正则表达式每三位添加一个逗号
  int = int?.replace?.(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (decimal) {
    return `${int}.${decimal}`;
  }

  return int;
};

export const queryStringToObject = (queryString: string) => {
  const cleanQueryString = queryString.startsWith('?')
    ? queryString.substring(1)
    : queryString;

  const params = new URLSearchParams(cleanQueryString);

  const resultObject: any = {};
  for (const [key, value] of params.entries()) {
    const processedValue = isNaN(Number(value)) ? value : Number(value);
    resultObject[key] = processedValue;
  }
  return resultObject;
};
