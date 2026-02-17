import Dexie, { type Table } from "dexie";

export class ExcelBackendDB extends Dexie {
  __meta!: Table<any, string>;

  constructor(resourceNames: string[] = []) {
    super("excel-backend-db");

    const tables: Record<string, string> = {
      __meta: "key"
    };

    resourceNames.forEach(name => {
      tables[name] = "id";
    });

    this.version(1).stores(tables);
  }
}

export let db: ExcelBackendDB | null = null;

// Initialize DB with known resource names (for new uploads)
export function initDb(resourceNames: string[]) {
  db = new ExcelBackendDB(resourceNames);
  return db;
}

// Try to re-initialize DB from previously stored schema (on page load)
export async function initDbFromSchema(): Promise<ExcelBackendDB | null> {
  if (db) return db;

  // Open with just __meta table first
  const tempDb = new ExcelBackendDB([]);
  await tempDb.open();

  try {
    const schema = await tempDb.__meta.get("schema");
    if (schema?.resources) {
      // Re-initialize with all tables
      db = new ExcelBackendDB(schema.resources);
      return db;
    }
  } catch (err) {
    console.error("Failed to load schema:", err);
  }

  return null;
}

// Get or initialize DB
export async function getDb(): Promise<ExcelBackendDB | null> {
  if (db) return db;
  return initDbFromSchema();
}