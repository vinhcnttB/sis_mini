import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const CORS: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://advanced-web-programming-midterm.vercel.app',
      'https://advanced-web-programming-midterm-6f92.vercel.app',
      'https://advanced-web-programming-midterm-6iiv.vercel.app',
      'https://advanced-web-programming-final-project.vercel.app',
    ];
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  exposedHeaders: 'uuid',
};
