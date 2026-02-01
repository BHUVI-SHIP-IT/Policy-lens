# PDF Upload Feature

## What's New

✅ **Upload insurance policy PDFs** instead of just pasting text
✅ **Automatic text extraction** from PDF documents
✅ **AI analysis** works with uploaded PDFs

## How It Works

### Frontend ([dashboard.tsx](client/src/pages/dashboard.tsx))
- New "Upload PDF" button next to "Analyze Policy"
- Accepts `.pdf` files (max 10MB)
- Shows upload progress with spinner
- Automatically populates textarea with extracted text
- Toast notifications for success/errors

### Backend ([routes.ts](server/routes.ts))
- **Endpoint**: `POST /api/upload/pdf`
- Uses `multer` for file handling (in-memory storage)
- Uses `pdf-parse` library for text extraction
- Returns: `{ text, numPages, fileName, info }`

### PDF Parser ([pdf-parser.ts](server/pdf-parser.ts))
- Extracts text from PDF buffers
- Cleans extracted text (removes extra spaces, newlines)
- Returns metadata (page count, title, author)

## Usage

1. **Go to Dashboard** → Click "Upload PDF"
2. **Select a PDF** → Insurance policy document
3. **Text extracted** → Automatically fills textarea
4. **Click "Analyze Policy"** → AI analyzes the PDF content
5. **View results** → Same as text analysis

## Features

- ✅ 10MB file size limit
- ✅ PDF validation (only `.pdf` files accepted)
- ✅ Clean text extraction (removes formatting artifacts)
- ✅ Loading states during upload
- ✅ Error handling with user-friendly messages
- ✅ Works with multi-page PDFs
- ✅ No file storage (processed in memory for privacy)

## Security

- Files processed in-memory (not saved to disk)
- 10MB size limit prevents abuse
- PDF-only validation
- Privacy-first: no raw PDFs stored in database

## Testing

1. Find any insurance policy PDF
2. Upload it using the "Upload PDF" button
3. Verify text appears in textarea
4. Run AI analysis
5. Check results match PDF content
