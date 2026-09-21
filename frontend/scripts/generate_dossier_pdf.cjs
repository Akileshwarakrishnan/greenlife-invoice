const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GreenLife Natural Foods - System Specification Dossier</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=JetBrains+Mono:wght@400;500;700&display=swap');

  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
  }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    color: #1C1A15;
    background: #FFFFFF;
    font-size: 10pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page-break {
    page-break-after: always;
    break-after: page;
  }

  /* ── COVER PAGE ── */
  .cover-page {
    min-height: 95vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: radial-gradient(circle at 80% 20%, #204E38 0%, #132E21 50%, #08150E 100%);
    color: #FFFFFF;
    padding: 44px 38px;
    border-radius: 16px;
    page-break-after: always;
    break-after: page;
  }

  .cover-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    border-radius: 9999px;
    background: rgba(198, 139, 58, 0.25);
    border: 1px solid #C68B3A;
    color: #F8D595;
    font-size: 9pt;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    width: fit-content;
  }

  .cover-title-group h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 32pt;
    line-height: 1.15;
    margin: 20px 0 12px 0;
    font-weight: 900;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }

  .cover-title-group .subtitle {
    font-size: 13pt;
    color: #A3C9A8;
    font-weight: 500;
    margin: 0 0 24px 0;
    line-height: 1.4;
  }

  .cover-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 30px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    overflow: hidden;
  }

  .cover-table td {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 9pt;
  }
  .cover-table tr:last-child td { border-bottom: none; }
  .cover-table .label { color: #A3C9A8; font-weight: 700; width: 32%; }
  .cover-table .value { color: #FFFFFF; font-weight: 600; }

  /* ── HEADINGS & TYPOGRAPHY ── */
  h1.section-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 19pt;
    color: #1B3A2A;
    border-bottom: 2.5px solid #2D6A4F;
    padding-bottom: 8px;
    margin-top: 0;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  h2.subsection-title {
    font-size: 12pt;
    font-weight: 800;
    color: #2D6A4F;
    margin-top: 20px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  h3.subsubsection-title {
    font-size: 10pt;
    font-weight: 700;
    color: #1C1A15;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  p { margin: 0 0 10px 0; }

  /* ── CARDS & CALLOUTS ── */
  .callout {
    background: #F4F8F5;
    border-left: 4px solid #2D6A4F;
    padding: 12px 16px;
    border-radius: 0 10px 10px 0;
    margin: 14px 0;
    font-size: 9.5pt;
  }

  .callout-amber {
    background: #FDF9F2;
    border-left: 4px solid #C68B3A;
    padding: 12px 16px;
    border-radius: 0 10px 10px 0;
    margin: 14px 0;
    font-size: 9.5pt;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 14px 0;
  }

  .metric-card {
    background: #F7F5EF;
    border: 1px solid #EEEAE0;
    border-radius: 12px;
    padding: 12px 14px;
  }

  .metric-card .title {
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #2D6A4F;
    letter-spacing: 0.05em;
  }

  .metric-card .value {
    font-size: 13pt;
    font-weight: 900;
    color: #1C1A15;
    margin: 4px 0 2px 0;
  }

  /* ── TABLES ── */
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 8.5pt;
    border: 1px solid #E2E8F0;
    border-radius: 8px;
    overflow: hidden;
  }

  table.data-table th {
    background: #1B3A2A;
    color: #FFFFFF;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  table.data-table td {
    padding: 7px 10px;
    border-bottom: 1px solid #EEEAE0;
    vertical-align: top;
  }

  table.data-table tr:nth-child(even) td {
    background: #FBFBFA;
  }

  /* ── CODE & BADGES ── */
  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8pt;
    background: #EEEAE0;
    padding: 2px 4px;
    border-radius: 4px;
    color: #1C1A15;
  }

  pre {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    background: #0E1B13;
    color: #D1DDD4;
    padding: 10px 12px;
    border-radius: 8px;
    overflow-x: auto;
    line-height: 1.45;
    margin: 10px 0;
    border: 1px solid #1C3324;
  }

  .pill {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 7.5pt;
    font-weight: 800;
    text-transform: uppercase;
  }
  .pill-green { background: #EBF5EE; color: #2D6A4F; border: 1px solid #B7D9C4; }
  .pill-gold { background: #FDF3E3; color: #97651C; border: 1px solid #E6CA9B; }
  .pill-dark { background: #1B3A2A; color: #FFFFFF; }

  /* ── FLOW DIAGRAM BOXES ── */
  .flow-step-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 14px 0;
  }

  .flow-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #FFFFFF;
    border: 1.5px solid #EEEAE0;
    border-radius: 10px;
    padding: 9px 12px;
  }

  .flow-step-num {
    width: 24px;
    height: 24px;
    background: #2D6A4F;
    color: white;
    font-weight: 800;
    font-size: 9pt;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .flow-step-body h4 {
    margin: 0 0 2px 0;
    font-size: 9pt;
    font-weight: 800;
    color: #1C1A15;
  }

  .flow-step-body p {
    margin: 0;
    font-size: 8.5pt;
    color: #4A4740;
  }
</style>
</head>
<body>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- 1. COVER PAGE -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="cover-page">
  <div>
    <div class="cover-badge">🌿 Master System Specification</div>
    <div class="cover-title-group" style="margin-top: 40px;">
      <h1>GreenLife Natural Foods</h1>
      <div class="subtitle">Cloud Retail POS Billing, Customer Ledger, WhatsApp Invoicing & AI Platform</div>
      <p style="color: rgba(255, 255, 255, 0.85); max-width: 600px; font-size: 9.5pt; line-height: 1.6;">
        A comprehensive unified engineering dossier compiling the Product Requirements Document (PRD), Technical Requirements Document (TRD), Application Flow, Dual-Viewport UI/UX Design System, Database Schema, and Execution Plan.
      </p>
    </div>
  </div>

  <div>
    <table class="cover-table">
      <tr>
        <td class="label">Project Code</td>
        <td class="value"><code>GL-POS-2026</code> · Production Release</td>
      </tr>
      <tr>
        <td class="label">Primary Architect</td>
        <td class="value">Akileshwarakrishnan</td>
      </tr>
      <tr>
        <td class="label">Operating Location</td>
        <td class="value">Kangeyam, Tirupur District, Tamil Nadu, India</td>
      </tr>
      <tr>
        <td class="label">Deployment Stack</td>
        <td class="value">React 19 + Vite (Vercel) · FastAPI Python 3.12 (Render) · SQLite / Postgres</td>
      </tr>
      <tr>
        <td class="label">Target Viewports</td>
        <td class="value">Desktop / Laptop (Workbench Split) · Mobile Phone (Leafora Botanical Glass)</td>
      </tr>
      <tr>
        <td class="label">Date & Version</td>
        <td class="value">September 2026 · Version 2.4.0 (Production Stable)</td>
      </tr>
    </table>
    <div style="margin-top: 25px; font-size: 8pt; color: rgba(255, 255, 255, 0.5); text-align: center;">
      Confidential & Proprietary · GreenLife Natural Foods Billing & Ledger Ecosystem
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- 2. EXECUTIVE SUMMARY & TABLE OF CONTENTS -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="page-break">
  <h1 class="section-title">Table of Contents & Executive Summary</h1>

  <div class="callout">
    <strong>Executive Overview:</strong> GreenLife Natural Foods is a modern, high-speed retail management and point-of-sale (POS) web application designed specifically for organic food retail, cold-pressed oil mills, and traditional health product stores in Tamil Nadu. The platform bridges fast, offline-capable counter operations with modern digital customer engagement (bilingual Tamil/English invoices, instant 1-tap WhatsApp sharing, pending balance debt tracking, and AI camera receipt ingestion).
  </div>

  <h2 class="subsection-title">Dossier Structure</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 15%;">Section</th>
        <th style="width: 45%;">Module Title</th>
        <th style="width: 40%;">Core Scope & Focus</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Section 1</strong></td>
        <td><strong>Product Requirements Document (PRD)</strong></td>
        <td>Business vision, target personas, functional requirements matrix, GST tax rules, and bilingual capabilities.</td>
      </tr>
      <tr>
        <td><strong>Section 2</strong></td>
        <td><strong>Technical Requirements Document (TRD)</strong></td>
        <td>Software architecture, FastAPI backend, Vite React frontend, security & auth (JWT), PDF generator engine, and caching.</td>
      </tr>
      <tr>
        <td><strong>Section 3</strong></td>
        <td><strong>Application Flow & User Journeys</strong></td>
        <td>Step-by-step state machine for 60-second billing, customer debt recovery, WhatsApp direct delivery, and mobile drawer flows.</td>
      </tr>
      <tr>
        <td><strong>Section 4</strong></td>
        <td><strong>UI/UX Design Brief & Architecture</strong></td>
        <td>Dual-viewport philosophy: Desktop Workbench vs. Mobile Leafora Dark Botanical Glassmorphism with floating dock.</td>
      </tr>
      <tr>
        <td><strong>Section 5</strong></td>
        <td><strong>Backend Database Schema & ER Model</strong></td>
        <td>Complete relational SQL schema, indexes, cascade rules, and field dictionaries for all 10 entity models.</td>
      </tr>
      <tr>
        <td><strong>Section 6</strong></td>
        <td><strong>Implementation Plan & QA Verification</strong></td>
        <td>Milestone breakdown, Pytest & Playwright test suites, and Vercel/Render production deployment SOP.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">Core Business Differentiators</h2>
  <div class="grid-2">
    <div class="metric-card">
      <div class="title">Bilingual Operation</div>
      <div class="value">Tamil & English</div>
      <p style="font-size: 8.5pt; color: #4A4740; margin-top: 4px;">
        100% native Tamil UI strings, bilingual product labels (நாட்டு சர்க்கரை / Country Sugar), and localized WhatsApp receipts.
      </p>
    </div>
    <div class="metric-card">
      <div class="title">Debt & Ledger Balance</div>
      <div class="value">Live Auto-Carry</div>
      <p style="font-size: 8.5pt; color: #4A4740; margin-top: 4px;">
        Tracks credit/dues per customer. Previous unpaid balances automatically pull into new bills with 1-click settlement.
      </p>
    </div>
    <div class="metric-card">
      <div class="title">Dual Viewport UX</div>
      <div class="value">Zero Compromise</div>
      <p style="font-size: 8.5pt; color: #4A4740; margin-top: 4px;">
        Desktop retains wide analytical 4-column workbench; Mobile phone switches to Leafora floating glass dock and sticky POS checkout.
      </p>
    </div>
    <div class="metric-card">
      <div class="title">Zero-Click WhatsApp</div>
      <div class="value">Instant Delivery</div>
      <p style="font-size: 8.5pt; color: #4A4740; margin-top: 4px;">
        Backend server-side and browser fallback WhatsApp URL generation with formatted Tamil invoice text.
      </p>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- 3. SECTION 1: PRD -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="page-break">
  <h1 class="section-title">1. Product Requirements Document (PRD)</h1>

  <h2 class="subsection-title">1.1 Problem Statement & Background</h2>
  <p>
    Small and medium organic grocery businesses and traditional cold-pressed oil shops in Tamil Nadu face specific operational challenges that generic POS software fails to address:
  </p>
  <ul>
    <li><strong>Language Barrier:</strong> Store attendants and retail customers predominantly speak Tamil. Complex billing software causes input delays and transaction errors.</li>
    <li><strong>Customer Trust & Dues Tracking (பாக்கி முறை):</strong> Retail customers in towns like Kangeyam frequently purchase on partial credit. Traditional shops track this in manual paper notebooks, leading to lost revenue and disputed balances.</li>
    <li><strong>Digital Receipt Friction:</strong> Customers expect instant WhatsApp receipts instead of physical thermal paper that fades and causes paper waste.</li>
    <li><strong>Device Duality:</strong> Billing is performed on laptops/desktops at the counter, but shop owners manage inventory and check collections on mobile phones while on the move or visiting farms.</li>
  </ul>

  <h2 class="subsection-title">1.2 User Personas</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 20%;">Persona</th>
        <th style="width: 25%;">Role & Context</th>
        <th style="width: 55%;">Key Objectives & Workflows</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Store Owner / Admin</strong></td>
        <td>Owner of GreenLife Store. Monitors profit, collections, and catalog.</td>
        <td>Review daily sales, check outstanding customer dues, add new organic items, adjust pricing, export sales reports, and track staff activities.</td>
      </tr>
      <tr>
        <td><strong>Billing Staff</strong></td>
        <td>Counter attendant operating billing hardware under time pressure.</td>
        <td>Generate invoices under 60 seconds, tap popular catalog items, add new customer phone numbers on-the-fly, and print or WhatsApp receipts.</td>
      </tr>
      <tr>
        <td><strong>Retail Customer</strong></td>
        <td>Regular organic food consumer receiving bills.</td>
        <td>Receives clean WhatsApp PDF receipts in Tamil, reviews breakdown of current items + past carried balance, and verifies UPI payment.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">1.3 Feature Matrix & Scope</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Module</th>
        <th>Capability</th>
        <th>Priority</th>
        <th>Specification</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Fast POS Billing</strong></td>
        <td>Catalog Quick-Tap</td>
        <td><span class="pill pill-green">P0 - Core</span></td>
        <td>8 pre-loaded fast buttons + search dropdown. Auto-calculates rate × quantity.</td>
      </tr>
      <tr>
        <td><strong>Arithmetic Engine</strong></td>
        <td>Compound Totals</td>
        <td><span class="pill pill-green">P0 - Core</span></td>
        <td><code>(Subtotal - Discount) + Previous Balance + Courier Charges = Grand Total</code>.</td>
      </tr>
      <tr>
        <td><strong>Customer Ledger</strong></td>
        <td>Balance Tracking</td>
        <td><span class="pill pill-green">P0 - Core</span></td>
        <td>Real-time balance carried over across successive bills until fully settled.</td>
      </tr>
      <tr>
        <td><strong>Document Engine</strong></td>
        <td>PDF Generator</td>
        <td><span class="pill pill-green">P0 - Core</span></td>
        <td>A4 and thermal 80mm printable tax invoices via ReportLab with Tamil support.</td>
      </tr>
      <tr>
        <td><strong>Mobile App UX</strong></td>
        <td>Botanical Dock</td>
        <td><span class="pill pill-gold">P1 - High</span></td>
        <td>Leafora theme with floating bottom dock, sticky checkout, and mobile cards.</td>
      </tr>
      <tr>
        <td><strong>AI / OCR Scan</strong></td>
        <td>Paper Slip Parser</td>
        <td><span class="pill pill-gold">P1 - High</span></td>
        <td>Upload photo of handwritten slip or paste raw WhatsApp text; auto-extracts items.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- 4. SECTION 2: TRD -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="page-break">
  <h1 class="section-title">2. Technical Requirements Document (TRD)</h1>

  <h2 class="subsection-title">2.1 System Architecture & Tech Stack</h2>
  <p>
    The system follows a decoupled Client-Server REST architecture with strict separation between user interface rendering and backend domain arithmetic.
  </p>

  <div class="callout">
    <strong>Architecture Diagram:</strong><br>
    <code>[ React 19 Frontend (Vercel) ] &lt;== HTTPS / REST JWT ==&gt; [ FastAPI Backend (Render) ] &lt;== SQLAlchemy ==&gt; [ SQLite / PostgreSQL DB ]</code>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Layer</th>
        <th style="width: 35%;">Technology</th>
        <th style="width: 40%;">Architectural Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Client Layer</strong></td>
        <td>React 19, TypeScript, Vite, Tailwind CSS v4</td>
        <td>Ultra-fast client SPA, responsive layout engine, bilingual state context.</td>
      </tr>
      <tr>
        <td><strong>API Service</strong></td>
        <td>FastAPI (Python 3.12), Uvicorn</td>
        <td>Asynchronous REST API, high throughput, automatic OpenAPI/Swagger docs.</td>
      </tr>
      <tr>
        <td><strong>ORM & Persistence</strong></td>
        <td>SQLAlchemy 2.0, Alembic, SQLite</td>
        <td>Type-safe data modeling, transactional ACID integrity, foreign key cascades.</td>
      </tr>
      <tr>
        <td><strong>Document Engine</strong></td>
        <td>ReportLab 4.x</td>
        <td>Pixel-precise PDF invoice generation with embedded Unicode Tamil glyphs.</td>
      </tr>
      <tr>
        <td><strong>Security & Auth</strong></td>
        <td>OAuth2 Bearer, PyJWT, Passlib (Bcrypt)</td>
        <td>Cryptographically signed token authentication, role authorization (Admin/Staff).</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">2.2 API Specifications & Endpoints</h2>
  <pre>
# Authentication
POST   /api/auth/login             -> Returns JWT token, role, user details
GET    /api/auth/me                -> Returns current authenticated user context

# Customer Management & Ledger
GET    /api/customers              -> List customers (search by name, phone, city)
POST   /api/customers              -> Create new customer with auto CUST-XXXX code
PUT    /api/customers/{id}         -> Update customer profile or previous balance

# Product Catalog
GET    /api/products               -> List catalog items with bilingual names and prices
POST   /api/products               -> Create or update product details & stock

# Orders & Invoicing (Transactional Core)
POST   /api/orders                 -> Atomic order creation with auto invoice generation
GET    /api/invoices               -> List invoices with status filter (paid, pending, partial)
GET    /api/invoices/{id}/pdf      -> Download or stream printable ReportLab PDF
POST   /api/invoices/{id}/resend   -> Trigger WhatsApp or Email delivery

# Payments & Settlement
POST   /api/payments               -> Record payment toward customer due balance
  </pre>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- 5. SECTION 3: APPLICATION FLOW -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="page-break">
  <h1 class="section-title">3. Application Flow & User Journeys</h1>

  <h2 class="subsection-title">3.1 The 60-Second POS Billing Journey</h2>
  <div class="flow-step-container">
    <div class="flow-step">
      <div class="flow-step-num">1</div>
      <div class="flow-step-body">
        <h4>Customer Selection & Ledger Inspection</h4>
        <p>The billing operator opens New Bill (<code>/orders/new</code>). Selects customer from search dropdown or taps "+ Add Customer" modal. The system queries previous pending balance in real-time and displays an amber alert if dues exist.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-step-num">2</div>
      <div class="flow-step-body">
        <h4>Item Selection & Quantity Stepping</h4>
        <p>Attendant taps quick catalog pills (e.g. Groundnut Oil, Millets) or types a custom item name. Adjusts quantities using <code>[ - 1 + ]</code> steppers. Line totals auto-calculate dynamically on client state.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-step-num">3</div>
      <div class="flow-step-body">
        <h4>Arithmetic Adjustments & Payment Method</h4>
        <p>Selects Delivery Type (Direct Store ₹0 vs Courier +₹60). Enters discount if applicable. Selects Payment Status: Paid in Full, Keep as Due, or Partially Paid. Chooses method: Cash, UPI / GPay, or Bank Transfer.</p>
      </div>
    </div>
    <div class="flow-step">
      <div class="flow-step-num">4</div>
      <div class="flow-step-body">
        <h4>Atomic Generation & 1-Click Dispatch</h4>
        <p>Operator taps "Save Bill & Print Now" (or mobile floating checkout bar). System posts order payload, commits DB records, redirects to invoice view, pops print dialog, and offers 1-tap WhatsApp dispatch.</p>
      </div>
    </div>
  </div>

  <h2 class="subsection-title">3.2 State Machine: Customer Debt & Invoice Status</h2>
  <pre>
  [ New Bill Created ] 
           │
           ├── If Paid Amount == Grand Total ───► [ Payment Status: PAID ] (Balance Due = ₹0)
           │
           ├── If Paid Amount == 0 ──────────────► [ Payment Status: PENDING ] (Balance Due = Total)
           │                                                  │
           └── If 0 &lt; Paid Amount &lt; Total ──────► [ Payment Status: PARTIAL ] (Balance Due = Delta)
                                                              │
                                            [ Record Payment Receipt (/api/payments) ]
                                                              │
                                                              ▼
                                               [ Payment Status: PAID ]
  </pre>

  <h2 class="subsection-title">3.3 WhatsApp Invoice Message Template</h2>
  <div class="callout-amber">
    <code>
      வணக்கம் ராஜா (Raja),<br>
      கிரீன்லைஃப் இயற்கை அங்காடியில் வாங்கியதற்கான பில் விவரம்:<br>
      ──────────────────────────────<br>
      பில் எண்: #GL-INV-2026-0042<br>
      தேதி: 20 September 2026<br>
      பொருட்கள் தொகை: ₹1,250<br>
      முந்தைய பாக்கி: ₹300<br>
      மொத்த பில் தொகை: ₹1,550<br>
      செலுத்திய தொகை: ₹1,550 (PAID)<br>
      தற்போதைய பாக்கி: ₹0<br>
      ──────────────────────────────<br>
      நல்வாழ்வு தரும் பாரம்பரிய இயற்கை உணவுகளை வாங்கியமைக்கு நன்றி!
    </code>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- 6. SECTION 4: UI/UX DESIGN BRIEF -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="page-break">
  <h1 class="section-title">4. UI/UX Design Brief & Architecture</h1>

  <h2 class="subsection-title">4.1 Dual-Viewport Paradigm</h2>
  <p>
    Rather than forcing a compromised responsive layout, GreenLife implements a strict dual-viewport philosophy tailored to two distinct operational modes:
  </p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Viewport Scope</th>
        <th style="width: 35%;">Design Theme</th>
        <th style="width: 40%;">Core Layout Metaphor</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Desktop / Laptop</strong><br><code>lg: (≥1024px)</code></td>
        <td><strong>Garden Editorial Workbench</strong></td>
        <td>Persistent forest green sidebar (<code>w-64</code>), cream canvas (<code>#F7F5EF</code>), 4-column metric cards, wide arithmetic tables, split login screen.</td>
      </tr>
      <tr>
        <td><strong>Mobile Phone</strong><br><code>max-lg: (&lt;1024px)</code></td>
        <td><strong>Leafora Botanical Glassmorphism</strong></td>
        <td>Floating frosted bottom dock with center glowing action button, dark botanical hero card, horizontal pill carousel, sticky bottom checkout bar.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">4.2 Hallmark Design System Tokens</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Token Name</th>
        <th>Hex / Value</th>
        <th>Applied Context</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>Forest Dark</code></td>
        <td><code>#1B3A2A</code></td>
        <td>Sidebar panel, dark banners, desktop primary accents.</td>
      </tr>
      <tr>
        <td><code>Sage Accent</code></td>
        <td><code>#2D6A4F</code> / <code>#52B788</code></td>
        <td>Primary buttons, active tab indicators, metric highlights.</td>
      </tr>
      <tr>
        <td><code>Amber / Gold</code></td>
        <td><code>#C68B3A</code> / <code>#E2A04A</code></td>
        <td>Due balance tags, organic badges, currency highlights.</td>
      </tr>
      <tr>
        <td><code>Paper Background</code></td>
        <td><code>#F7F5EF</code> (Dark: <code>#0D1B11</code>)</td>
        <td>Main workspace canvas in light mode and deep emerald in dark mode.</td>
      </tr>
      <tr>
        <td><code>Glass Surface</code></td>
        <td><code>rgba(15, 30, 21, 0.88)</code></td>
        <td>Mobile bottom dock and floating card background with <code>backdrop-blur-2xl</code>.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">4.3 Streamlined Mobile Navigation Architecture</h2>
  <p>
    To eliminate horizontal viewport scrolling and header crowding on phone screens, the top navigation bar was streamlined:
  </p>
  <ul>
    <li><strong>Top Bar Elements (Mobile):</strong> Side Dashboard Button (<code>☰</code>), Dynamic Back Button (<code>←</code> on subpages), Compact Logo, Language Toggle (<code>தமிழ் / EN</code>), Theme Switcher (<code>Sun / Moon</code>).</li>
    <li><strong>Bottom Dock (Mobile):</strong> Replaces all secondary desktop links with 5 tactile thumb buttons: Home, Store Catalog, + New Bill (elevated center pill), Bills Ledger, and Profile.</li>
  </ul>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- 7. SECTION 5: BACKEND SCHEMA -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="page-break">
  <h1 class="section-title">5. Backend Database Schema & ER Model</h1>

  <h2 class="subsection-title">5.1 Entity Relationship Model</h2>
  <div class="callout">
    <code>
      [ User ] ──────────────► [ AuditLog ]<br>
         │<br>
      [ Customer ] ──────────► [ Order ] ──────► [ OrderItem ] ◄────── [ Product ]<br>
         │                        │<br>
         └───────────────────► [ Invoice ] ────► [ InvoiceItem ]<br>
                                  │<br>
                                  ▼<br>
                              [ Payment ]
    </code>
  </div>

  <h2 class="subsection-title">5.2 Core Table Definitions</h2>

  <h3 class="subsubsection-title">Table: <code>customers</code> (Customer Ledger)</h3>
  <table class="data-table">
    <thead>
      <tr><th>Column</th><th>Type</th><th>Constraints</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td><code>id</code></td><td>INTEGER</td><td>PRIMARY KEY, AUTOINCREMENT</td><td>Internal primary ID</td></tr>
      <tr><td><code>customer_code</code></td><td>VARCHAR(32)</td><td>UNIQUE, NOT NULL</td><td>Unique code (CUST-0001)</td></tr>
      <tr><td><code>name</code></td><td>VARCHAR(128)</td><td>NOT NULL, INDEXED</td><td>Customer full name</td></tr>
      <tr><td><code>phone</code></td><td>VARCHAR(32)</td><td>UNIQUE, NOT NULL</td><td>WhatsApp contact number</td></tr>
      <tr><td><code>address</code></td><td>TEXT</td><td>NOT NULL</td><td>Door / Street address</td></tr>
      <tr><td><code>city</code></td><td>VARCHAR(64)</td><td>DEFAULT 'Kangeyam'</td><td>Town / City</td></tr>
      <tr><td><code>previous_balance</code></td><td>FLOAT</td><td>DEFAULT 0.0</td><td>Accumulated unpaid balance</td></tr>
    </tbody>
  </table>

  <h3 class="subsubsection-title">Table: <code>invoices</code> (Tax Invoices & Billing)</h3>
  <table class="data-table">
    <thead>
      <tr><th>Column</th><th>Type</th><th>Constraints</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td><code>id</code></td><td>INTEGER</td><td>PRIMARY KEY, AUTOINCREMENT</td><td>Invoice internal ID</td></tr>
      <tr><td><code>invoice_number</code></td><td>VARCHAR(64)</td><td>UNIQUE, NOT NULL</td><td>Sequential bill number (#GL-INV-...)</td></tr>
      <tr><td><code>order_id</code></td><td>INTEGER</td><td>FOREIGN KEY (orders.id)</td><td>Associated order ID</td></tr>
      <tr><td><code>customer_id</code></td><td>INTEGER</td><td>FOREIGN KEY (customers.id)</td><td>Customer reference</td></tr>
      <tr><td><code>subtotal</code></td><td>FLOAT</td><td>NOT NULL</td><td>Items subtotal amount</td></tr>
      <tr><td><code>previous_balance</code></td><td>FLOAT</td><td>DEFAULT 0.0</td><td>Carried forward balance</td></tr>
      <tr><td><code>grand_total</code></td><td>FLOAT</td><td>NOT NULL</td><td>Total payable amount</td></tr>
      <tr><td><code>amount_paid</code></td><td>FLOAT</td><td>DEFAULT 0.0</td><td>Tendered payment amount</td></tr>
      <tr><td><code>balance_due</code></td><td>FLOAT</td><td>DEFAULT 0.0</td><td>Remaining unpaid due</td></tr>
      <tr><td><code>payment_status</code></td><td>VARCHAR(32)</td><td>DEFAULT 'paid'</td><td>'paid', 'pending', 'partially_paid'</td></tr>
      <tr><td><code>pdf_url</code></td><td>VARCHAR(256)</td><td>NULLABLE</td><td>Generated PDF invoice path</td></tr>
    </tbody>
  </table>

  <h3 class="subsubsection-title">Table: <code>products</code> (Store Catalog)</h3>
  <table class="data-table">
    <thead>
      <tr><th>Column</th><th>Type</th><th>Constraints</th><th>Description</th></tr>
    </thead>
    <tbody>
      <tr><td><code>id</code></td><td>INTEGER</td><td>PRIMARY KEY, AUTOINCREMENT</td><td>Product ID</td></tr>
      <tr><td><code>sku</code></td><td>VARCHAR(64)</td><td>UNIQUE, NOT NULL</td><td>Stock keeping unit</td></tr>
      <tr><td><code>name</code></td><td>VARCHAR(256)</td><td>NOT NULL, INDEXED</td><td>Bilingual product name</td></tr>
      <tr><td><code>category</code></td><td>VARCHAR(64)</td><td>DEFAULT 'General'</td><td>Category grouping</td></tr>
      <tr><td><code>price</code></td><td>FLOAT</td><td>NOT NULL</td><td>Unit selling price (₹)</td></tr>
      <tr><td><code>unit</code></td><td>VARCHAR(32)</td><td>DEFAULT 'kg'</td><td>kg, liter, bottle, packet</td></tr>
      <tr><td><code>stock_quantity</code></td><td>FLOAT</td><td>DEFAULT 0.0</td><td>Current inventory count</td></tr>
    </tbody>
  </table>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<!-- 8. SECTION 6: IMPLEMENTATION PLAN -->
<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="page-break">
  <h1 class="section-title">6. Implementation Plan & QA Verification</h1>

  <h2 class="subsection-title">6.1 Engineering Milestones & Status</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 15%;">Phase</th>
        <th style="width: 35%;">Milestone Scope</th>
        <th style="width: 20%;">Target Status</th>
        <th style="width: 30%;">Deliverables</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Phase 1</strong></td>
        <td>Core POS Billing & Database</td>
        <td><span class="pill pill-green">COMPLETED</span></td>
        <td>FastAPI endpoints, SQLite models, 60s billing form, arithmetic breakdown.</td>
      </tr>
      <tr>
        <td><strong>Phase 2</strong></td>
        <td>ReportLab PDF & WhatsApp Sharing</td>
        <td><span class="pill pill-green">COMPLETED</span></td>
        <td>80mm/A4 PDF generation, direct WhatsApp wa.me links with Tamil templates.</td>
      </tr>
      <tr>
        <td><strong>Phase 3</strong></td>
        <td>Hallmark Garden Theme & Dark Engine</td>
        <td><span class="pill pill-green">COMPLETED</span></td>
        <td>Unified editorial typography, robust dark mode inverter without text clipping.</td>
      </tr>
      <tr>
        <td><strong>Phase 4</strong></td>
        <td>Mobile Phone UI/UX Transformation</td>
        <td><span class="pill pill-green">COMPLETED</span></td>
        <td>Leafora botanical dock, sticky POS checkout, zero mobile horizontal scroll.</td>
      </tr>
      <tr>
        <td><strong>Phase 5</strong></td>
        <td>Production Verification & CI/CD</td>
        <td><span class="pill pill-green">COMPLETED</span></td>
        <td>10/10 Playwright E2E tests, 14/14 Pytest tests, GitHub push auto-deploy.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">6.2 Automated Test Coverage Matrix</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Suite Name</th>
        <th>Runner</th>
        <th>Tests</th>
        <th>Coverage Focus</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend E2E</strong></td>
        <td>Playwright (Chromium)</td>
        <td>10 Scenarios</td>
        <td>Desktop split login, dark/light theme, bilingual toggle, new billing flow, invoices ledger, and mobile iPhone viewport with bottom dock.</td>
        <td><span class="pill pill-green">10 / 10 PASSED</span></td>
      </tr>
      <tr>
        <td><strong>Backend API</strong></td>
        <td>Pytest / AsyncIO</td>
        <td>14 Scenarios</td>
        <td>Auth login JWT, customer creation & unique code, GST arithmetic calculations, Tamil product name parser, PDF invoice creation.</td>
        <td><span class="pill pill-green">14 / 14 PASSED</span></td>
      </tr>
      <tr>
        <td><strong>Compilation</strong></td>
        <td>Vite & TypeScript</td>
        <td>2,544 Modules</td>
        <td>Zero TypeScript errors, CSS bundling, code-splitting, production minification.</td>
        <td><span class="pill pill-green">EXIT 0 (PASS)</span></td>
      </tr>
    </tbody>
  </table>

  <h2 class="subsection-title">6.3 Production Deployment & Maintenance Runbook</h2>
  <ul>
    <li><strong>Frontend Production (Vercel):</strong> Connected to GitHub branch <code>main</code>. Any push to <code>origin main</code> triggers an automated build and edge CDN deployment in under 90 seconds.</li>
    <li><strong>Backend Production (Render):</strong> Runs standard Uvicorn worker process on Python 3.12. Automatic zero-downtime rolling restart upon commit deployment.</li>
    <li><strong>Database Backup Protocol:</strong> Nightly automated backup of <code>greenlife.db</code> to secure cloud storage or replica.</li>
  </ul>

  <div style="margin-top: 35px; border-top: 2px solid #EEEAE0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 8.5pt; color: #8C8880;">
    <div><strong>Document ID:</strong> GL-TECH-SPEC-2026-V2.4</div>
    <div><strong>Approved for Production:</strong> Akileshwarakrishnan</div>
  </div>
</div>

</body>
</html>
`;

async function generateDossierPdf() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  // Output paths: in project folder and on Desktop for immediate convenience
  const projectPdfPath = path.resolve(__dirname, '../../GreenLife_Complete_Product_Technical_Dossier.pdf');
  const desktopPdfPath = 'C:\\Users\\Akileshwarakrishnan\\Desktop\\GreenLife_Complete_Product_Technical_Dossier.pdf';

  console.log('Rendering high-resolution PDF...');

  await page.pdf({
    path: projectPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '12mm',
      right: '12mm',
    },
  });

  // Also copy/save to Desktop
  fs.copyFileSync(projectPdfPath, desktopPdfPath);

  await browser.close();

  const stats = fs.statSync(projectPdfPath);
  console.log('SUCCESS: Dossier PDF created!');
  console.log('Project Location:', projectPdfPath);
  console.log('Desktop Location:', desktopPdfPath);
  console.log('File Size:', Math.round(stats.size / 1024), 'KB');
}

generateDossierPdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
