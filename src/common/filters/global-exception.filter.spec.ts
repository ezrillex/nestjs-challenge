import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, BadRequestException, HttpServer } from '@nestjs/common';
import { GraphQLError, GraphQLFormattedError } from 'graphql/error';

describe('Global Exception Filter', () => {
  let filter: GlobalExceptionFilter;
  let host: ArgumentsHost;
  let server: HttpServer;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2020, 12, 12, 12, 12, 12));

    server = {
      reply: jest.fn(),
    } as unknown as HttpServer;

    host = {
      getType: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          url: '/test',
        }),
        getResponse: jest.fn().mockReturnValue({
          message: 'test response',
        }),
      }),
    } as unknown as ArgumentsHost;
    filter = new GlobalExceptionFilter(server);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should be defined', () => {
    expect(filter.catch).toBeDefined();
  });

  it('should handle an HTTP exception', async () => {
    const badRequest = new BadRequestException('Test message');

    const spy = jest.fn().mockResolvedValue(null);
    server.reply = spy;

    filter.catch(badRequest, host);

    expect(spy.mock.calls).toMatchSnapshot('http error reply');
  });

  it('should handle a GraphQL exception', async () => {
    const gqlError = new GraphQLError('Test error message');
    host.getType = jest.fn().mockReturnValue('graphql');

    server.reply = jest.fn().mockResolvedValue(null);

    filter.catch(gqlError, host);

    expect(filter.catch(gqlError, host)).toMatchSnapshot('gql error');
  });

  it('should handle a formatted GraphQL exception', async () => {
    const gqlException: GraphQLFormattedError = {
      message: `NotFoundException: error message for not found error`,
      extensions: {
        code: 404,
        timestamp: new Date().toISOString(),
        path: ['someTestPath'],
      },
    };

    host.getType = jest.fn().mockReturnValue('graphql');

    expect(filter.catch(gqlException, host)).toMatchSnapshot(
      'gql formatted exception',
    );
  });
});
