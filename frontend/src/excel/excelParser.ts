import * as XLSX from "xlsx";

export function parseExcel(file: File) {
  return new Promise<Record<string, any[]>>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const result: Record<string, any[]> = {};

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: null });
          result[sheetName.toLowerCase()] = json;
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}