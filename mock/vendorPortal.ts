import { PermissionEnum } from '../src/enums/permission';

const ALL_PERMISSIONS = Object.values(PermissionEnum);
const PLACEHOLDER_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9p7xGXQAAAAASUVORK5CYII=';

const ok = (data: any, msg = 'success') => ({
  code: 200,
  msg,
  data,
});

const now = () => new Date().toISOString();

const truckTypes = [
  { id: 1, name: '6W Van', country: 1, deleted: 0 },
  { id: 2, name: '10W Wing Van', country: 1, deleted: 0 },
];

const truckDefaultCategories = [
  {
    id: 'truck-or-cr',
    fileCategory: 'OR/CR',
    required: true,
  },
  {
    id: 'truck-photo',
    fileCategory: 'Truck Photo',
    required: false,
  },
];

const crewDefaultCategories = [
  {
    id: 'crew-license',
    fileCategory: 'Driver License',
    required: true,
  },
];

const accreditationCategories = [
  {
    id: 'mock-category-1',
    categoryAccreditationId: 1,
    categoryMaterialId: 1,
    fileCategory: 'Registration Document',
    subFileCategory: 'Primary',
    defaultCategory: true,
    required: true,
    validDateStart: '2025-01-01',
    validDateEnd: '2026-12-31',
    validIndefinitely: false,
    accreditationMaterialList: [],
  },
];

const trucks = [
  {
    id: 101,
    plateNumber: 'ABC-1234',
    truckType: 1,
    truckTypeName: '6W Van',
    vanType: 'Dry',
    registrationNumber: 'REG-101',
    grossCapacity: 12,
    netCapacity: 10.5,
    volume: 28,
    model: 'Isuzu Forward',
    status: 'Accredited',
    transportationStatus: 'Available',
    ownership: 'Owned Truck',
    updatedAt: '2026-05-20 10:30:00',
    validityPeriod: 1772409600000,
    codingDay: 'Monday',
    accreditationCategoryList: accreditationCategories,
  },
  {
    id: 102,
    plateNumber: 'XYZ-5678',
    truckType: 2,
    truckTypeName: '10W Wing Van',
    vanType: 'Reefer',
    registrationNumber: 'REG-102',
    grossCapacity: 18,
    netCapacity: 16.2,
    volume: 42,
    model: 'Hino Ranger',
    status: 'Unaccredited',
    transportationStatus: 'Transit',
    ownership: 'Non-Owned Truck',
    updatedAt: '2026-05-18 09:15:00',
    validityPeriod: 1769817600000,
    codingDay: 'Wednesday',
    accreditationCategoryList: accreditationCategories,
  },
];

const crews = [
  {
    id: 201,
    name: 'Juan Dela Cruz',
    driverFlag: true,
    helperFlag: false,
    status: 'Accredited',
    transportationStatus: 'Available',
    idNumber: 'DL-778899',
    phoneCode: '+63',
    phoneCodeId: 167,
    phoneNum: '9123456789',
    licenseNumber: 'N01-23-456789',
    validityPeriod: 1772409600000,
    updatedAt: '2026-05-22 08:00:00',
    blockReason: '',
    vendorList: [
      {
        vendorId: 9001,
        vendorName: 'Mock Vendor Logistics',
        vendorTag: 'Primary',
      },
    ],
    accreditationCategoryList: accreditationCategories,
  },
  {
    id: 202,
    name: 'Somchai Helper',
    driverFlag: false,
    helperFlag: true,
    status: 'Inactive',
    transportationStatus: 'Transit',
    idNumber: 'ID-112233',
    phoneCode: '+66',
    phoneCodeId: 214,
    phoneNum: '812345678',
    licenseNumber: '',
    validityPeriod: 1769817600000,
    updatedAt: '2026-05-19 14:20:00',
    blockReason: '',
    vendorList: [
      {
        vendorId: 9001,
        vendorName: 'Mock Vendor Logistics',
        vendorTag: 'Secondary',
      },
    ],
    accreditationCategoryList: accreditationCategories,
  },
];

let accredList = [
  {
    id: 301,
    number: 'APP-202605-001',
    status: 'draft',
    type: 'Truck',
    vendorId: 9001,
    objectId: 101,
    objectName: 'ABC-1234',
    countryId: 1,
    deleted: false,
    createdAt: '2026-05-10 09:00:00',
    createdBy: 1,
    updatedAt: '2026-05-24 11:00:00',
    updatedBy: 1,
  },
  {
    id: 302,
    number: 'APP-202605-002',
    status: 'underReview',
    type: 'Crew',
    vendorId: 9001,
    objectId: 201,
    objectName: 'Juan Dela Cruz',
    countryId: 1,
    deleted: false,
    createdAt: '2026-05-11 10:00:00',
    createdBy: 1,
    updatedAt: '2026-05-25 12:00:00',
    updatedBy: 1,
  },
  {
    id: 303,
    number: 'APP-202605-003',
    status: 'approved',
    type: 'Vendor',
    vendorId: 9001,
    objectId: 9001,
    objectName: 'Mock Vendor Logistics',
    countryId: 1,
    deleted: false,
    createdAt: '2026-05-12 11:00:00',
    createdBy: 1,
    updatedAt: '2026-05-26 09:30:00',
    updatedBy: 1,
  },
];

const userInfo = {
  id: 1,
  email: 'local@mock.dev',
  name: 'Local Mock Vendor',
  aliasName: 'Mock Vendor',
  status: 'Activated',
  lastLoginUserRoleId: 1,
  roles: [
    {
      id: 1,
      countryId: 1,
      countryName: 'Philippines',
      userRoleId: 1,
      roleName: 'Vendor Admin',
      dataPermissionType: 'CompanyWide',
      departmentId: 1,
      departmentLink: 'Mock Vendor > Operations',
      parentId: 0,
    },
  ],
  elementNameList: ALL_PERMISSIONS,
  newToken: 'local-dev-token',
  countryId: 1,
  countryName: 'Philippines',
  lastSelection: 'Mock Vendor Logistics',
  vendorStatus: 'Accredited',
  accredApplicationId: undefined,
};

const paginate = (list: any[], pageNum = 1, pageSize = 30) => {
  const start = Math.max(pageNum - 1, 0) * pageSize;
  const end = start + pageSize;
  return {
    list: list.slice(start, end),
    pageNum,
    pageSize,
    total: list.length,
    pages: Math.ceil(list.length / pageSize),
  };
};

const getBody = (req: any) => req.body || {};

const findTruck = (id?: number) => trucks.find((item) => item.id === id) || trucks[0];
const findCrew = (id?: number) => crews.find((item) => item.id === id) || crews[0];
const findAccred = (id?: number) =>
  accredList.find((item) => item.id === id) || accredList[0];

const toWaybillListItem = (id: number, waybillNumber: string, status: string) => ({
  id,
  waybillNumber,
  status,
  projectId: 1,
  positionTime: '2026-05-26 13:00:00',
  waybillReceivableAmount: 15250,
  plateNumber: id % 2 === 0 ? 'XYZ-5678' : 'ABC-1234',
  truckId: id % 2 === 0 ? 102 : 101,
  driverName: id % 2 === 0 ? 'Somchai Helper' : 'Juan Dela Cruz',
  driverId: id % 2 === 0 ? 202 : 201,
  dispatcherName: 'Dispatch Team A',
  dispatcherId: 5001,
  createdAt: '2026-05-24 09:30:00',
});

const waybills = [
  toWaybillListItem(401, 'WB-202605-001', 'Pending'),
  toWaybillListItem(402, 'WB-202605-002', 'In Transit'),
  toWaybillListItem(403, 'WB-202605-003', 'Delivered'),
];

const waybillBasicInfo = {
  id: 401,
  status: 'In Transit',
  preStatus: 'Pending',
  positionTime: '2026-05-26 13:00:00',
  completionTime: '2026-05-27 17:30:00',
  createdAt: '2026-05-24 09:30:00',
  waybillNumber: 'WB-202605-001',
  customerName: 'Acme Retail',
  dispatcherName: 'Dispatch Team A',
  dispatcherId: 5001,
  plateNumber: 'ABC-1234',
  truckId: 101,
  driverName: 'Juan Dela Cruz',
  driverId: 201,
  helpers: [
    {
      id: 1,
      helperName: 'Somchai Helper',
      helperPhoneNumber: '+66 812345678',
    },
  ],
  customerCodeVos: [
    {
      customerCodeId: 1,
      customerCodeType: 'Project Code',
      number: 'PRJ-7788',
    },
  ],
  hasGps: 1,
};

export default {
  'GET /api/vendor-portal/user/info': ok(userInfo),
  'POST /api/vendor-portal/auth/email-login': ok('local-dev-token'),
  'POST /api/vendor-portal/user/logout': ok(null),
  'POST /api/vendor-portal/user/change-last-selection': ok(null),
  'POST /api/vendor-portal/user/change-password': ok(null),

  'GET /api/vendor-portal/vendor/detail': ok({
    vendorName: 'Mock Vendor Logistics',
    vendorType: 'Corporate',
    countryName: 'Philippines',
    pad: 101,
    padName: 'NCR',
    sad: 102,
    sadName: 'Metro Manila',
    tad: 103,
    tadName: 'Taguig',
    accreditationCategoryList: accreditationCategories,
  }),
  'GET /api/vendor-portal/vendor/default-sub-category': ok([
    'Business Permit',
    'Mayor Permit',
    'Tax Certificate',
  ]),

  'GET /api/vendor-portal/place/country': ok([
    { id: 1, description: 'Philippines' },
    { id: 2, description: 'Thailand' },
  ]),
  'GET /api/vendor-portal/place/region': ok([
    { id: 101, description: 'NCR' },
    { id: 201, description: 'Central Thailand' },
  ]),
  'GET /api/vendor-portal/place/province': ok([
    { id: 102, description: 'Metro Manila' },
    { id: 202, description: 'Bangkok' },
  ]),
  'GET /api/vendor-portal/place/city': ok([
    { id: 103, description: 'Taguig' },
    { id: 203, description: 'Bang Kapi' },
  ]),
  'GET /api/vendor-portal/place/geo/region': ok([
    { id: 101, name: 'NCR' },
    { id: 201, name: 'Central Thailand' },
  ]),
  'GET /api/vendor-portal/place/geo/province': ok([
    { id: 102, name: 'Metro Manila' },
    { id: 202, name: 'Bangkok' },
  ]),
  'GET /api/vendor-portal/place/geo/city': ok([
    { id: 103, name: 'Taguig' },
    { id: 203, name: 'Bang Kapi' },
  ]),
  'POST /api/vendor-portal/place/geo/resolveAddressResult': ok({
    pad: 101,
    padName: 'NCR',
    sad: 102,
    sadName: 'Metro Manila',
    tad: 103,
    tadName: 'Taguig',
  }),

  'GET /api/vendor-portal/phone/list': ok([
    { label: 'Philippines(+63)', show: '+63', value: 167 },
    { label: 'Thailand(+66)', show: '+66', value: 214 },
  ]),

  'POST /api/vendor-portal/es/fieldQueryHighlight': (req: any, res: any) => {
    const { field = '', value = '' } = getBody(req);
    const keyword = String(value).toLowerCase();
    const sourceMap: Record<string, any[]> = {
      waybillNumber: waybills.map((item) => ({
        id: item.id,
        name: item.waybillNumber,
      })),
      plateNumber: trucks.map((item) => ({ id: item.id, name: item.plateNumber })),
      customerName: [{ id: 1, name: 'Acme Retail' }],
      name: crews.map((item) => ({ id: item.id, name: item.name })),
      accredApplicationNumber: accredList.map((item) => ({
        id: item.id,
        name: item.number,
      })),
    };
    const records = (sourceMap[field] || [{ id: 1, name: value || 'Mock Option' }])
      .filter((item) => !keyword || item.name.toLowerCase().includes(keyword))
      .map((item) => ({
        ...item,
        nameHighlight: item.name,
      }));
    res.json(ok(records));
  },

  'POST /api/vendor-portal/waybill/list': (req: any, res: any) => {
    const { pageNum = 1, pageSize = 30 } = getBody(req);
    res.json(ok(paginate(waybills, pageNum, pageSize)));
  },
  'POST /api/vendor-portal/waybill/basicInfo': ok(waybillBasicInfo),
  'POST /api/vendor-portal/waybill/route': ok({
    routeCode: 'R-1001',
    origins: [
      {
        id: 1,
        padId: 101,
        padName: 'NCR',
        sadId: 102,
        sadName: 'Metro Manila',
        tadId: 103,
        tadName: 'Taguig',
        address: 'Taguig Logistics Hub',
        lat: 14.5176,
        lng: 121.0509,
        sort: 1,
      },
    ],
    destinations: [
      {
        id: 2,
        padId: 101,
        padName: 'NCR',
        sadId: 102,
        sadName: 'Metro Manila',
        tadId: 104,
        tadName: 'Quezon City',
        address: 'Quezon City Retail Store',
        lat: 14.676,
        lng: 121.0437,
        sort: 2,
      },
    ],
  }),
  'POST /api/vendor-portal/waybill/listShippingRecord': ok({
    waybillId: 401,
    mapJsonStr: '{}',
    truckHistoryVoList: [
      {
        deviceDate: '2026-05-26 12:30:00',
        latitude: 14.57,
        longitude: 121.03,
        speed: 45,
        heading: 90,
      },
    ],
    shippingRecordVoList: [
      {
        shippingRecordId: 1,
        action: 'Loaded',
        time: '2026-05-26 11:00:00',
        lng: 121.03,
        lat: 14.56,
        mapAddress: 'Taguig Logistics Hub',
      },
    ],
    callFmsFailed: false,
  }),
  'POST /api/vendor-portal/waybill/listPod': ok({
    waybillId: 401,
    podList: [],
  }),
  'POST /api/vendor-portal/waybill/editPod': ok(null),
  'POST /api/vendor-portal/waybill/listFee': ok({
    waybillId: 401,
    waybillReceivableAmount: 15250,
    basicAmountReceivable: 14000,
    additionalAmountReceivable: 1250,
    percentageOfPaidInAdvance: 10,
    percentageOfHandlingFee: 3,
    percentageOfRegularPayments: 87,
    amountOfPaymentAdvance: 1525,
    amountOfHandlingFee: 457.5,
    amountOfRegularPayments: 13267.5,
    demurrage: 0,
    addtlDrop: 300,
    boomTruck: 0,
    manpower: 450,
    backload: 500,
    other: 0,
  }),
  'POST /api/vendor-portal/waybill/checkExportWaybill': ok({
    code: 0,
    remainCount: 4,
  }),
  'POST /api/vendor-portal/waybill/exportWaybill': ok(null),
  'POST /api/vendor-portal/waybill/latestExportRecord': ok([
    {
      id: 1,
      status: 'Success',
      fileName: 'waybill-export-20260527.xlsx',
      spreadsheetId: 'mock-sheet-1',
    },
  ]),
  'POST /api/vendor-portal/waybill/downloadExport': ok(
    'https://example.com/mock-waybill-export.xlsx',
  ),
  'GET /api/vendor-portal/statistic/total-quantity': ok({
    waybillNum: 3,
    deliveredWaybillNum: 1,
    truckNum: 2,
    crewNum: 2,
  }),
  'POST /api/vendor-portal/statistic/listAllLocation': ok([
    {
      waybillId: 401,
      locationTime: '2026-05-26 12:30:00',
      lat: 14.57,
      lng: 121.03,
      mapAddress: 'EDSA, Makati',
    },
  ]),
  'POST /api/vendor-portal/statistic/listSpecificWaybillInfo': ok({
    waybillId: 401,
    locationTime: '2026-05-26 12:30:00',
    waybillNumber: 'WB-202605-001',
    firstOrigin: 'Taguig Logistics Hub',
    lastDestination: 'Quezon City Retail Store',
    shippingRecordAction: 'In Transit',
    lat: 14.57,
    lng: 121.03,
    mapAddress: 'EDSA, Makati',
  }),
  'POST /api/vendor-portal/statistic/listMapJsonStr': ok('{}'),
  'POST /api/vendor-portal/waybill/listAllShippingRecord': ok(
    paginate(
      [
        {
          createdAt: '2026-05-26 11:00:00',
          createdBy: 1,
          updatedAt: '2026-05-26 11:00:00',
          updatedBy: 1,
          id: 1,
          wayBillId: 401,
          action: 'Loaded',
          time: '2026-05-26 11:00:00',
          lng: 121.03,
          lat: 14.56,
          mapAddress: 'Taguig Logistics Hub',
          note: '',
          obtainLocationWay: 'GPS',
          deleted: false,
        },
      ],
      1,
      30,
    ),
  ),
  'POST /api/vendor-portal/waybill/deletePod': ok(null),
  'POST /api/vendor-portal/waybill/getDestinationInTransit': ok([
    {
      lat: 14.676,
      lng: 121.0437,
      labels: 'QC Retail',
      trucks: 1,
      destinationAddress: 'Quezon City Retail Store',
      waybillIds: [401],
    },
  ]),
  'POST /api/vendor-portal/waybill/getRouteInTransitDetail': ok([
    {
      waybillId: 401,
      originAddress: 'Taguig Logistics Hub',
      lat: 14.5176,
      lng: 121.0509,
      mapJson: '{}',
      plateNumber: 'ABC-1234',
      truckLat: 14.57,
      truckLng: 121.03,
      shippingRecords: [
        {
          createdAt: '2026-05-26 11:00:00',
          createdBy: 1,
          updatedAt: '2026-05-26 11:00:00',
          updatedBy: 1,
          id: 1,
          wayBillId: 401,
          action: 'Loaded',
          time: '2026-05-26 11:00:00',
          lng: 121.03,
          lat: 14.56,
          mapAddress: 'Taguig Logistics Hub',
          note: '',
          obtainLocationWay: 'GPS',
          deleted: false,
        },
      ],
    },
  ]),

  'POST /api/vendor-portal/truck/list': (req: any, res: any) => {
    const { pageNum = 1, pageSize = 30 } = getBody(req);
    res.json(ok(paginate(trucks, pageNum, pageSize)));
  },
  'POST /api/vendor-portal/truck/detail': (req: any, res: any) => {
    const { id } = getBody(req);
    res.json(ok(findTruck(Number(id))));
  },
  'GET /api/vendor-portal/waybill/truckType': ok(truckTypes),
  'GET /api/vendor-portal/truck/default-category': ok(truckDefaultCategories),
  'POST /api/vendor-portal/truck/query-plate-no': (req: any, res: any) => {
    const plateNumber = req.query?.plateNumber;
    const truck = trucks.find((item) => item.plateNumber === plateNumber) || trucks[0];
    res.json(ok(truck));
  },

  'POST /api/vendor-portal/crew/list': (req: any, res: any) => {
    const { pageNum = 1, pageSize = 30 } = getBody(req);
    res.json(ok(paginate(crews, pageNum, pageSize)));
  },
  'POST /api/vendor-portal/crew/detail': (req: any, res: any) => {
    const { id } = getBody(req);
    res.json(ok(findCrew(Number(id))));
  },
  'GET /api/vendor-portal/crew/default-category': ok(crewDefaultCategories),
  'POST /api/vendor-portal/crew/query-id-number': (req: any, res: any) => {
    const idNumber = req.query?.idNumber;
    const crew = crews.find((item) => item.idNumber === idNumber) || crews[0];
    res.json(
      ok({
        ...crew,
        accredCrewId: 8001,
        number: 'APP-202605-010',
        type: 'Crew',
        objectName: crew.name,
        rejectReason: '',
      }),
    );
  },

  'POST /api/vendor-portal/accred/list': (req: any, res: any) => {
    const { pageNum = 1, pageSize = 30 } = getBody(req);
    res.json(ok(paginate(accredList.filter((item) => !item.deleted), pageNum, pageSize)));
  },
  'POST /api/vendor-portal/accred/withdraw': (req: any, res: any) => {
    const { id } = getBody(req);
    accredList = accredList.map((item) =>
      item.id === Number(id)
        ? { ...item, status: 'draft', updatedAt: now() }
        : item,
    );
    res.json(ok(null));
  },
  'POST /api/vendor-portal/accred/submit-draft': (req: any, res: any) => {
    const { id } = getBody(req);
    accredList = accredList.map((item) =>
      item.id === Number(id)
        ? { ...item, status: 'underReview', updatedAt: now() }
        : item,
    );
    res.json(ok(null));
  },
  'POST /api/vendor-portal/accred/delete': (req: any, res: any) => {
    const { id } = getBody(req);
    accredList = accredList.filter((item) => item.id !== Number(id));
    res.json(ok(null));
  },
  'POST /api/vendor-portal/accred/truck/detail': (req: any, res: any) => {
    const item = findAccred(Number(getBody(req).id));
    const truck = findTruck(item.objectId);
    res.json(
      ok({
        id: item.id,
        number: item.number,
        status: item.status,
        type: 'Truck',
        objectName: item.objectName,
        rejectReason: '',
        updatedAt: item.updatedAt,
        accreditationCategoryList: accreditationCategories,
        accredTruckId: truck.id,
        plateNumber: truck.plateNumber,
        truckType: truck.truckType,
        truckTypeName: truck.truckTypeName,
        vanType: truck.vanType,
        registrationNumber: truck.registrationNumber,
        grossCapacity: truck.grossCapacity,
        netCapacity: truck.netCapacity,
        volume: truck.volume,
        codingDay: truck.codingDay,
        model: truck.model,
        ownership: truck.ownership,
      }),
    );
  },
  'POST /api/vendor-portal/accred/vendor/detail': (req: any, res: any) => {
    const item = findAccred(Number(getBody(req).id));
    res.json(
      ok({
        id: item.id,
        number: item.number,
        status: item.status,
        type: 'Vendor',
        objectName: item.objectName,
        rejectReason: '',
        updatedAt: item.updatedAt,
        accreditationCategoryList: accreditationCategories,
        accredVendorId: 9001,
        countryName: 'Philippines',
        pad: 101,
        padName: 'NCR',
        sad: 102,
        sadName: 'Metro Manila',
        tad: 103,
        tadName: 'Taguig',
      }),
    );
  },
  'POST /api/vendor-portal/accred/crew/detail': (req: any, res: any) => {
    const item = findAccred(Number(getBody(req).id));
    const crew = findCrew(item.objectId);
    res.json(
      ok({
        id: item.id,
        name: crew.name,
        number: item.number,
        status: item.status,
        type: 'Crew',
        objectName: item.objectName,
        rejectReason: '',
        updatedAt: item.updatedAt,
        driverFlag: crew.driverFlag,
        helperFlag: crew.helperFlag,
        idNumber: crew.idNumber,
        phoneCode: crew.phoneCode,
        phoneCodeId: crew.phoneCodeId,
        phoneNum: crew.phoneNum,
        licenseNumber: crew.licenseNumber,
        accreditationCategoryList: accreditationCategories,
        accredCrewId: crew.id,
      }),
    );
  },
  'POST /api/vendor-portal/accred/truck/submit': ok(null),
  'POST /api/vendor-portal/accred/truck/save-draft': ok(null),
  'POST /api/vendor-portal/accred/truck/update-draft': ok(null),
  'POST /api/vendor-portal/accred/vendor/submit': ok(null),
  'POST /api/vendor-portal/accred/vendor/save-draft': ok(null),
  'POST /api/vendor-portal/accred/vendor/update-draft': ok(null),
  'POST /api/vendor-portal/accred/crew/submit': ok(null),
  'POST /api/vendor-portal/accred/crew/save-draft': ok(null),
  'POST /api/vendor-portal/accred/crew/update-draft': ok(null),
  'POST /api/vendor-portal/accred/material/update': ok(null),

  'POST /api/vendor-portal/statistic/waybill-trend': ok({
    xAxis: ['05/21', '05/22', '05/23', '05/24', '05/25', '05/26', '05/27'],
    normalWaybillNum: [2, 3, 2, 4, 3, 5, 4],
    abnormalWaybillNum: [0, 1, 0, 1, 0, 0, 1],
  }),
  'GET /api/vendor-portal/statistic/truckType/year': ok([
    { name: '6W Van', num: 8 },
    { name: '10W Wing Van', num: 5 },
  ]),

  'POST /api/vendor-portal/msg/list': ok({
    list: [
      {
        id: 1,
        readFlag: false,
        title: 'Mock Application Update',
        content: 'Your local mock application is ready for review.',
        type: 'Application',
        createdAt: '2026-05-27 09:00:00',
      },
    ],
    pageNum: 1,
    pageSize: 10,
    total: 1,
    pages: 1,
  }),
  'POST /api/vendor-portal/msg/read': ok(null),
  'GET /api/vendor-portal/msg/unreadCount': ok({
    applicationCount: 1,
    expirationCount: 0,
  }),
  'GET /api/vendor-portal/msg/readAll': ok(null),

  'GET /api/vendor-portal/materials/:materialId/image/:driveFileId': ok(
    PLACEHOLDER_BASE64,
  ),
  'GET /api/vendor-portal/materials/:materialId/preview/:driveFileId': ok(
    `data:image/png;base64,${PLACEHOLDER_BASE64}`,
  ),
  'GET /api/vendor-portal/materials/:materialId/file/:driveFileId': ok(
    PLACEHOLDER_BASE64,
  ),
};
