import { resolve } from 'path';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { UMI_ENV = 'dev' } = process.env;
const tagVerison = process.env.TAG_VERSION || '0.0.0';

// When running behind TMS dev-server proxy (pnpm start:tms-proxy),
// VP must serve all routes under /vp/ so both apps share the same origin
// (localhost:8000) and can exchange data via localStorage.
const VP_PROXY_MODE = process.env.VP_PROXY_MODE === 'true';
const base = VP_PROXY_MODE ? '/vp/' : '/';

export default {
  esbuildMinifyIIFE: true,
  base,
  publicPath: base,
  alias: {
    '@': resolve(__dirname, '../src'),
  },
  antd: {
    // configProvider
    configProvider: {},
    // themes
    dark: false,
    compact: false,
    // babel-plugin-import
    import: false,
    // less or css, default less
    style: 'less',
    // shortcut of `configProvider.theme`
    // use to configure theme token, antd v5 only
    // https://ant.design/docs/react/customize-theme-cn#%E5%8A%A8%E6%80%81%E5%88%87%E6%8D%A2
    // theme: {
    //   token: {
    //     colorPrimary: '#009688',
    //     borderRadius: 2,
    //     borderRadiusLG: 8,
    //     borderRadiusSM: 2,
    //     colorLink: '#009688',
    //   },
    //   components: {
    //     Menu: {
    //       itemSelectedBg: '#ECF6F4'
    //     },
    //     Button: {
    //       // borderRadius: 2,
    //       // algorithm: true, // 启用算法
    //     },
    //     Input: {
    //       // algorithm: true, // 启用算法
    //     },
    //     Modal: {
    //       // borderRadius: 2,
    //     },
    //   },
    // },
    // antd <App /> valid for version 5.1.0 or higher, default: undefined
    appConfig: {},
    // Transform DayJS to MomentJS
    momentPicker: false,
    // Add StyleProvider for legacy browsers
    // styleProvider: {
    //   hashPriority: 'high',
    //   legacyTransformer: true,
    // },
  },
  access: {},
  model: {},
  initialState: {
    loading: '@/loading',
  },
  styledComponents: {},
  request: {},
  valtio: {},
  metas: [
    { name: 'version', content: tagVerison },
    { name: 'referrer', content: 'no-referrer' },
    {
      'http-equiv': 'Pragma',
      content: 'no-cache',
    },
    {
      'http-equiv': 'Cache-Control',
      content: 'no-cache, no-store',
    },
  ],
  links: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: true,
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Allura&family=Beth+Ellen&family=Calligraffitti&family=Cedarville+Cursive&family=Charmonman:wght@400;700&family=Cookie&family=Damion&family=Dancing+Script:wght@400..700&family=Dawning+of+a+New+Day&family=Dr+Sugiyama&family=Give+You+Glory&family=Homemade+Apple&family=Indie+Flower&family=Kaushan+Script&family=Liu+Jian+Mao+Cao&family=Long+Cang&family=Lovers+Quarrel&family=Marck+Script&family=Nanum+Brush+Script&family=Nothing+You+Could+Do&family=Over+the+Rainbow&family=Pacifico&family=Parisienne&family=Reenie+Beanie&family=Ruthie&family=Sacramento&family=Satisfy&family=Shadows+Into+Light&family=Yellowtail&family=Zeyada&display=swap',
    },
  ],
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 220,
    ...defaultSettings,
  },
  manifest: {
    basePath: '/',
  },
  routes,
  // theme: {
  //   'primary-color': defaultSettings.colorPrimary,
  // },
  hash: true,
  npmClient: 'pnpm',
  //   define: {
  //     'process.env.UMI_ENV': process.env.UMI_ENV,
  //     ...envs,
  //   },
  // @ts-ignore
  proxy: proxy[UMI_ENV],
  locale: {
    // 默认使用 src/locales/en-US.json 作为多语言文件
    default: 'en-US',
    baseSeparator: '-',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: false,
  },
  // autoprefixer: {
  //   flexbox: true,
  // },
  // legacy: {
  //   buildOnly: false,
  //   nodeModulesTransform: false,
  // }
  // targets: {
  //   ie: 9,
  // },
  // targets: {
  //   safari: 10,
  //   // edge: 13,
  //   // firefox: 57,
  //   // chrome: 49,
  //   // ie: 11,
  // },
  // cssMinifier: 'esbuild',
  // autoprefixer: {
  //   flexbox: true,
  // },
  // polyfill: {
  //   imports: ['core-js/stable'],
  // },
};
