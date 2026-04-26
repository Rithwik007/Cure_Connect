import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthpwa',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_123',
};
