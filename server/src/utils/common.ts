import { promises as fs } from 'fs';

export async function removeDirectory(directoryPath: string) {
  try {
    await fs.rmdir(directoryPath, { recursive: true });
    console.log('Directory removed successfully!');
  } catch (err) {
    console.error(`Error removing directory: ${err}`);
  }
}
