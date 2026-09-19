from typing import List, Optional, Dict, Any
from datetime import date
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_orders: int
    total_invoices: int
    pending_payments: float
    paid_invoices: int
    total_revenue: float
    this_month_revenue: float
    today_revenue: float
    total_customers: int
    low_stock_products: int

class RevenueChartItem(BaseModel):
    label: str
    revenue: float
    order_count: int

class SalesReportItem(BaseModel):
    date: str
    orders_count: int
    invoices_count: int
    subtotal: float
    courier_charges: float
    tax_amount: float
    discount_amount: float
    net_sales: float
    amount_collected: float

class ProductReportItem(BaseModel):
    product_id: int
    product_name: str
    category: str
    unit: str
    units_sold: float
    total_revenue: float
    order_occurrences: int

class CustomerReportItem(BaseModel):
    customer_id: int
    customer_name: str
    phone: str
    total_orders: int
    total_spent: float
    outstanding_balance: float
    last_order_date: Optional[str] = None

class PaymentReportItem(BaseModel):
    payment_method: str
    transactions_count: int
    total_amount: float
