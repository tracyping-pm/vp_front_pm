// 路由图标支持Ant Icon，https://ant.design/components/icon-cn

export default [
  {
    path: '/auth/login',
    component: './auth/Login',
    layout: false,
  },
  {
    path: '/user/change-password',
    component: './user/ChangePassword',
    layout: false,
  },
  {
    path: '/user/greement',
    component: './user/Agreement',
    layout: false,
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home Page',
    component: './home',
    meta: {
      icon: 'home',
    },
  },
  {
    path: '/waybills',
    name: 'Waybills',
    component: './waybill/List',
    meta: {
      icon: 'waybills',
    },
  },
  {
    path: '/waybills/detail/:waybillNumber',
    name: 'Waybills Details',
    component: './waybill/Detail',
    hideInMenu: true,
  },
  {
    path: '/trucks',
    name: 'Trucks',
    component: './trucks/List',
    meta: {
      icon: 'trucks',
    },
  },
  {
    path: '/trucks/detail/:id',
    name: 'Truck Details',
    component: './trucks/Detail',
    hideInMenu: true,
  },
  {
    path: '/crew',
    name: 'Crew',
    component: './crew/List',
    meta: {
      icon: 'crew',
    },
  },
  {
    path: '/crew/detail/:id',
    name: 'Crew Details',
    component: './crew/Detail',
    hideInMenu: true,
  },
  {
    path: '/accred-application',
    name: 'Accreditation Application',
    component: './accred/List',
    meta: {
      icon: 'accred',
    },
  },
  {
    path: '/accred-application/detail',
    name: 'Accreditation Details',
    component: './accred/Detail',
    hideInMenu: true,
  },
  {
    path: '/claim-tickets',
    name: 'Claim Tickets',
    component: './claim-tickets/List',
    meta: {
      icon: 'claim',
    },
  },
  {
    path: '/claim-tickets/detail/:id',
    name: 'Claim Ticket Detail',
    component: './claim-tickets/Detail',
    hideInMenu: true,
  },
  {
    path: '/billing-waybills',
    name: 'Billing Waybills',
    component: './billing-waybills/List',
    meta: {
      icon: 'waybills',
    },
  },
  {
    path: '/advance-payment',
    name: 'Advance Payment',
    component: './advance-payment/List',
    meta: {
      icon: 'payment',
    },
  },
  {
    path: '/advance-payment/create',
    name: 'Create Advance Payment',
    component: './advance-payment/Create',
    hideInMenu: true,
  },
  {
    path: '/advance-payment/detail/:id',
    name: 'Advance Payment Detail',
    component: './advance-payment/Detail',
    hideInMenu: true,
  },
  {
    path: '/statements',
    name: 'My Statements',
    component: './statements/List',
    meta: {
      icon: 'billing',
    },
  },
  {
    path: '/statements/create',
    name: 'Create Statement',
    component: './statements/Create',
    hideInMenu: true,
  },
  {
    path: '/statements/detail/:id',
    name: 'Statement Detail',
    component: './statements/Detail',
    hideInMenu: true,
  },
  {
    path: '/403',
    layout: false,
    component: './403',
  },
  {
    path: '/*',
    layout: false,
    component: './404',
  },
];
