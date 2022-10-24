// import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';
// import { LoggerModule } from 'nestjs-pino';

// export const LoggerConfig = (config: ConfigService): LoggerModule => ({
//   exclude: [{ method: RequestMethod.ALL, path: config.get('APP_PREFIX') }],
//   pinoHttp: {
//     reqCustomProps: (req: Request) => ({
//       body: req.body,
//     }),
//     redact: {
//       paths: [],
//       censor: '********',
//     },
//     name: config.get('npm_package_name'),
//     level: config.get('LOGGER_LEVEL'),
//     prettyPrint: config.get('LOGGER_PRETTY_PRINT'),
//   },
// });
