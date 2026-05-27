/**
 * Candidate waybills for advance payment requests.
 * Only waybills with status Planning / Pending / In Transit are eligible.
 * VP cannot see basic amount — price blackbox.
 */

export interface CandidateWaybill {
  no: string;
  status: 'Planning' | 'Pending' | 'In Transit';
  truckType: string;
  origin: string;
  destination: string;
  positionTime: string;
  unloadingTime: string;
}

export const CANDIDATE_WAYBILLS: CandidateWaybill[] = [
  {
    no: 'WB2604020',
    status: 'In Transit',
    truckType: '10-Wheeler',
    origin: 'PH-NCR-Manila / Port Area',
    destination: 'PH-Cavite-Imus / DC',
    positionTime: '2026-04-16 12:45',
    unloadingTime: '2026-04-16 08:30',
  },
  {
    no: 'WB2604021',
    status: 'In Transit',
    truckType: '6-Wheeler',
    origin: 'PH-Cavite-Imus',
    destination: 'PH-NCR-Taguig',
    positionTime: '2026-04-17 09:25',
    unloadingTime: '2026-04-17 13:10',
  },
  {
    no: 'WB2604022',
    status: 'Planning',
    truckType: '10-Wheeler',
    origin: 'PH-Batangas / Lima',
    destination: 'PH-NCR-Manila',
    positionTime: '2026-04-17 13:40',
    unloadingTime: '2026-04-17 18:05',
  },
  {
    no: 'WB2604023',
    status: 'Pending',
    truckType: '4-Wheeler',
    origin: 'PH-NCR-Manila',
    destination: 'PH-Laguna-Calamba',
    positionTime: '2026-04-18 07:50',
    unloadingTime: '2026-04-18 11:25',
  },
  {
    no: 'WB2604024',
    status: 'In Transit',
    truckType: '10-Wheeler',
    origin: 'PH-Pampanga / Clark',
    destination: 'PH-NCR-Manila / Port Area',
    positionTime: '2026-04-18 15:20',
    unloadingTime: '2026-04-18 19:15',
  },
];
