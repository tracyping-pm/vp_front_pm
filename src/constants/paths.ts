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
  // Claim Tickets
  CLAIM_TICKETS: '/claim-tickets',
  CLAIM_TICKETS_DETAIL: '/claim-tickets/detail',
  VP_CLAIM_TICKETS: '/claim-tickets',
  VP_CLAIM_TICKETS_DETAIL: '/claim-tickets/detail',

  // Billing Waybills (unbilled / billable waybills for statement creation)
  BILLING_WAYBILLS: '/billing-waybills',
  BILLING_WAYBILL_BILLING: '/billing-waybills',
  BILLING_WAYBILL_BILLING_DETAIL: '/billing-waybills/detail',

  // Advance Payment Request
  ADVANCE_PAYMENT: '/advance-payment',
  ADVANCE_PAYMENT_CREATE: '/advance-payment/create',
  ADVANCE_PAYMENT_DETAIL: '/advance-payment/detail',
  VP_ADVANCE_PAYMENT: '/advance-payment',
  VP_ADVANCE_PAYMENT_CREATE: '/advance-payment/create',
  VP_ADVANCE_PAYMENT_DETAIL: '/advance-payment/detail',

  // My Statements
  STATEMENTS: '/statements',
  STATEMENTS_CREATE: '/statements/create',
  STATEMENTS_DETAIL: '/statements/detail',
  VP_STATEMENTS: '/statements',
  VP_STATEMENTS_CREATE: '/statements/create',
  VP_STATEMENTS_DETAIL: '/statements/detail',

  NO_AUTH: '/403',
};

export default PATHS;
