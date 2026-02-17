import { useState, useCallback } from "react";
import { ExcelUploader } from "./components/ExcelUploader";
import { DataInspector } from "./components/DataInspector";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = useCallback(() => {
    // Increment key to force DataInspector to re-initialize
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div className="app">
      <h1>📊 Excel Backend Builder</h1>
      <p>Upload Excel → Convert to JSON → Persist in IndexedDB</p>
      <ExcelUploader onUploadComplete={handleUploadComplete} />
      <DataInspector key={refreshKey} />
    </div>
  );
}

export default App;