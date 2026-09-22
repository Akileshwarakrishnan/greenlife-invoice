export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: number;
  customer_code?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  gst_number?: string;
  notes?: string;
  previous_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  sku?: string;
  name: string;
  name_ta?: string;
  name_en?: string;
  category: string;
  unit: string;
  price: number;
  tax_percentage: number;
  stock_quantity: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParsedProductItem {
  raw_text?: string;
  name: string;
  name_ta?: string;
  name_en?: string;
  category: string;
  unit: string;
  price: number;
  stock_quantity: number;
  quantity: number;
  tax_percentage: number;
  description?: string;
}

export interface ProductParseResponse {
  count: number;
  items: ParsedProductItem[];
}


export interface OrderItem {
  id?: number;
  product_id?: number;
  product_name: string;
  unit: string;
  unit_price: number;
  quantity: number;
  tax_percentage: number;
  discount: number;
  total_amount: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  customer_name?: string;
  subtotal: number;
  previous_balance: number;
  courier_charges: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  status: 'draft' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'cancelled';
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  invoice_id?: number;
  invoice_number?: string;
}

export interface InvoiceItem {
  id: number;
  product_id?: number;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
  discount: number;
  total_amount: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  order_id?: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  customer_gstin?: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  previous_balance: number;
  courier_charges: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'cancelled';
  payment_method: string;
  pdf_url?: string;
  email_status: 'pending' | 'sent' | 'failed' | 'not_applicable';
  whatsapp_status: 'pending' | 'sent' | 'failed' | 'not_applicable';
  notes?: string;
  created_at: string;
  items: InvoiceItem[];
}

export interface Payment {
  id: number;
  invoice_id: number;
  customer_id?: number;
  amount: number;
  payment_method: string;
  transaction_reference?: string;
  notes?: string;
  payment_date: string;
  created_at: string;
}

export interface WorkflowLog {
  id: number;
  workflow_name: string;
  execution_id?: string;
  trigger_source: string;
  status: 'success' | 'failed' | 'running';
  order_id?: number;
  invoice_id?: number;
  payload?: string;
  response_data?: string;
  error_message?: string;
  duration_ms: number;
  started_at: string;
  completed_at?: string;
}

export interface DashboardStats {
  total_orders: number;
  total_invoices: number;
  pending_payments: number;
  paid_invoices: number;
  total_revenue: number;
  this_month_revenue: number;
  today_revenue: number;
  total_customers: number;
  low_stock_products: number;
}

export interface ExtractedInvoiceData {
  invoice_number?: string;
  invoice_date?: string;
  customer: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    gstin?: string;
  };
  items: {
    product: string;
    quantity: number;
    unit: string;
    price: number;
    total?: number;
  }[];
  subtotal?: number;
  previous_balance?: number;
  courier_charge?: number;
  discount?: number;
  tax?: number;
  grand_total?: number;
}

export interface BusinessSettings {
  business_name: string;
  business_name_ta?: string;
  business_proprietor?: string;
  business_tagline: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_website: string;
  business_fssai?: string;
  business_msme?: string;
  business_gstin: string;
  business_bank_name?: string;
  business_ifsc?: string;
  business_account_name?: string;
  business_account_number?: string;
  business_upi_id: string;
  currency_symbol: string;
  invoice_prefix: string;
  default_gst_mode?: string;
  default_b2b_gst_rate?: number;
  default_retail_gst_rate?: number;
}

export interface SystemSettings {
  business: BusinessSettings;
  automation: {
    n8n_webhook_url: string;
    n8n_email_webhook_url: string;
    n8n_whatsapp_webhook_url: string;
    n8n_ai_webhook_url: string;
    n8n_api_url: string;
    n8n_api_key: string;
    mock_fallback: boolean;
  };
  ai: {
    ai_provider: string;
    ai_base_url: string;
    ai_model: string;
    ai_api_key_configured: boolean;
  };
}

export interface PurchaseItem {
  id?: number;
  item_name: string;
  product_id?: number;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  auto_update_stock?: boolean;
}

export interface Purchase {
  id: number;
  vendor_name: string;
  vendor_bill_number?: string;
  vendor_phone?: string;
  vendor_gstin?: string;
  purchase_date: string;
  category: string;
  subtotal: number;
  tax_amount: number;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
  payment_status: 'paid' | 'partially_paid' | 'pending';
  payment_method: string;
  notes?: string;
  created_at: string;
  items: PurchaseItem[];
}

