import csv
import io
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.order import Order, OrderItem
from app.models.invoice import Invoice, InvoiceStatus
from app.models.customer import Customer
from app.models.product import Product
from app.models.payment import Payment
from app.models.user import User
from app.schemas.reports import (
    DashboardStats,
    RevenueChartItem,
    SalesReportItem,
    ProductReportItem,
    CustomerReportItem,
    PaymentReportItem
)

router = APIRouter()

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    total_orders = db.query(Order).count()
    total_invoices = db.query(Invoice).count()
    
    total_revenue = db.query(func.sum(Invoice.grand_total)).scalar() or 0.0
    pending_payments = db.query(func.sum(Invoice.balance_due)).scalar() or 0.0
    paid_invoices = db.query(Invoice).filter(Invoice.payment_status == InvoiceStatus.PAID.value).count()
    
    # Month calculation
    now = datetime.now(timezone.utc)
    month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    this_month_revenue = (
        db.query(func.sum(Invoice.grand_total))
        .filter(Invoice.created_at >= month_start)
        .scalar() or 0.0
    )

    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    today_revenue = (
        db.query(func.sum(Invoice.grand_total))
        .filter(Invoice.created_at >= today_start)
        .scalar() or 0.0
    )

    total_customers = db.query(Customer).filter(Customer.is_active == True).count()
    low_stock = db.query(Product).filter(Product.is_active == True, Product.stock_quantity < 20).count()

    return DashboardStats(
        total_orders=total_orders,
        total_invoices=total_invoices,
        pending_payments=round(pending_payments, 2),
        paid_invoices=paid_invoices,
        total_revenue=round(total_revenue, 2),
        this_month_revenue=round(this_month_revenue, 2),
        today_revenue=round(today_revenue, 2),
        total_customers=total_customers,
        low_stock_products=low_stock
    )

@router.get("/revenue-chart", response_model=List[RevenueChartItem])
def get_revenue_chart(
    period: str = "daily",  # daily, weekly, monthly
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Build a timeline from the past 7 periods
    now = datetime.now(timezone.utc)
    chart_data = []

    if period == "monthly":
        for i in range(5, -1, -1):
            # approximate month
            d = now - timedelta(days=i * 30)
            label = d.strftime("%b %Y")
            # Query invoices in that calendar window
            m_start = datetime(d.year, d.month, 1, tzinfo=timezone.utc)
            if d.month == 12:
                m_end = datetime(d.year + 1, 1, 1, tzinfo=timezone.utc)
            else:
                m_end = datetime(d.year, d.month + 1, 1, tzinfo=timezone.utc)
            
            rev = db.query(func.sum(Invoice.grand_total)).filter(Invoice.created_at >= m_start, Invoice.created_at < m_end).scalar() or 0.0
            cnt = db.query(Order).filter(Order.created_at >= m_start, Order.created_at < m_end).count()
            chart_data.append(RevenueChartItem(label=label, revenue=round(rev, 2), order_count=cnt))
    elif period == "weekly":
        for i in range(5, -1, -1):
            w_start = now - timedelta(weeks=i+1)
            w_end = now - timedelta(weeks=i)
            label = f"Wk {w_start.strftime('%d %b')}"
            rev = db.query(func.sum(Invoice.grand_total)).filter(Invoice.created_at >= w_start, Invoice.created_at < w_end).scalar() or 0.0
            cnt = db.query(Order).filter(Order.created_at >= w_start, Order.created_at < w_end).count()
            chart_data.append(RevenueChartItem(label=label, revenue=round(rev, 2), order_count=cnt))
    else:  # daily
        for i in range(6, -1, -1):
            day = now - timedelta(days=i)
            day_start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
            day_end = day_start + timedelta(days=1)
            label = day.strftime("%a (%d %b)")
            rev = db.query(func.sum(Invoice.grand_total)).filter(Invoice.created_at >= day_start, Invoice.created_at < day_end).scalar() or 0.0
            cnt = db.query(Order).filter(Order.created_at >= day_start, Order.created_at < day_end).count()
            chart_data.append(RevenueChartItem(label=label, revenue=round(rev, 2), order_count=cnt))

    return chart_data

@router.get("/sales", response_model=List[SalesReportItem])
def get_sales_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Group by invoice_date
    invoices = db.query(Invoice).order_by(Invoice.invoice_date.desc()).limit(30).all()
    grouped = {}
    for inv in invoices:
        d_str = str(inv.invoice_date)
        if d_str not in grouped:
            grouped[d_str] = {
                "date": d_str,
                "orders_count": 0,
                "invoices_count": 0,
                "subtotal": 0.0,
                "courier_charges": 0.0,
                "tax_amount": 0.0,
                "discount_amount": 0.0,
                "net_sales": 0.0,
                "amount_collected": 0.0
            }
        grouped[d_str]["orders_count"] += 1
        grouped[d_str]["invoices_count"] += 1
        grouped[d_str]["subtotal"] += inv.subtotal
        grouped[d_str]["courier_charges"] += inv.courier_charges
        grouped[d_str]["tax_amount"] += inv.tax_amount
        grouped[d_str]["discount_amount"] += inv.discount_amount
        grouped[d_str]["net_sales"] += inv.grand_total
        grouped[d_str]["amount_collected"] += inv.amount_paid

    report = [SalesReportItem(**vals) for vals in grouped.values()]
    return report

@router.get("/products", response_model=List[ProductReportItem])
def get_products_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Aggregated sold counts
    products = db.query(Product).filter(Product.is_active == True).all()
    results = []

    for p in products:
        order_items = db.query(OrderItem).filter(OrderItem.product_id == p.id).all()
        total_sold = sum(item.quantity for item in order_items)
        total_rev = sum(item.total_amount for item in order_items)
        occurrences = len(order_items)

        results.append(ProductReportItem(
            product_id=p.id,
            product_name=p.name,
            category=p.category,
            unit=p.unit,
            units_sold=round(total_sold, 2),
            total_revenue=round(total_rev, 2),
            order_occurrences=occurrences
        ))

    results.sort(key=lambda x: x.total_revenue, reverse=True)
    return results

@router.get("/customers", response_model=List[CustomerReportItem])
def get_customers_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    customers = db.query(Customer).filter(Customer.is_active == True).all()
    results = []

    for c in customers:
        orders = db.query(Order).filter(Order.customer_id == c.id).order_by(Order.created_at.desc()).all()
        total_spent = sum(o.grand_total for o in orders)
        last_date = orders[0].created_at.strftime("%Y-%m-%d") if orders else None

        results.append(CustomerReportItem(
            customer_id=c.id,
            customer_name=c.name,
            phone=c.phone,
            total_orders=len(orders),
            total_spent=round(total_spent, 2),
            outstanding_balance=round(c.previous_balance, 2),
            last_order_date=last_date
        ))

    results.sort(key=lambda x: x.total_spent, reverse=True)
    return results

@router.get("/payments", response_model=List[PaymentReportItem])
def get_payments_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    payments = db.query(Payment).all()
    grouped = {}

    for p in payments:
        method = (p.payment_method or "other").upper()
        if method not in grouped:
            grouped[method] = {"payment_method": method, "transactions_count": 0, "total_amount": 0.0}
        grouped[method]["transactions_count"] += 1
        grouped[method]["total_amount"] += p.amount

    return [PaymentReportItem(**g) for g in grouped.values()]

@router.get("/export/csv")
def export_sales_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Response:
    invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Invoice Number", "Invoice Date", "Customer Name", "Customer Phone",
        "Subtotal (₹)", "Previous Balance (₹)", "Courier (₹)", "Tax (₹)", "Discount (₹)",
        "Grand Total (₹)", "Amount Paid (₹)", "Balance Due (₹)", "Payment Status"
    ])

    for inv in invoices:
        writer.writerow([
            inv.invoice_number,
            str(inv.invoice_date),
            inv.customer_name,
            inv.customer_phone,
            inv.subtotal,
            inv.previous_balance,
            inv.courier_charges,
            inv.tax_amount,
            inv.discount_amount,
            inv.grand_total,
            inv.amount_paid,
            inv.balance_due,
            inv.payment_status
        ])

    csv_data = output.getvalue()
    output.close()

    filename = f"GreenLife_Sales_Report_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
