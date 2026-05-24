// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
  async uploadFile({
    file,
    filename,
    buffer,
  }: {
    file?: Express.Multer.File,
    filename?: string,
    buffer?: Buffer,
  }): Promise<CloudinaryResponse> {
    const originalFilename = !filename ? Buffer.from(file.originalname, 'ascii').toString('utf8') : filename;

    // Check if Cloudinary is configured. If not, use local file storage fallback.
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_NAME) {
      const publicDir = path.join(process.cwd(), 'public');
      const uploadsDir = path.join(publicDir, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileExt = path.extname(originalFilename);
      const fileBase = path.basename(originalFilename, fileExt);
      const uniqueFilename = `${fileBase}-${Date.now()}${fileExt}`;
      const filePath = path.join(uploadsDir, uniqueFilename);
      const fileBuffer = !buffer ? file.buffer : buffer;

      fs.writeFileSync(filePath, fileBuffer);

      const port = process.env.PORT || 3334;
      const backendUrl = `http://localhost:${port}`;
      return {
        secure_url: `${backendUrl}/uploads/${uniqueFilename}`,
        original_filename: originalFilename,
      } as any;
    }

    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', filename_override: originalFilename },
        (error, result) => {
          if (error) {
            console.log('@@@', error);
            return reject(error);
          }
          resolve(result);
        },
      );
      streamifier.createReadStream(!buffer ? file.buffer : buffer).pipe(uploadStream);
    });
  }
}

