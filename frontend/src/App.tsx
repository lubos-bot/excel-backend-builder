import { ExcelUploader } from "./components/ExcelUploader";
import { DataInspector } from "./components/DataInspector";

function App() {
  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      <h1>📊 Excel Backend Builder</h1>
      <p>Upload Excel → Convert to JSON → Persist in IndexedDB</p>
      <ExcelUploader />
      <DataInspector />
    </div>
  );
}

export default App;