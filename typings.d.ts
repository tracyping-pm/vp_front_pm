import { EnumVendorAccreditationStatus } from '@/enums';
import '@umijs/max/typings';
declare global {
  type Token = string;

  interface APIJSON<T> {
    code: number;
    msg: string;
    data: T;
  }

  interface RolesItem {
    id: number;
    countryId: number;
    countryName: string;
    userRoleId: number;
    roleName: string;
    dataPermissionType: string | number;
    departmentId: number;
    departmentLink: string;
    parentId: number;
  }

  interface AuthorityItem {
    id: number;
    authorityName: string;
    authorityType: string;
    parentId: number;
  }

  interface UserInfo {
    id?: number;
    email: string;
    name: string;
    aliasName?: string;
    avatar?: string;
    slackMemberId?: string;
    status?: string;
    lastLoginUserRoleId?: number;
    roles?: RolesItem[];
    elementNameList?: string[];
    newToken: Token;
    countryId?: number;
    countryName?: string;
    lastSelection?: string;
    vendorStatus: EnumVendorAccreditationStatus;
    accredApplicationId?: number;
  }

  type PaginationResponse<T = any> = {
    list?: T[];
    pageNum?: number;
    pageSize?: number;
    total?: number;
    pages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    isFirstPage?: boolean;
    isLastPage?: boolean;
  };
}
