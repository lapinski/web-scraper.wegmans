import envalid from 'envalid';

// TODO: Convert to 'convict'

const variables = {
  USERNAME: envalid.str({
    desc: 'Username for Wegmans.com account.',
    example: 'some.name@domain.com',
  }),
  PASSWORD: envalid.str({
    desc: 'Password for Wegmans.com',
  }),
  BASE_URL: envalid.url({
    desc: 'Base URL for Wegmans.com',
    default: 'https://www.wegmans.com',
  }),
  VIEW_WIDTH: envalid.num({
    desc: 'Viewport width',
    default: 800,
  }),
  VIEW_HEIGHT: envalid.num({
    desc: 'Viewport height',
    default: 600,
  }),
  HEADLESS: envalid.bool({
    desc: 'Flag to enable non-headless browser.',
    default: true,
  }),
  DATABASE: envalid.url({
    desc: 'Database connection string. (must be absolute path) ',
    example: 'sqlite:///Users/alexlapinski/dbs/test.sqlite',
  }),
  SCREENSHOTS_DIR: envalid.str({
    desc: 'Folder name to store screenshots',
    example: 'screenshots',
    default: 'screenshots',
  }),
  SCREENSHOTS: envalid.bool({
    desc: 'Flag to enable saving screenshots',
    default: true,
  }),
};

export interface Configuration {
  env: string;
  user: {
    username: string;
    password: string;
  };
  baseUrl: string;
  paths: {
    signIn: string;
  };
  headless: boolean;
  viewport: {
    width: number;
    height: number;
  };
  database: {
    connectionString: string;
  };
  screenshots: {
    dir: string;
    save: string;
  };
}

const transformer = (env: any): Configuration => ({
  env: env.NODE_ENV,
  user: {
    username: env.USERNAME,
    password: env.PASSWORD,
  },
  baseUrl: env.BASE_URL,
  paths: {
    signIn: env.SIGNIN_PATH,
  },
  headless: env.HEADLESS,
  viewport: {
    width: env.VIEW_WIDTH,
    height: env.VIEW_HEIGHT,
  },
  database: {
    connectionString: env.DATABASE,
  },
  screenshots: {
    dir: env.SCREENSHOTS_DIR,
    save: env.SCREENSHOTS,
  },
});

/**
 *
 * @type {{
 *  user: {username: String, password: String},
 *  baseUrl: String,
 *  paths: {signIn: String},
 *  headless: Boolean,
 *  viewport: {width: Number, height: Number},
 *  database: {connectionString: String},
 *  screenshots: {dir:String, save:Boolean}
 * }}
 */
export default <Configuration><unknown>envalid.cleanEnv(process.env, variables, { transformer });;
