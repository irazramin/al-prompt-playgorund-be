interface Config {
  env: string;
  port: number;
  db: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
  };
  app: {
    url: string;
  };
  aiSdk: {
    openai: {
      key: string
    }
  }
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  db: {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/myapp',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  mail: {
    host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.MAIL_PORT || '2525', 10),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'noreply@example.com',
    fromName: process.env.MAIL_FROM_NAME || 'Your App',
  },
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
  },
  aiSdk: {
    openai: {
      key: process.env.OPENAI_API_KEY || ''
    }
  }
};

export default config;
