const envalid = require('envalid');

const variables = {
    USERNAME: envalid.str({
        desc: 'Username for Wegmans.com account.',
        example: 'some.name@domain.com'
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
        default: 800
    }),
    VIEW_HEIGHT: envalid.num({
        desc: 'Viewport height',
        default: 600
    }),
    HEADLESS: envalid.bool({
        desc: 'Flag to enable non-headless browser.',
        default: true,
    }),
    DATABASE: envalid.url({
        desc: 'Database connection string. (must be absolute path) ',
        example: 'sqlite:///Users/alexlapinski/dbs/test.sqlite'
    })
};

const transformer = (env) => ({
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
    }
});

/**
 *
 * @type {{
 *  user: {username: String, password: String},
 *  baseUrl: String,
 *  paths: {signIn: String},
 *  headless: Boolean,
 *  viewport: {width: Number, height: Number},
 *  database: {connectionString: String}
 * }}
 */
module.exports = envalid.cleanEnv(process.env, variables, {transformer});
