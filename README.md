# SpecLens-AI

**SpecLens AI** is an AI-powered compliance copilot for general-purpose technical PDFs, engineering specifications, and regulatory standards.

It ingests technical documentation with **strict 1-indexed page preservation** and block-level layout coordinates using PyMuPDF, providing zero-hallucination citations and seamless compliance audits powered by **NVIDIA Nemotron** models through **Nebius Token Factory**.

---

## 🏛️ Phase 1 Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React + TypeScript + Vite + Tailwind                 │
│  - SpecLens AI Compliance Console                                      │
│  - Live Backend Health & Nebius Token Factory Status Badges            │
│  - Drag-and-Drop Technical PDF Ingestion Zone                          │
│  - 1-Indexed Page Explorer & Bounding-Box Layout Inspector             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / Vite Proxy
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (CPython 3.11 via uv)                │
│  - GET  /health                  -> System & Nebius status             │
│  - POST /api/documents/upload    -> PyMuPDF extraction & validation    │
│  - GET  /api/llm/status          -> Safe token factory status          │
│  - POST /api/llm/test-connection -> Live Nebius connection verification│
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐      ┌───────────────────────────────┐
       │   PyMuPDF (fitz)       │      │   Nebius Token Factory        │
       │   - 1-Indexed Pages    │      │   - NVIDIA Nemotron Models    │
       │   - Bounding Boxes     │      │   - OpenAI-Compatible API     │
       │   - Catalog Metadata   │      │   - Server-Side Secret Shield │
       └────────────────────────┘      └───────────────────────────────┘
```

---

## 📋 Prerequisites

* **Python:** CPython 3.11 (Managed cleanly via `uv` to ensure pre-compiled PyMuPDF wheel compatibility)
* **Package Manager:** `uv` (v0.12+)
* **Node.js:** v20+ (Tested on v25.9)
* **npm:** v10+ (Tested on v11.19)

---

## 🚀 Quickstart & Manual Execution Commands (PowerShell)

### 1. Backend Setup & Automated Tests

Open a PowerShell terminal in the repository root (`G:\Nvidia Devpost\SpecLens-AI`):

```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create the Python 3.11 virtual environment using uv
uv venv --python 3.11 .venv

# 3. Install backend dependencies into the virtual environment
uv pip install -r requirements.txt --python .venv

# 4. Run automated test suite (13 passing tests)
.venv\Scripts\pytest -v

# 5. Start the FastAPI development server
.venv\Scripts\uvicorn app.main:app --reload --port 8000 --host 127.0.0.1
```

* Backend will be live at: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 2. Frontend Setup & Launch

Open a second PowerShell terminal in `G:\Nvidia Devpost\SpecLens-AI`:

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Run production build check
npm run build

# 4. Start the Vite development server
npm run dev
```

* Frontend application will be live at: [http://localhost:5173](http://localhost:5173)

---

### 3. Verify Endpoints via PowerShell

You can test the running backend directly from PowerShell:

#### Health Check:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" | ConvertTo-Json
```

#### Upload & Extract a PDF:
```powershell
$filePath = "path\to\your\specification.pdf"
$form = @{
    file = Get-Item -Path $filePath
}
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/documents/upload" -Method Post -Form $form | ConvertTo-Json -Depth 5
```

---

## 🔐 Nebius Token Factory & NVIDIA Nemotron Integration

Nebius Token Factory provides high-throughput inference for NVIDIA open models. 

1. Copy `backend/.env.example` to `backend/.env`:
   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```
2. Open `backend/.env` and insert your Nebius API Key:
   ```ini
   NEBIUS_API_KEY="your-nebius-token-factory-key"
   NEBIUS_BASE_URL="https://api.tokenfactory.nebius.com/v1"
   NEBIUS_MODEL="nvidia/nemotron-3-nano-30b"
   ```
3. **Security Guarantee:** Credentials remain strictly server-side inside `backend/.env`. The client-side React code never receives or stores your API key. If no key is set, SpecLens AI operates safely in offline PDF extraction mode without crashing.

---

## 🧪 Phase 1 Test Coverage

The test suite validates:
* `GET /health` root and `/api/health` contracts.
* `GET /api/llm/status` secret masking (ensures no keys are leaked).
* 1-indexed page preservation on single-page and multi-page technical PDFs.
* Extraction of block-level bounding boxes `[x0, y0, x1, y1]`, line counts, and word statistics.
* Edge-case validations:
  * Empty file uploads (`HTTP 400`)
  * Non-PDF file extensions (`HTTP 400`)
  * Corrupted / invalid PDF header bytes (`HTTP 400` / `HTTP 422`)
  * Oversized uploads exceeding 25MB (`HTTP 413`)