import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
}));
