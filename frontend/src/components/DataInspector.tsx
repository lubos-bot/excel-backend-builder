import { useState, useEffect, useCallback } from "react";
import { getDb } from "../db/database";

interface TableInfo {
  name: string;
  count: number;
}

interface SchemaInfo {
  key: string;
  resources: string[];
  uploadedAt: string;
}

export function DataInspector() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [schema, setSchema] = useState<SchemaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTables = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const database = await getDb();
      if (!database) {
        setTables([]);
        setSchema(null);
        setLoading(false);
        return;
      }

      // Get schema
      const schemaData = await database.__meta.get("schema");
      setSchema(schemaData || null);

      if (schemaData?.resources) {
        const tableInfos: TableInfo[] = [];

        for (const name of schemaData.resources) {
          const table = (database as any)[name];
          if (table) {
            const count = await table.count();
            tableInfos.push({ name, count });
          }
        }

        setTables(tableInfos);
      }
    } catch (err) {
      console.error("Failed to load tables:", err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTables();
  }, [refreshTables]);

  const loadTableData = async (tableName: string) => {
    const database = await getDb();
    if (!database) return;

    setLoading(true);
    try {
      const table = (database as any)[tableName];
      if (table) {
        const data = await table.toArray();
        setRows(data);
        setSelectedTable(tableName);
      }
    } catch (err) {
      console.error("Failed to load table data:", err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    const database = await getDb();
    if (!database || !confirm("Are you sure you want to clear all data?")) return;

    try {
      await database.delete();
      setTables([]);
      setRows([]);
      setSelectedTable(null);
      setSchema(null);
      alert("All data cleared!");
    } catch (err) {
      console.error("Failed to clear data:", err);
      setError(String(err));
    }
  };

  if (loading && tables.length === 0) {
    return (
      <div className="inspector-container">
        <p>Loading stored data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inspector-container">
        <p className="error">Error: {error}</p>
        <button className="btn" onClick={refreshTables}>Retry</button>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="inspector-empty">
        <p>No data loaded yet.</p>
        <p>Upload an Excel file to get started.</p>
      </div>
    );
  }

  return (
    <div className="inspector-container">
      <div className="inspector-header">
        <h3>📊 IndexedDB Inspector</h3>
        <div>
          <button className="btn" onClick={refreshTables}>
            Refresh
          </button>
          <button className="btn btn-danger" onClick={clearAllData}>
            Clear All
          </button>
        </div>
      </div>

      {schema && (
        <div className="schema-info">
          <strong>Uploaded:</strong> {new Date(schema.uploadedAt).toLocaleString()}
        </div>
      )}

      <div className="table-list">
        <strong>Resources:</strong>
        {tables.map(t => (
          <button
            key={t.name}
            onClick={() => loadTableData(t.name)}
            className={`table-btn ${selectedTable === t.name ? "active" : ""}`}
          >
            {t.name} <span className="count">({t.count})</span>
          </button>
        ))}
      </div>

      {loading && <p className="loading">Loading...</p>}

      {selectedTable && rows.length > 0 && (
        <div className="data-table-wrapper">
          <h4>📋 {selectedTable} ({rows.length} rows)</h4>
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(rows[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((row, i) => (
                  <tr key={row.id || i}>
                    {Object.values(row).map((val: any, j) => (
                      <td key={j}>
                        {val === null ? <span className="null">null</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && (
              <p className="truncated">Showing first 100 of {rows.length} rows</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}