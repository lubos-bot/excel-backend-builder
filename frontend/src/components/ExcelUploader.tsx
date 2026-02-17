import { parseExcel } from "../excel/excelParser";
import { initDb } from "../db/database";

interface ExcelUploaderProps {
  onUploadComplete?: () => void;
}

export function ExcelUploader({ onUploadComplete }: ExcelUploaderProps) {
  const handleFile = async (file: File) => {
    try {
      const parsed = await parseExcel(file);
      const resources = Object.keys(parsed);
      const database = initDb(resources);

      for (const resource of resources) {
        const table = (database as any)[resource];
        for (const row of parsed[resource]) {
          const id = row.id ?? crypto.randomUUID();
          await table.add({ id, ...row });
        }
      }

      await database.__meta.put({
        key: "schema",
        resources,
        uploadedAt: new Date().toISOString()
      });

      alert(`Excel imported successfully!\n\nResources: ${resources.join(", ")}`);
      
      // Notify parent to refresh inspector
      onUploadComplete?.();
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import Excel file. Check console for details.");
    }
  };

  return (
    <div className="uploader">
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={e => {
          if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <p className="uploader-hint">
        Upload an Excel file. Each sheet will become a resource table in IndexedDB.
      </p>
    </div>
  );
}