import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export const CORS: CorsOptions = {
  origin: [
    'http://localhost:3000',
    'https://advanced-web-programming-midterm.vercel.app',
    'https://advanced-web-programming-midterm-6f92.vercel.app',
    'https://advanced-web-programming-midterm-6iiv.vercel.app',
    'https://advanced-web-programming-final-project.vercel.app',
  ],
  credentials: true,
  exposedHeaders: 'uuid',
};
