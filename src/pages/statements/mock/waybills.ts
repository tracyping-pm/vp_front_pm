// Mock waybill data for VP Statements module
// Mirrors the billable waybill pool used in prototype

export interface StatementWaybillRow {
  no: string;
  waybillAmount: number;
  basicAmount: number;
  prepaidAmount: number;
  additionalCharge: number;
  exceptionFee: number;
  reimbursement: number;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
}

export interface StatementClaimRow {
  ticketNo: string;
  claimType: string;
  relatedWaybill?: string;
  claimAmount: number;
  currency?: string;
  createdAt?: string;
}

// ── Base waybills in the statement pool ──────────────────────────────────────

export const BASE_WAYBILL_POOL: StatementWaybillRow[] = [
  {
    no: 'WB2604050',
    waybillAmount: 13300,
    basicAmount: 13300,
    prepaidAmount: 0,
    additionalCharge: 0,
    exceptionFee: 0,
    reimbursement: 0,
    positionTime: '2026-04-16 12:45',
    unloadingTime: '2026-04-16 08:30',
    truckType: '10-Wheeler',
    origin: 'Manila',
    destination: 'Laguna',
  },
  {
    no: 'WB2604099',
    waybillAmount: 9800,
    basicAmount: 9000,
    prepaidAmount: 0,
    additionalCharge: 500,
    exceptionFee: 300,
    reimbursement: 0,
    positionTime: '2026-04-20 09:30',
    unloadingTime: '2026-04-20 16:10',
    truckType: '6-Wheeler',
    origin: 'Manila',
    destination: 'Cavite',
  },
  {
    no: 'WB2604102',
    waybillAmount: 12600,
    basicAmount: 11800,
    prepaidAmount: 0,
    additionalCharge: 800,
    exceptionFee: 0,
    reimbursement: 0,
    positionTime: '2026-04-21 08:00',
    unloadingTime: '2026-04-21 13:45',
    truckType: '10-Wheeler',
    origin: 'Laguna',
    destination: 'Batangas',
  },
  {
    no: 'WB2604010',
    waybillAmount: 18000,
    basicAmount: 18000,
    prepaidAmount: 0,
    additionalCharge: 800,
    exceptionFee: 0,
    reimbursement: 0,
    positionTime: '2026-04-10 10:00',
    unloadingTime: '2026-04-10 15:30',
    truckType: '10-Wheeler',
    origin: 'PH-NCR-Manila / Port Area',
    destination: 'PH-Cavite-Imus / DC',
  },
  {
    no: 'WB2604011',
    waybillAmount: 12500,
    basicAmount: 12000,
    prepaidAmount: 0,
    additionalCharge: 0,
    exceptionFee: 500,
    reimbursement: 300,
    positionTime: '2026-04-11 07:00',
    unloadingTime: '2026-04-11 09:00',
    truckType: '6-Wheeler',
    origin: 'PH-Cavite-Imus',
    destination: 'PH-NCR-Taguig',
  },
];

// ── Claim tickets available for deduction ────────────────────────────────────

export const ALL_CLAIM_TICKETS: StatementClaimRow[] = [
  {
    ticketNo: 'PHCT2604001',
    claimType: 'KPI Claim',
    relatedWaybill: 'WB2604050',
    claimAmount: 2000,
    currency: 'PHP',
    createdAt: '2026-04-15',
  },
  {
    ticketNo: 'PHCT26041688',
    claimType: 'Damage Claim',
    relatedWaybill: 'WB2604099',
    claimAmount: 1500,
    currency: 'PHP',
    createdAt: '2026-04-20',
  },
  {
    ticketNo: 'PHCT26041702',
    claimType: 'Late Delivery',
    relatedWaybill: 'WB2604102',
    claimAmount: 900,
    currency: 'PHP',
    createdAt: '2026-04-21',
  },
  {
    ticketNo: 'PHCT26040088',
    claimType: 'KPI Claim',
    relatedWaybill: 'WB2604010',
    claimAmount: 1200,
    currency: 'PHP',
    createdAt: '2026-04-10',
  },
];
