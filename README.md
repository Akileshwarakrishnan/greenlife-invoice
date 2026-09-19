# GreenLife Natural Foods — AI Automated Invoice System

A production-ready enterprise web application for **GreenLife Natural Foods** managing customers, organic food products, dynamic orders, PDF invoice generation, payment records, AI-powered invoice extraction, and automated email/WhatsApp notifications orchestrated via **n8n**.

---

## Architecture & Flow

```text
                  LOGIN (JWT Auth)
                         ↓
                     DASHBOARD
                         ↓
                     NEW ORDER
                         ↓
               Select Customer & Products
                         ↓
               Real-Time Amount Calculation
                         ↓
                   CREATE ORDER
                         ↓
                      FastAPI
                         ↓
                    PostgreSQL
                         ↓
                        n8n
                         ↓
                 Generate Invoice & PDF
                         ↓
                  Save Invoice Record
                         ↓
               ┌─────────┴─────────┐
               ↓                   ↓
             EMAIL              WHATSAPP
               ↓                   ↓
               └─────────┬─────────┘
                         ↓
              Customer Receives Invoice
```

---

## Key Features

1. **Role-Based Access Control (RBAC)**:
   - `Admin`: Full access to users, settings, analytics, product catalog, customer records, and automation.
   - `Staff`: Create orders, view inventory, record payments, and manage customer orders.
   - Pre-seeded accounts:
     - **Admin**: `admin@greenlife.com` / `admin123`
     - **Staff**: `staff@greenlife.com` / `staff123`

2. **Rigorous Server-Side Order Calculations**:
   - $\text{Subtotal} = \sum (\text{Qty} \times \text{Rate} - \text{Discount})$
   - $\text{Tax} = \sum \text{Item GST}$
   - $\text{Grand Total} = \text{Subtotal} + \text{Previous Balance} + \text{Courier} + \text{Tax} - \text{Order Discount}$
   - Real-time client preview validated by backend calculation endpoint (`/api/orders/calculate`).

3. **Professional ReportLab PDF Invoices**:
   - Generates crisp vector PDFs with executive enterprise styling (Deep Navy `#0F172A`, Indigo accent `#4F46E5`, crisp Slate `#334155`), UPI payment reference (`greenlife@okaxis`), bank details, itemized breakdown, and terms.
   - Downloadable and viewable directly in browser.

4. **n8n Automation Layer**:
   - Five complete, production-ready workflow JSONs included in `n8n/workflows/`:
     1. `01_order_processing.json`
     2. `02_email_invoice.json`
     3. `03_whatsapp_notification.json`
     4. `04_ai_invoice_extraction.json`
     5. `05_error_handler_dlq.json`
   - Built-in automatic mock fallback (`N8N_MOCK_FALLBACK=true`): allows local development and testing even if an n8n daemon is not currently active.
   - Detailed workflow documentation available in `docs/WORKFLOWS.md`.

5. **AI Invoice OCR & Business Assistant**:
   - **AI Invoice Extraction**: Upload scanned PDFs or images of old receipts/invoices. The multimodal parser extracts customer info, items, quantities, prices, courier, and balances. The user reviews and edits values before clicking **"Convert to Draft Order"**.
   - **AI Business Assistant**: Ask natural language operational questions such as:
     - *"What was Ravi Kumar's last order?"*
     - *"Show me this month's sales summary."*
     - *"Which products have low stock?"*
     Controlled backend functions safely query data without arbitrary SQL execution.
   - Configurable for OpenAI, Ollama, LM Studio, or local models.

6. **Payment Management & Ledger**:
   - Separate payments ledger (`payments` table) recording UPI, GPay, Bank Transfer, Card, and Cash.
   - Auto-updates balance due and transitions invoice status (`pending` → `partially_paid` → `paid`).

7. **Analytics & Reports**:
   - Daily, weekly, and monthly sales performance.
   - Top products by revenue and volume sold.
   - Customer purchase rankings and outstanding balances.
   - One-click CSV export and printable statements.

8. **Audit Trail**:
   - Immutable audit logging for logins, orders, invoices, payments, and workflow triggers.

9. **Structured Documentation**:
   - Comprehensive technical guides located in `docs/`:
     - [Architecture & Design](file:///docs/ARCHITECTURE.md)
     - [REST API Reference](file:///docs/API_REFERENCE.md)
     - [n8n Automation Workflows](file:///docs/WORKFLOWS.md)

---

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4 Modern SaaS Design System, React Router, Lucide Icons, Recharts, Axios.
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy, Pydantic v2, python-jose (JWT), passlib (bcrypt), ReportLab Pure-Python Engine.
- **Database**: PostgreSQL 16 (with automatic SQLite fallback for instant zero-config local run).
- **Automation**: n8n workflow orchestration engine.
- **Containerization**: Docker & Docker Compose.

---

## Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows (or source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- Open `http://localhost:5173` in your browser.
- Log in with `admin@greenlife.com` / `admin123` or click the **Admin Demo** button.

---

## Docker Deployment

To launch the complete system with PostgreSQL, FastAPI backend, n8n, and React frontend:

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **FastAPI API & Docs**: `http://localhost:8000/docs`
- **n8n Workflow Console**: `http://localhost:5678`
- **PostgreSQL Database**: Port `5432`

---

## Running Automated Tests

Run the test suite verifying calculation logic, authentication, and endpoints:

```bash
cd backend
.\venv\Scripts\pytest
```

---

## License

Proprietary — Developed for GreenLife Natural Foods.
