type EnvironmentType = 'production' | 'test' | 'development'
interface Config {
  port: string;
  env: EnvironmentType;
  token: string | undefined;
}

const makeConfig = (): Config => {
  return {
    port: process.env.PORT || '3000',
    env: process.env.NODE_ENV as EnvironmentType || 'development',
    token: process.env.TOKEN || '',
  }
}

const config = makeConfig();

export default config;