import * as xlsx from 'xlsx';
import { removeDirectory } from './common';

export const createBufferFromExcelFile = (data: any[], sheetName: string) => {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

export const readFileExcel = async (path: string) => {
  const workbook = xlsx.readFile(path);
  const sheetNameList = workbook.SheetNames;
  const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
  // detele file after read

  return excelData;
};

export const appendDataToExcelFile = (
  data: any,
  workbook: xlsx.WorkBook,
  sheetName: string,
) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
  return workbook;
};
