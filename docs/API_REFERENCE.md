# GreenLife Natural Foods — REST API Reference

All API routes are served under the `/api` prefix on the FastAPI backend (`http://localhost:8000/api`). Interactive OpenAPI documentation and Swagger UI are accessible at `http://localhost:8000/docs`.

---

## Authentication (`/api/auth`)

Authentication uses JSON Web Tokens (JWT) with HS256 encryption. Include the token in the `Authorization` header: `Authorization: Bearer <token>`.

### 1. Register User
* **Endpoint**: `POST /api/auth/register`
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "full_name": "Full Name",
    "role": "staff"
  }
  ```
* **Response**: `201 Created` with `UserOut` and `access_token`.

### 2. Login User
* **Endpoint**: `POST /api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "admin@greenlife.com",
    "password": "admin123"
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "admin@greenlife.com",
      "full_name": "Dr. Senthil Nathan",
      "role": "admin",
      "is_active": true
    }
  }
  ```

### 3. Get Current User Profile
* **Endpoint**: `GET /api/auth/me`
* **Headers**: `Authorization: Bearer <token>`
* **Response**: `200 OK` with user details.

---

## Customers (`/api/customers`)

### 1. List Customers
* **Endpoint**: `GET /api/customers`
* **Query Parameters**:
  * `search` (string, optional): Filter by name or phone
  * `skip` (integer, default: 0)
  * `limit` (integer, default: 50)
* **Response**: Array of `CustomerOut`.

### 2. Create Customer
* **Endpoint**: `POST /api/customers`
* **Request Body**:
  ```json
  {
    "name": "Kavitha Rajan",
    "phone": "+91 94433 11223",
    "email": "kavitha.rajan@gmail.com",
    "address": "45 Trichy Road, Thanjavur, Tamil Nadu",
    "city": "Thanjavur",
    "state": "Tamil Nadu",
    "pincode": "613001",
    "gstin": "33AACCR8899A1Z4",
    "current_balance": 0.0
  }
  ```

### 3. Get Customer by ID
* **Endpoint**: `GET /api/customers/{id}`

### 4. Update Customer
* **Endpoint**: `PUT /api/customers/{id}`

---

## Products Catalog (`/api/products`)

### 1. List Products
* **Endpoint**: `GET /api/products`
* **Query Parameters**:
  * `category` (string, optional): e.g., "Cold Pressed Oils"
  * `in_stock` (boolean, optional)
* **Response**: Array of `ProductOut`.

### 2. Create Product
* **Endpoint**: `POST /api/products`
* **Request Body**:
  ```json
  {
    "name": "Organic A2 Gir Cow Ghee",
    "sku": "GL-GHEE-001",
    "category": "Ghee & Dairy",
    "description": "Bilona method cultivated A2 Gir cow ghee",
    "price": 850.0,
    "unit": "ml",
    "stock_quantity": 45,
    "low_stock_threshold": 10,
    "tax_percentage": 12.0
  }
  ```

### 3. Update Product
* **Endpoint**: `PUT /api/products/{id}`

---

## Orders & Calculation (`/api/orders`)

### 1. Calculate Order Math (Preview)
* **Endpoint**: `POST /api/orders/calculate`
* **Request Body**:
  ```json
  {
    "items": [
      {
        "product_id": 1,
        "product_name": "Wood Cold Pressed Groundnut Oil",
        "quantity": 3.0,
        "unit_price": 200.0,
        "tax_percentage": 0.0,
        "discount_percentage": 0.0
      }
    ],
    "previous_balance": 400.0,
    "courier_charges": 60.0,
    "discount_amount": 0.0
  }
  ```
* **Response**: `200 OK`
  ```json
  {
    "subtotal": 600.0,
    "tax_amount": 0.0,
    "courier_charges": 60.0,
    "previous_balance": 400.0,
    "discount_amount": 0.0,
    "grand_total": 1060.0,
    "items": [
      {
        "product_id": 1,
        "product_name": "Wood Cold Pressed Groundnut Oil",
        "quantity": 3.0,
        "unit_price": 200.0,
        "tax_percentage": 0.0,
        "discount_percentage": 0.0,
        "total_amount": 600.0
      }
    ]
  }
  ```

### 2. Create Order & Generate Invoice
* **Endpoint**: `POST /api/orders`
* **Request Body**:
  ```json
  {
    "customer_id": 1,
    "items": [
      { "product_id": 1, "quantity": 3, "unit_price": 200 }
    ],
    "courier_charges": 60.0,
    "discount_amount": 0.0,
    "payment_method": "upi",
    "amount_paid": 500.0,
    "notes": "Fragile cold-pressed bottles"
  }
  ```
* **Response**: `201 Created` with created `OrderOut`, associated `InvoiceOut`, updated inventory stock, and dispatched n8n notification webhook.

---

## Invoices & PDF Generation (`/api/invoices`)

### 1. List Invoices
* **Endpoint**: `GET /api/invoices`
* **Query Parameters**:
  * `payment_status` (string, optional): `paid`, `partial`, `pending`

### 2. Get Invoice Detail
* **Endpoint**: `GET /api/invoices/{id}`

### 3. Download Branded PDF
* **Endpoint**: `GET /api/invoices/{id}/pdf`
* **Response**: Binary stream `application/pdf` with `Content-Disposition: attachment; filename="Invoice-INV-0001.pdf"`.

### 4. Record Payment on Invoice
* **Endpoint**: `POST /api/invoices/{id}/payment`
* **Request Body**:
  ```json
  {
    "amount": 560.0,
    "payment_method": "upi",
    "reference_number": "UPI/TXN/998822",
    "notes": "Final settlement"
  }
  ```

### 5. Resend Invoice via n8n
* **Endpoint**: `POST /api/invoices/{id}/resend`
* **Request Body**:
  ```json
  {
    "channel": "all" // "email", "whatsapp", or "all"
  }
  ```

---

## Business Analytics & Reports (`/api/reports`)

* `GET /api/reports/sales`: Daily net sales, invoice volume, GST taxes, and realized cash collections.
* `GET /api/reports/products`: Product velocity metrics, units sold, and aggregate revenue.
* `GET /api/reports/customers`: Customer lifetime value and outstanding credit balances.
* `GET /api/reports/payments`: Settlement channel distribution.
* `GET /api/reports/export-csv`: CSV file stream of all sales transactions.

---

## AI OCR & Business Intelligence (`/api/ai`)

### 1. Multimodal OCR Invoice Extraction
* **Endpoint**: `POST /api/ai/extract-invoice`
* **Form-Data**: `file`: File upload (`.pdf`, `.png`, `.jpg`, `.jpeg`)
* **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "confidence_score": 0.96,
    "data": {
      "customer": {
        "name": "Lakshmi Narayanan",
        "phone": "+91 98401 22334",
        "email": "lakshmi.n@gmail.com",
        "address": "12 Gandhi Road, Salem"
      },
      "items": [
        { "product": "Cold Pressed Sesame Oil", "quantity": 2, "unit": "liter", "price": 310, "total": 620 }
      ],
      "previous_balance": 150.0,
      "courier_charge": 50.0
    }
  }
  ```

### 2. Conversational Business Intelligence Copilot
* **Endpoint**: `POST /api/ai/query`
* **Request Body**:
  ```json
  {
    "query": "What was Ravi Kumar's last order?"
  }
  ```
* **Response**: Natural language response with contextual transactional records.

---

## Automation & n8n Orchestration (`/api/automation`)

* `GET /api/automation/status`: List recent workflow execution logs with latencies and statuses.
* `POST /api/automation/trigger`: Trigger manual workflow execution with custom payloads.
* `POST /api/automation/retry/{log_id}`: Re-dispatch a failed workflow task.
