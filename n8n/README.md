# GreenLife Natural Foods — n8n Automation Workflows

This directory contains pre-configured production workflows for n8n workflow automation.

## Workflows Included

1. **`01_order_processing.json`**:
   - Webhook trigger on `/webhook/order-processing`
   - Validates incoming order and customer data
   - Calls backend callback and prepares notifications

2. **`02_email_invoice.json`**:
   - Webhook trigger on `/webhook/email-invoice`
   - Checks customer email validity
   - Prepares GreenLife branded HTML notification email
   - Sends email via SMTP credentials
   - Posts delivery status back to the backend

3. **`03_whatsapp_notification.json`**:
   - Webhook trigger on `/webhook/whatsapp-notification`
   - Formats customer greeting, order totals, and invoice link
   - Dispatches message to WhatsApp API endpoint
   - Reports delivery status to the backend

4. **`04_ai_invoice_extraction.json`**:
   - Webhook trigger on `/webhook/ai-extraction`
   - Coordinates document entity extraction and returns structured JSON

5. **`05_error_handler.json`**:
   - Dead-letter error handling workflow
   - Catches workflow failures and logs errors to the backend audit logs without losing original orders

## How to Import into n8n

1. Start n8n (either via Docker `docker compose up -d n8n` or local n8n at `http://localhost:5678`).
2. Log into n8n.
3. Go to **Workflows** -> **Import from File**.
4. Select any of the `.json` files in `n8n/workflows/`.
5. Activate the workflow using the toggle in the top right.

## Mock Fallback Mode

If n8n is offline or not installed, the FastAPI backend will automatically use its internal automation fallback (`N8N_MOCK_FALLBACK=True`), guaranteeing that order creation, PDF generation, notification logging, and error audits continue to function seamlessly.
