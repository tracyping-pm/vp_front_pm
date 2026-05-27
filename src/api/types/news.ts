import { EnumNewsType } from '@/enums';

export interface INewsRes {
  total: number;
  list: INewsListRecord[];
  pageNum: number;
  pageSize: number;
  size: number;
  startRow: number;
  endRow: number;
  pages: number;
  prePage: number;
  nextPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  navigatePages: number;
  navigatepageNums: number[];
  navigateFirstPage: number;
  navigateLastPage: number;
}

export interface INewsListRecord {
  createdAt: string;
  createdBy: number;
  updatedAt: string;
  updatedBy: number;
  id: number;
  type: EnumNewsType;
  content: string;
  customParam: string;
  receiver: number;
  hasRead: boolean;
}

export interface IUnReadNewsRes {
  unreadCount: number;
  unreadCountStr: string;
}
