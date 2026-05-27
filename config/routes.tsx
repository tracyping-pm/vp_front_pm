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
