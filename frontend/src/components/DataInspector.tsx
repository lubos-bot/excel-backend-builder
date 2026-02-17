import { useState, useEffect } from "react";
import { db } from "../db/database";

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
  const [loading, setLoading] = useState(false);

  const refreshTables = async () => {
    if (!db) return;

    setLoading(true);
    try {
      // Get schema
      const schemaData = await db.__meta.get("schema");
      setSchema(schemaData || null);

      if (schemaData?.resources) {
        const tableInfos: TableInfo[] = [];

        for (const name of schemaData.resources) {
          const table = (db as any)[name];
          if (table) {
            const count = await table.count();
            tableInfos.push({ name, count });
          }
        }

        setTables(tableInfos);
      }
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTables();
  }, []);

  const loadTableData = async (tableName: string) => {
    if (!db) return;

    setLoading(true);
    try {
      const table = (db as any)[tableName];
      if (table) {
        const data = await table.toArray();
        setRows(data);
        setSelectedTable(tableName);
      }
    } catch (err) {
      console.error("Failed to load table data:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!db || !confirm("Are you sure you want to clear all data?")) return;

    try {
      await db.delete();
      await db.open();
      setTables([]);
      setRows([]);
      setSelectedTable(null);
      setSchema(null);
      alert("All data cleared!");
    } catch (err) {
      console.error("Failed to clear data:", err);
    }
  };

  if (tables.length === 0 && !loading) {
    return (
      <div style={styles.empty}>
        <p>No data loaded yet.</p>
        <p style={{ color: "#666" }}>Upload an Excel file to get started.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>📊 IndexedDB Inspector</h3>
        <div>
          <button onClick={refreshTables} style={styles.button}>
            Refresh
          </button>
          <button onClick={clearAllData} style={{ ...styles.button, ...styles.danger }}>
            Clear All
          </button>
        </div>
      </div>

      {schema && (
        <div style={styles.schemaInfo}>
          <strong>Uploaded:</strong> {new Date(schema.uploadedAt).toLocaleString()}
        </div>
      )}

      <div style={styles.tableList}>
        <strong>Resources:</strong>
        {tables.map(t => (
          <button
            key={t.name}
            onClick={() => loadTableData(t.name)}
            style={{
              ...styles.tableButton,
              ...(selectedTable === t.name ? styles.tableButtonActive : {})
            }}
          >
            {t.name} <span style={styles.count}>({t.count})</span>
          </button>
        ))}
      </div>

      {loading && <p style={styles.loading}>Loading...</p>}

      {selectedTable && rows.length > 0 && (
        <div style={styles.tableWrapper}>
          <h4>📋 {selectedTable} ({rows.length} rows)</h4>
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {Object.keys(rows[0]).map(key => (
                    <th key={key} style={styles.th}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((row, i) => (
                  <tr key={row.id || i}>
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} style={styles.td}>
                        {val === null ? <span style={{ color: "#999" }}>null</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && (
              <p style={styles.truncated}>Showing first 100 of {rows.length} rows</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: 30,
    padding: 20,
    background: "#f8f9fa",
    borderRadius: 8,
    border: "1px solid #dee2e6",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  button: {
    padding: "6px 12px",
    marginRight: 8,
    border: "1px solid #ccc",
    borderRadius: 4,
    background: "#fff",
    cursor: "pointer",
  },
  danger: {
    background: "#fff",
    borderColor: "#dc3545",
    color: "#dc3545",
  },
  schemaInfo: {
    marginBottom: 15,
    padding: 10,
    background: "#e3f2fd",
    borderRadius: 4,
    fontSize: 14,
  },
  tableList: {
    marginBottom: 15,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  tableButton: {
    padding: "8px 16px",
    border: "1px solid #007bff",
    borderRadius: 20,
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
  },
  tableButtonActive: {
    background: "#007bff",
    color: "#fff",
  },
  count: {
    opacity: 0.7,
    fontSize: 12,
  },
  loading: {
    color: "#666",
    fontStyle: "italic",
  },
  empty: {
    marginTop: 30,
    padding: 20,
    background: "#f8f9fa",
    borderRadius: 8,
    textAlign: "center",
    color: "#666",
  },
  tableWrapper: {
    marginTop: 20,
  },
  tableScroll: {
    overflowX: "auto",
    marginTop: 10,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    background: "#007bff",
    color: "#fff",
    padding: "10px 12px",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #dee2e6",
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  truncated: {
    marginTop: 10,
    color: "#666",
    fontSize: 13,
    fontStyle: "italic",
  },
};