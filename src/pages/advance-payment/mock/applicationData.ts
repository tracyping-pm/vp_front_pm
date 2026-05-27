/**
 * Seed data for VP Advance Payment applications.
 * Covers all statuses including edge cases (Sync Failed → shown as Awaiting Inteluck Confirmation on VP).
 */

import {
  type SyncedApplication,
  type OperationLogEntry,
  upsertApplication,
  getAllApplications,
} from '@/pages/common/prepaidApplicationSync';

export function buildSeedApplications(): SyncedApplication[] {
  return [
    {
      applicationNo: 'PPA2604002',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Advance Payment Request',
      status: 'Awaiting Inteluck Confirmation',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        {
          no: 'WB2604020',
          positionTime: '2026-04-16 12:45',
          unloadingTime: '2026-04-16 08:30',
          truckType: '10-Wheeler',
          origin: 'PH-NCR-Manila / Port Area',
          destination: 'PH-Cavite-Imus / DC',
          prePaidAmount: 8500,
        },
      ],
      claimTickets: [],
      paymentItems: [],
      deductionItems: [],
      totalAmountPayable: 8500,
      bankName: 'BPI',
      payeeAccount: '1234-5678-90',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: ['proof_PPA2604002.pdf'],
      createdAt: '2026-04-18T14:30:00.000Z',
      submittedAt: '2026-04-18T14:30:00.000Z',
      operationLogs: [
        { time: '2026-04-18T14:15:00.000Z', actor: 'Vendor', action: 'Saved as Draft', note: '' },
        { time: '2026-04-18T14:30:00.000Z', actor: 'Vendor', action: 'Submitted', note: 'Awaiting TMS review' },
      ] as OperationLogEntry[],
    },
    {
      applicationNo: 'PPA2604001',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Advance Payment Request',
      status: 'Collected',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        {
          no: 'WB2604010',
          positionTime: '2026-04-12 09:00',
          unloadingTime: '2026-04-12 14:00',
          truckType: '10-Wheeler',
          origin: 'PH-NCR-Manila',
          destination: 'PH-Cavite-Imus',
          prePaidAmount: 6000,
        },
        {
          no: 'WB2604011',
          positionTime: '2026-04-13 10:00',
          unloadingTime: '2026-04-13 13:00',
          truckType: '6-Wheeler',
          origin: 'PH-Cavite-Imus',
          destination: 'PH-NCR-Taguig',
          prePaidAmount: 6000,
        },
      ],
      claimTickets: [],
      paymentItems: [
        { type: 'Basic Amount', netAmount: 12000, vatRate: 0, vatAmount: 0, whtRate: 0, whtAmount: 0 },
      ],
      deductionItems: [],
      totalAmountPayable: 12000,
      bankName: 'BPI',
      payeeAccount: '1234-5678-90',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: ['proof_PPA2604001.pdf'],
      createdAt: '2026-04-10T08:30:00.000Z',
      submittedAt: '2026-04-10T08:30:00.000Z',
      reviewedAt: '2026-04-11T10:00:00.000Z',
      paidAt: '2026-04-12T16:00:00.000Z',
      operationLogs: [
        { time: '2026-04-10T08:30:00.000Z', actor: 'Vendor', action: 'Submitted', note: '' },
        { time: '2026-04-11T10:00:00.000Z', actor: 'TMS Reviewer', action: 'Approved', note: 'HR Payment request triggered' },
        { time: '2026-04-12T16:00:00.000Z', actor: 'HR System', action: 'Payment Released', note: 'APA2604001 — Payment completed' },
      ] as OperationLogEntry[],
    },
    {
      // V17 Demo: Sync Failed is shown as Awaiting Inteluck Confirmation on VP side
      applicationNo: 'PPA2604003',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Advance Payment Request',
      status: 'Sync Failed',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        {
          no: 'WB2604022',
          positionTime: '2026-04-17 13:40',
          unloadingTime: '2026-04-17 18:05',
          truckType: '10-Wheeler',
          origin: 'PH-Batangas / Lima',
          destination: 'PH-NCR-Manila',
          prePaidAmount: 9500,
        },
      ],
      claimTickets: [],
      paymentItems: [],
      deductionItems: [],
      totalAmountPayable: 9500,
      bankName: 'BDO',
      payeeAccount: '9876-5432-10',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: ['proof_PPA2604003.pdf'],
      createdAt: '2026-04-19T09:00:00.000Z',
      submittedAt: '2026-04-19T09:30:00.000Z',
      reviewedAt: '2026-04-20T10:00:00.000Z',
      operationLogs: [
        { time: '2026-04-19T09:00:00.000Z', actor: 'Vendor', action: 'Saved as Draft', note: '' },
        { time: '2026-04-19T09:30:00.000Z', actor: 'Vendor', action: 'Submitted', note: 'Awaiting TMS review' },
        { time: '2026-04-20T10:00:00.000Z', actor: 'TMS Reviewer', action: 'Approved', note: 'HR Payment request triggered' },
        { time: '2026-04-20T10:05:00.000Z', actor: 'HR System', action: 'Sync Failed', note: 'HR API timeout — awaiting retry' },
      ] as OperationLogEntry[],
    },
    {
      applicationNo: 'PPA2604004',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Advance Payment Request',
      status: 'Rejected',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        {
          no: 'WB2604018',
          positionTime: '2026-04-14 09:00',
          unloadingTime: '2026-04-14 13:00',
          truckType: '4-Wheeler',
          origin: 'PH-NCR-Manila',
          destination: 'PH-Laguna-Calamba',
          prePaidAmount: 6000,
        },
      ],
      claimTickets: [],
      paymentItems: [],
      deductionItems: [],
      totalAmountPayable: 6000,
      bankName: 'BDO',
      payeeAccount: '9876-5432-10',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: [],
      rejectReason:
        'Prepaid amount exceeds 80% of basic freight for WB2604018. Please reduce amount and resubmit.',
      createdAt: '2026-04-15T11:20:00.000Z',
      submittedAt: '2026-04-15T11:20:00.000Z',
      reviewedAt: '2026-04-16T08:00:00.000Z',
      operationLogs: [
        { time: '2026-04-15T11:20:00.000Z', actor: 'Vendor', action: 'Submitted', note: '' },
        {
          time: '2026-04-16T08:00:00.000Z',
          actor: 'TMS Reviewer',
          action: 'Rejected',
          note: 'Prepaid amount exceeds 80% of basic freight for WB2604018. Please reduce amount and resubmit.',
        },
      ] as OperationLogEntry[],
    },
    {
      applicationNo: 'PPA2604005',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Advance Payment Request',
      status: 'Receipt Rejected',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        {
          no: 'WB2604021',
          positionTime: '2026-04-17 09:25',
          unloadingTime: '2026-04-17 13:10',
          truckType: '6-Wheeler',
          origin: 'PH-Cavite-Imus',
          destination: 'PH-NCR-Taguig',
          prePaidAmount: 7500,
        },
      ],
      claimTickets: [],
      paymentItems: [
        { type: 'Basic Amount', netAmount: 7500, vatRate: 0, vatAmount: 0, whtRate: 0, whtAmount: 0 },
      ],
      deductionItems: [],
      totalAmountPayable: 7500,
      bankName: 'BDO Unibank',
      payeeAccount: '1234-5678-90',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: ['proof_PPA2604005.pdf'],
      hrRejectReason:
        'HR rejected the payment: bank account name mismatch. Please correct payee bank details and resubmit.',
      createdAt: '2026-04-20T08:00:00.000Z',
      submittedAt: '2026-04-20T09:30:00.000Z',
      reviewedAt: '2026-04-21T10:00:00.000Z',
      paidAt: '2026-04-23T14:00:00.000Z',
      operationLogs: [
        { time: '2026-04-20T08:00:00.000Z', actor: 'Vendor', action: 'Saved as Draft', note: '' },
        { time: '2026-04-20T09:30:00.000Z', actor: 'Vendor', action: 'Submitted', note: 'Awaiting TMS review' },
        { time: '2026-04-21T10:00:00.000Z', actor: 'TMS Reviewer', action: 'Approved', note: 'HR Payment request triggered' },
        {
          time: '2026-04-23T14:00:00.000Z',
          actor: 'HR System',
          action: 'Payment Rejected',
          note: 'HR rejected the payment: bank account name mismatch. Please correct payee bank details and resubmit.',
        },
      ] as OperationLogEntry[],
    },
    {
      applicationNo: 'PPA2604006',
      vendorName: 'Coca-Cola Bottlers PH Inc.',
      source: 'Vendor Portal',
      appType: 'Advance Payment Request',
      status: 'Draft',
      taxMark: 'VAT-ex',
      currency: 'PHP',
      waybills: [
        {
          no: 'WB2604023',
          positionTime: '2026-04-18 07:50',
          unloadingTime: '2026-04-18 11:25',
          truckType: '4-Wheeler',
          origin: 'PH-NCR-Manila',
          destination: 'PH-Laguna-Calamba',
          prePaidAmount: 5000,
        },
      ],
      claimTickets: [],
      paymentItems: [],
      deductionItems: [],
      totalAmountPayable: 5000,
      bankName: 'BPI',
      payeeAccount: '1234-5678-90',
      payeeName: 'Coca-Cola Bottlers PH Inc.',
      payeeType: 'External Vendor',
      proofFiles: [],
      remark: 'Draft — pending internal review before submission.',
      createdAt: '2026-04-22T10:00:00.000Z',
      operationLogs: [
        { time: '2026-04-22T10:00:00.000Z', actor: 'Vendor', action: 'Saved as Draft', note: '' },
      ] as OperationLogEntry[],
    },
  ];
}

/**
 * Initialize localStorage with seed data if empty.
 * Backfills operationLogs for legacy records that don't have them.
 */
export function ensureSeedData(): void {
  let current = getAllApplications();
  if (current.length === 0) {
    buildSeedApplications().forEach(upsertApplication);
    return;
  }

  // Backfill operationLogs for legacy records
  const seedByNo = new Map(buildSeedApplications().map((s) => [s.applicationNo, s]));
  let migrated = false;
  current.forEach((a) => {
    if (!a.operationLogs || a.operationLogs.length === 0) {
      const seedLogs = seedByNo.get(a.applicationNo)?.operationLogs;
      if (seedLogs && seedLogs.length > 0) {
        upsertApplication({ ...a, operationLogs: seedLogs });
        migrated = true;
      }
    }
  });
  if (migrated) {
    // re-read is handled by caller
  }
}
