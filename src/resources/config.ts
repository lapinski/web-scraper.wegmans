import convict from 'convict';
import dotenv from 'dotenv';
import { DatabaseType, LogicalEnvironment, LogLevel } from '../types/enums';

dotenv.config();

const config = convict({
  env: {
    doc: 'The application environment',
    format: [LogicalEnvironment.Production, LogicalEnvironment.Development, LogicalEnvironment.Test],
    default: LogicalEnvironment.Development,
    env: 'NODE_ENV',
  },
  logging: {
    level: {
      doc: 'Min level to write to logs',
      format: [ LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error ],
      default: LogLevel.Error,
    },
    filename: {
      doc: 'Filename/path to write log messages',
      format: String,
      default: 'wegmans-web-scraper.log',
    },
    console: {
      doc: 'Flag indicating if log messages should be written to the console.',
      format: Boolean,
      default: true,
    }
  },
  wegmans: {
    username: {
      doc: 'Username for Wegmans.com account.',
      format: String,
      env: 'WEGMANS_USERNAME',
    },
    password: {
      doc: 'Password for wegmans.com',
      format: String,
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
        format: Number,
        default: 800,
      },
      height: {
        doc: 'Viewport height',
        format: Number,
        default: 600,
      },
    },
    headless: {
      doc: 'Flag to enable non-headless browser.',
      format: Boolean,
      default: true,
    },
  },
  database: {
    url: {
      doc: 'Database URL, eg. postgres://test:test@domain:port/dbname',
      format: 'url',
      env: 'DB_URL',
    },
    type: {
      doc: 'Database type e.g. postgres',
      format: [DatabaseType.Postgres, DatabaseType.MySql],
      default: DatabaseType.Postgres,
      env: 'DB_TYPE',
    }
  },
  screenshots: {
    dir: {
      doc: 'Folder name to store screenshots',
      format: String,
      default: 'screenshots',
    },
    enabled: {
      doc: 'Flag to enable saving screenshots',
      format: Boolean,
      default: true,
    },
  },
});

// Perform validation
config.validate({ allowed: 'strict' });

export = config;