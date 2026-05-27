import { defineConfig } from '@umijs/max';
import devEnvs from '../.env.dev';
import prodEnvs from '../.env.prod';
import rcEnvs from '../.env.rc';
import testEnvs from '../.env.test';
import uatEnvs from '../.env.uat';
import commonConfig from './config.common';

const { UMI_ENV = 'dev' } = process.env;

let define = {};
switch (UMI_ENV) {
  case 'dev':
    define = {
      ...devEnvs,
    };
    break;
  case 'test':
    define = {
      ...testEnvs,
    };
    break;
  case 'uat':
    define = {
      ...uatEnvs,
    };
    break;
  case 'rc':
    define = {
      ...rcEnvs,
    };
    break;
  case 'prod':
    define = {
      ...prodEnvs,
    };
    break;
  default:
    define = {
      ...prodEnvs,
    };
}

const json = {
  ...commonConfig,
  define,
};

// console.log('🚀🚀🚀 json', json);

// @ts-ignore
export default defineConfig(json);
