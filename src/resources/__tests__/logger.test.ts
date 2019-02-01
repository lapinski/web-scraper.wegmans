import { getConsoleTransport, LogLevel } from '../logger';
import TransportStream from 'winston-transport';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import * as winston from 'winston';
import jsc from 'jsverify';

describe('Logger Module', () => {
    describe('getConsoleTransport()',() => {

        let transport: TransportStream;

        beforeAll(() => {
            transport = getConsoleTransport(LogLevel.Info);
        });

        it('should create a TransportStream object', () => {
            expect(transport).toBeTruthy();
            expect(transport).toBeInstanceOf(TransportStream);
        });

        it('should have a name of console', () => {
            expect((<ConsoleTransportInstance>transport).name).toEqual('console');
        });

        it('should create an instance of ConsoleTransport', () => {
            expect(transport).toBeInstanceOf(winston.transports.Console);
        });

        it('should create a transport with the correct level', () => {
            jsc.checkForall(
                jsc.oneof([
                    jsc.constant(LogLevel.Info),
                    jsc.constant(LogLevel.Debug),
                    jsc.constant(LogLevel.Warn),
                    jsc.constant(LogLevel.Error)
                ]), (level) => getConsoleTransport(level).level === level
            );
        });
    });
});