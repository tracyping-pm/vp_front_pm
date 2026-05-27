/**
 * Mock waybill data for VP Waybills list.
 *
 * Status semantics:
 *   Pending Price     - default, no price yet (basicAmount === null and not synced)
 *   Billable          - price synced from sheet (basicAmount populated), can be added to a statement
 *   Statement Pending - already added to a statement, awaiting TMS flow
 *   Settled           - TMS released payment via HR, no further action needed
 */

export type WaybillStatus =
  | 'Pending Price'
  | 'Billable'
  | 'Statement Pending'
  | 'Settled';

export interface Waybill {
  no: string;
  positionTime: string;
  unloadingTime: string;
  truckType: string;
  origin: string;
  destination: string;
  waybillAmount: number | null;
  basicAmount: number | null;
  prepaidAmount: number | null;
  additionalCharge: number | null;
  exceptionFee: number | null;
  reimbursement: number | null;
  baseStatus: WaybillStatus;
  createdAt: string;
}

export const BASE_WAYBILLS: Waybill[] = [
  {
    no: 'WB2604009',
    positionTime: '2026-04-09 11:00',
    unloadingTime: '2026-04-08 16:30',
    truckType: '10-Wheeler',
    origin: 'PH-NCR-Manila',
    destination: 'PH-Cavite-Imus / DC',
    waybillAmount: 16800,
    basicAmount: 16800,
    prepaidAmount: null,
    additionalCharge: 900,
    exceptionFee: 0,
    reimbursement: 0,
    baseStatus: 'Settled',
    createdAt: '2026/3/28 09:00:00',
  },
  {
    no: 'WB2604010',
    positionTime: '2026-04-10 15:30',
    unloadingTime: '2026-04-09 11:00',
    truckType: '6-Wheeler',
    origin: 'PH-Cavite-Imus / DC',
    destination: 'PH-NCR-Taguig',
    waybillAmount: 13300,
    basicAmount: 13300,
    prepaidAmount: null,
    additionalCharge: 0,
    exceptionFee: 0,
    reimbursement: 0,
    baseStatus: 'Settled',
    createdAt: '2026/3/28 09:00:00',
  },
  {
    no: 'WB2604011',
    positionTime: '2026-04-11 09:00',
    unloadingTime: '2026-04-10 15:30',
    truckType: '6-Wheeler',
    origin: 'PH-Cavite-Imus / DC',
    destination: 'PH-NCR-Taguig',
    waybillAmount: null,
    basicAmount: null,
    prepaidAmount: null,
    additionalCharge: null,
    exceptionFee: null,
    reimbursement: null,
    baseStatus: 'Pending Price',
    createdAt: '2026/4/1 10:00:00',
  },
  {
    no: 'WB2604012',
    positionTime: '2026-04-12 17:00',
    unloadingTime: '2026-04-11 09:00',
    truckType: '6-Wheeler',
    origin: 'PH-Cavite-Imus',
    destination: 'PH-NCR-Taguig',
    waybillAmount: null,
    basicAmount: null,
    prepaidAmount: null,
    additionalCharge: null,
    exceptionFee: null,
    reimbursement: null,
    baseStatus: 'Pending Price',
    createdAt: '2026/4/1 10:00:00',
  },
  {
    no: 'WB2604013',
    positionTime: '2026-04-13 11:15',
    unloadingTime: '2026-04-12 17:00',
    truckType: '10-Wheeler',
    origin: 'PH-Batangas / Lima',
    destination: 'PH-NCR-Manila / Port Area',
    waybillAmount: null,
    basicAmount: null,
    prepaidAmount: null,
    additionalCharge: null,
    exceptionFee: null,
    reimbursement: null,
    baseStatus: 'Pending Price',
    createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'WB2604014',
    positionTime: '2026-04-14 08:30',
    unloadingTime: '2026-04-13 11:15',
    truckType: '4-Wheeler',
    origin: 'PH-NCR-Manila',
    destination: 'PH-Laguna-Calamba / Plant 2',
    waybillAmount: null,
    basicAmount: null,
    prepaidAmount: null,
    additionalCharge: null,
    exceptionFee: null,
    reimbursement: null,
    baseStatus: 'Pending Price',
    createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'WB2604015',
    positionTime: '2026-04-15 14:00',
    unloadingTime: '2026-04-14 08:30',
    truckType: '10-Wheeler',
    origin: 'PH-Pampanga / Clark',
    destination: 'PH-NCR-Manila / Port Area',
    waybillAmount: null,
    basicAmount: null,
    prepaidAmount: null,
    additionalCharge: null,
    exceptionFee: null,
    reimbursement: null,
    baseStatus: 'Pending Price',
    createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'WB2604016',
    positionTime: '2026-04-16 10:45',
    unloadingTime: '2026-04-15 14:00',
    truckType: '6-Wheeler',
    origin: 'PH-NCR-Quezon City',
    destination: 'PH-Bulacan-Meycauayan',
    waybillAmount: null,
    basicAmount: null,
    prepaidAmount: null,
    additionalCharge: null,
    exceptionFee: null,
    reimbursement: null,
    baseStatus: 'Pending Price',
    createdAt: '2026/4/10 09:00:00',
  },
  {
    no: 'WB2604017',
    positionTime: '2026-04-17 07:30',
    unloadingTime: '2026-04-16 10:45',
    truckType: '10-Wheeler',
    origin: 'PH-NCR-Manila / Port Area',
    destination: 'PH-Cavite-Imus / DC',
    waybillAmount: 15500,
    basicAmount: 15500,
    prepaidAmount: null,
    additionalCharge: 0,
    exceptionFee: 0,
    reimbursement: 200,
    baseStatus: 'Pending Price',
    createdAt: '2026/4/12 14:00:00',
  },
];

/** Amounts populated when the user clicks "Sync from Sheet". */
export const SHEET_SYNC_OVERRIDES: Record<string, Partial<Waybill>> = {
  WB2604011: {
    waybillAmount: 15300,
    basicAmount: 14500,
    additionalCharge: 800,
    exceptionFee: 0,
    reimbursement: 0,
  },
  WB2604012: {
    waybillAmount: 13300,
    basicAmount: 13300,
    additionalCharge: 0,
    exceptionFee: 0,
    reimbursement: 0,
  },
  WB2604013: {
    waybillAmount: 16700,
    basicAmount: 15000,
    additionalCharge: 1200,
    exceptionFee: 500,
    reimbursement: 0,
  },
  WB2604014: {
    waybillAmount: 12000,
    basicAmount: 12000,
    additionalCharge: 0,
    exceptionFee: 0,
    reimbursement: 0,
  },
  WB2604015: {
    waybillAmount: 13300,
    basicAmount: 13300,
    additionalCharge: 0,
    exceptionFee: 0,
    reimbursement: 0,
  },
  WB2604016: {
    waybillAmount: 12300,
    basicAmount: 11800,
    additionalCharge: 500,
    exceptionFee: 0,
    reimbursement: 0,
  },
};

/** Derive the effective status for a waybill given current Statement-Pending list. */
export function deriveWaybillStatus(
  w: Waybill,
  pendingWaybills: string[],
): WaybillStatus {
  if (w.baseStatus === 'Settled') return 'Settled';
  if (pendingWaybills.includes(w.no)) return 'Statement Pending';
  if (w.basicAmount !== null) return 'Billable';
  return 'Pending Price';
}

/**
 * Apply sync overrides + prepaid-amount lookup to produce the current effective list.
 */
export function buildEffectiveWaybills(
  syncedOverrides: Record<string, Partial<Waybill>>,
  prepaidAmountMap: Record<string, number>,
): Waybill[] {
  return BASE_WAYBILLS.map((w) => ({
    ...w,
    prepaidAmount: prepaidAmountMap[w.no] ?? w.prepaidAmount,
    ...syncedOverrides[w.no],
  }));
}
