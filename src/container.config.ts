import { Container } from 'inversify';
import PuppeteerBrowser, { IBrowser, IBrowserType } from './resources/browser';
import WinstonLogger, { ILogger, ILoggerType } from './resources/logger';

const container = new Container();

container.bind<IBrowser>(IBrowserType).to(PuppeteerBrowser);
container.bind<ILogger>(ILoggerType).to(WinstonLogger);

export { container };