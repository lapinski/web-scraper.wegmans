import { LogLevel, getConsoleTransport } from '../logger';

describe('Logger Module', () => {
    describe('getConsoleTransport()',() => {
        it('should create an object', () => {
            expect(getConsoleTransport(LogLevel.Info)).toBeTruthy();
        });

        it('should create a transport with the correct levelt', () => {
            const input = LogLevel.Info;
            const transport = getConsoleTransport(input);
            expect(transport.level).toEqual(input);
        });
    });
});