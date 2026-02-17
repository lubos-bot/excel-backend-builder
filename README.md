# Excel Backend Builder

Upload Excel → Convert to JSON → Persist in IndexedDB

## Phase 1 Features

- ✅ Excel file upload (.xlsx, .xls)
- ✅ Sheets converted to JSON
- ✅ One IndexedDB table per sheet
- ✅ Rows persisted locally
- ✅ Schema metadata stored

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and upload an Excel file.

## Project Structure

```
frontend/src/
├─ db/
│  └─ database.ts       # Dexie IndexedDB setup
├─ excel/
│  └─ excelParser.ts    # Excel → JSON conversion
├─ components/
│  └─ ExcelUploader.tsx # File upload component
├─ types/
│  └─ schema.ts         # TypeScript types
├─ App.tsx
└─ main.tsx
```

## Upcoming: Phase 2

- Mock REST API layer
- Query engine
- API playground UI

## License

MIT