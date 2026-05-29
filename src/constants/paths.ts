const PATHS = {
  BASE: '/',
  HOME: '/home',
  LOGIN: '/auth/login',
  CHANGE_PASSWORD: '/user/change-password',
  CHANGE_ROLE: '/user/change-role',
  WAYBILL_LIST: '/waybills',
  WAYBILL_DETAIL: '/waybills/detail',
  ACCRED_APPLICATION: '/accred-application',
  ACCRED_APPLICATION_DETAIL: '/accred-application/detail',
  TRUCK_LIST: '/trucks',
  TRUCK_DETAIL: '/trucks/detail',
  CREW_LIST: '/crew',
  CREW_DETAIL: '/crew/detail',
  // Finance — Claim Tickets
  CLAIM_TICKETS: '/finance/claim-tickets',
  CLAIM_TICKETS_DETAIL: '/finance/claim-tickets/detail',
  VP_CLAIM_TICKETS: '/finance/claim-tickets',
  VP_CLAIM_TICKETS_DETAIL: '/finance/claim-tickets/detail',

  // Finance — Billing Waybills (unbilled / billable waybills for statement creation)
  BILLING_WAYBILLS: '/finance/billing-waybills',
  BILLING_WAYBILL_BILLING: '/finance/billing-waybills',
  BILLING_WAYBILL_BILLING_DETAIL: '/finance/billing-waybills/detail',

  // Finance — Advance Payment Request
  ADVANCE_PAYMENT: '/finance/advance-payment',
  ADVANCE_PAYMENT_CREATE: '/finance/advance-payment/create',
  ADVANCE_PAYMENT_DETAIL: '/finance/advance-payment/detail',
  VP_ADVANCE_PAYMENT: '/finance/advance-payment',
  VP_ADVANCE_PAYMENT_CREATE: '/finance/advance-payment/create',
  VP_ADVANCE_PAYMENT_DETAIL: '/finance/advance-payment/detail',

  // Finance — My Statements
  STATEMENTS: '/finance/statements',
  STATEMENTS_CREATE: '/finance/statements/create',
  STATEMENTS_DETAIL: '/finance/statements/detail',
  VP_STATEMENTS: '/finance/statements',
  VP_STATEMENTS_CREATE: '/finance/statements/create',
  VP_STATEMENTS_DETAIL: '/finance/statements/detail',

  NO_AUTH: '/403',
};

export default PATHS;
