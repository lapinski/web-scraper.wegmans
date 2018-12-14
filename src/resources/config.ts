import convict from 'convict';
import dotenv from 'dotenv';

dotenv.config();

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['test', 'development', 'production'],
    default: 'development',
    env: 'NODE_ENV',
  },
  wegmans: {
    username: {
      doc: 'Username for Wegmans.com account.',
      format: '*',
      env: 'WEGMANS_USERNAME',
    },
    password: {
      doc: 'Password for wegmans.com',
      format: '*',
      env: 'WEGMANS_PASSWORD',
      sensitive: true,
    },
    baseUrl: {
      doc: 'Base URL for Wegmans.com',
      format: 'url',
      default: 'https://www.wegmans.com',
    }
  },
  puppeteer: {
    viewport: {
      width: {
        doc: 'Viewport width',
        default: 800,
      },
      height: {
        doc: 'Viewport height',
        default: 600,
      },
    },
    headless: {
      doc: 'Flag to enable non-headless browser.',
      default: true,
    },
  },
  database: {
    name: {
      doc: 'Database Name',
      format: '*',
      default: 'wegmans',
    },
    username: {
      doc: 'Database Username',
      format: 'email',
      env: 'DB_USERNAME',
    },
    password: {
      doc: 'Database Password',
      format: '*',
      sensitive: true,
      env: 'DB_PASSWORD',
    },
    url: {
      doc: 'Database URL',
      format: 'url',
      env: 'DB_URL',
    },
  },
  screenshots: {
    dir: {
      doc: 'Folder name to store screenshots',
      default: 'screenshots',
    },
    enabled: {
      doc: 'Flag to enable saving screenshots',
      default: true,
    },
  },
});

// Perform validation
config.validate({allowed: 'strict'});

export = config;