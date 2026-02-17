import { ExcelUploader } from "./components/ExcelUploader";

function App() {
  return (
    <div style={{ padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1>Excel Backend Builder</h1>
      <p>Upload Excel → Convert to JSON → Persist in IndexedDB</p>
      <ExcelUploader />
    </div>
  );
}

export default App;