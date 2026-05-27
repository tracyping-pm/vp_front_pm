import { PermissionEnum } from './enums/permission';

export default (initialState: any) => {
  const permission = initialState?.currentUser?.elementNameList ?? [];

  return {
    // waybill
    [PermissionEnum.WAYBILL]: permission?.includes(PermissionEnum.WAYBILL),
    [PermissionEnum.CREATE_WAYBILL]: permission?.includes(
      PermissionEnum.CREATE_WAYBILL,
    ),
    [PermissionEnum.COPY_WAYBILL]: permission?.includes(
      PermissionEnum.COPY_WAYBILL,
    ),
    [PermissionEnum.WAYBILL_DETAIL]: permission?.includes(
      PermissionEnum.WAYBILL_DETAIL,
    ),
    [PermissionEnum.STANDARD_WAYBILL_OPERATE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_OPERATE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_OPERATE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_OPERATE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ABNORMAL]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ABNORMAL,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ABNORMAL]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ABNORMAL,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CANCEL]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CANCEL,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CANCEL]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CANCEL,
    ),
    [PermissionEnum.STANDARD_WAYBILL_DELETE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_DELETE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_DELETE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_DELETE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT_EDIT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT_EDIT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT_EDIT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT_EDIT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_ADD_RECORD]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ADD_RECORD,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ADD_RECORD]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ADD_RECORD,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ADDITIONAL]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ADDITIONAL,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CONFIRM_ROUTE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CONFIRM_ROUTE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_ROUTE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_ROUTE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_MANAGE_POD]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_MANAGE_POD,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_MANAGE_POD]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_MANAGE_POD,
    ),
    [PermissionEnum.STANDARD_WAYBILL_SUBMIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_SUBMIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_SUBMIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_SUBMIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_START]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_START,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_START]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_START,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CONFIRM_WAYBILL]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CONFIRM_WAYBILL,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_WAYBILL]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_WAYBILL,
    ),
    [PermissionEnum.STANDARD_WAYBILL_SHIPPING_RECORD]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_SHIPPING_RECORD,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_SHIPPING_RECORD]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_SHIPPING_RECORD,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ROUTE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ROUTE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ROUTE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ROUTE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CARRIER]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CARRIER,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CARRIER]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CARRIER,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CARRIER_ASSIGN]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CARRIER_ASSIGN,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CARRIER_ASSIGN]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CARRIER_ASSIGN,
    ),
    [PermissionEnum.STANDARD_WAYBILL_BILLING]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_BILLING,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_BILLING]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_BILLING,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_BILLING_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_BILLING_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_POD]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_POD,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_POD]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_POD,
    ),
    [PermissionEnum.STANDARD_WAYBILL_BASIC_INFO]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_BASIC_INFO,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO,
    ),
    [PermissionEnum.STANDARD_WAYBILL_BASIC_INFO_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_BASIC_INFO_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_REMARK]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_REMARK,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_REMARK]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_REMARK,
    ),
    [PermissionEnum.STANDARD_WAYBILL_REMARK_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_REMARK_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_REMARK_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_REMARK_EDIT,
    ),

    // permission
    [PermissionEnum.PERMISSION_MANAGEMENT]: permission?.includes(
      PermissionEnum.PERMISSION_MANAGEMENT,
    ),
    [PermissionEnum.ACCOUNT_MANAGEMENT]: permission?.includes(
      PermissionEnum.ACCOUNT_MANAGEMENT,
    ),
    [PermissionEnum.ORGANIZATION_MANAGEMENT]: permission?.includes(
      PermissionEnum.ORGANIZATION_MANAGEMENT,
    ),
  };
};
