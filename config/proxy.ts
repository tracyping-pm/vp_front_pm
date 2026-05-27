/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */

const { existsSync } = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'proxy.local.ts');

const isExist = existsSync(filePath);
if (isExist) {
  console.log('🚀🚀🚀 [proxy.local.ts] File exists.');
} else {
  console.log('🚀🚀🚀 [proxy.local.ts] File does not exist.');
}

export default {
  dev: {
    '/api/': {
      // target: 'http://192.168.2.6:8090', // Jacky
      // target: 'http://192.168.2.13:8090', // Sandy
      // target: 'http://192.168.2.7:8080', // Howard
      // target: 'http://192.168.2.25:8090', // Rossie
      target: 'https://dev.gaia.inteluck.com',
      changeOrigin: true,
      // pathRewrite: { '^/api': '' },
    },
  },
  test: {
    '/api/': {
      target: 'https://test.wpexia.com',
      changeOrigin: true,
      // pathRewrite: { '^/api': '' },
    },
  },
  prod: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      // pathRewrite: { '^/api': '' },
    },
  },
  ...(isExist ? require('./proxy.local') : {}),
};
