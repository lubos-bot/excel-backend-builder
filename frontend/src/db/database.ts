import Dexie, { type Table } from "dexie";

export class ExcelBackendDB extends Dexie {
  __meta!: Table<any, string>;

  constructor(resourceNames: string[]) {
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

export function initDb(resourceNames: string[]) {
  db = new ExcelBackendDB(resourceNames);
  return db;
}