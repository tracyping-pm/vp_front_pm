/**
 * Claim Ticket mock data — VP view
 *
 * Ticket number format: Country + CT + YYMMDD + 4-digit sequence + 2-digit random
 * VP view only shows tickets related to the vendor (Coca-Cola Bottlers PH Inc.).
 */

export type ClaimStatus =
  | 'Ongoing Validation'
  | 'Claim team review'
  | 'Pending Vendor Confirm'
  | 'Pending Confirm'
  | 'Vendor Disputed'
  | 'Disputed'
  | 'For Deduction'
  | 'Completed'
  | 'Canceled';

export type DeductionState =
  | 'Deducted'
  | 'For Deduction'
  | 'Not Linked AP'
  | 'Written Off';

export interface ClaimTicket {
  ticketNo: string;
  claimTypeL1: 'Internal' | 'External';
  claimTypeL2: string;
  claimAmount: number;
  currency: 'PHP';
  claimant: string;
  responsibleParty: string;
  isWaybillBased: boolean;
  relatedWaybill?: string;
  claimDetails?: string;
  deductionForVendor: DeductionState;
  status: ClaimStatus;
  creationTime: string;
  creator: string;
  linkedSettlementApNo?: string;
  linkedStatementNo?: string;
  resolutionNote?: string;
}

export const CLAIM_TICKETS: ClaimTicket[] = [
  {
    ticketNo: 'PHCT26041501AB',
    claimTypeL1: 'External',
    claimTypeL2: 'Delivery Claims / Damaged Goods',
    claimAmount: 3200,
    currency: 'PHP',
    claimant: 'Coca-Cola Bottlers PH Inc.',
    responsibleParty: 'Vendor',
    isWaybillBased: true,
    relatedWaybill: 'WB2604002',
    claimDetails:
      'Customer reported 3 boxes with damaged packaging upon receipt, compensated at 1,067 PHP per box. Photos attached.',
    deductionForVendor: 'For Deduction',
    status: 'Pending Confirm',
    creationTime: '2026-04-15 14:22',
    creator: 'TMS Claim Team',
  },
  {
    ticketNo: 'PHCT26041002CD',
    claimTypeL1: 'External',
    claimTypeL2: 'KPI Claims / Late Delivery',
    claimAmount: 1500,
    currency: 'PHP',
    claimant: 'Coca-Cola Bottlers PH Inc.',
    responsibleParty: 'Vendor',
    isWaybillBased: true,
    relatedWaybill: 'WB2604004',
    claimDetails: 'Delivery SLA exceeded by 6 hours, deduction per contract terms.',
    deductionForVendor: 'Deducted',
    status: 'Completed',
    creationTime: '2026-04-10 09:15',
    creator: 'TMS Claim Team',
    linkedSettlementApNo: 'ApS260416002',
    resolutionNote: 'Vendor confirmed, included in statement deduction.',
  },
  {
    ticketNo: 'PHCT26040803EF',
    claimTypeL1: 'Internal',
    claimTypeL2: 'Fuel Advance Recovery',
    claimAmount: 5000,
    currency: 'PHP',
    claimant: 'Inteluck Corporation',
    responsibleParty: 'Vendor',
    isWaybillBased: false,
    claimDetails:
      'March prepaid fuel card allowance exceeded actual usage, recovery of 5,000 PHP required.',
    deductionForVendor: 'For Deduction',
    status: 'Pending Confirm',
    creationTime: '2026-04-08 16:40',
    creator: 'Inteluck Finance',
  },
  {
    ticketNo: 'PHCT26040704GH',
    claimTypeL1: 'External',
    claimTypeL2: 'Delivery Claims / Shortage',
    claimAmount: 2800,
    currency: 'PHP',
    claimant: 'Coca-Cola Bottlers PH Inc.',
    responsibleParty: 'Vendor',
    isWaybillBased: true,
    relatedWaybill: 'WB2604003',
    claimDetails:
      'Customer count found 2 boxes short. Vendor claims quantity was verified before loading.',
    deductionForVendor: 'For Deduction',
    status: 'Disputed',
    creationTime: '2026-04-07 11:05',
    creator: 'TMS Claim Team',
    resolutionNote:
      'Vendor submitted dispute: Loading receipt stamp confirms correct quantity.',
  },
  {
    ticketNo: 'PHCT26040605IJ',
    claimTypeL1: 'External',
    claimTypeL2: 'Vehicle Damage',
    claimAmount: 8500,
    currency: 'PHP',
    claimant: 'Coca-Cola Bottlers PH Inc.',
    responsibleParty: 'Vendor',
    isWaybillBased: false,
    claimDetails: 'Warehouse dock collision, vendor responsible for repair costs.',
    deductionForVendor: 'Not Linked AP',
    status: 'Claim team review',
    creationTime: '2026-04-06 08:30',
    creator: 'TMS Claim Team',
  },
  {
    ticketNo: 'PHCT26040506KL',
    claimTypeL1: 'Internal',
    claimTypeL2: 'Toll Fee Adjustment',
    claimAmount: 450,
    currency: 'PHP',
    claimant: 'Inteluck Corporation',
    responsibleParty: 'Vendor',
    isWaybillBased: true,
    relatedWaybill: 'WB2604001',
    claimDetails: 'Toll prepaid difference write-off.',
    deductionForVendor: 'Written Off',
    status: 'Canceled',
    creationTime: '2026-04-05 13:12',
    creator: 'Inteluck Finance',
  },
];
