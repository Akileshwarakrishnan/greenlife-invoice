from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.models.customer import Customer
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut

router = APIRouter()

@router.get("", response_model=List[CustomerOut])
def get_customers(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(Customer)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.ilike(s),
                Customer.phone.ilike(s),
                Customer.email.ilike(s),
                Customer.city.ilike(s)
            )
        )
    return query.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()

@router.post("", response_model=CustomerOut)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Check for duplicate customer by phone number
    if customer_in.phone:
        clean_phone = "".join(filter(str.isdigit, customer_in.phone))[-10:]
        if clean_phone:
            existing = db.query(Customer).filter(
                Customer.phone.ilike(f"%{clean_phone}%"),
                Customer.is_active == True
            ).first()
            if existing:
                if customer_in.name and len(customer_in.name.strip()) > 1:
                    existing.name = customer_in.name.strip()
                if customer_in.address and len(customer_in.address.strip()) > 1:
                    existing.address = customer_in.address.strip()
                if customer_in.city:
                    existing.city = customer_in.city
                if customer_in.email:
                    existing.email = customer_in.email
                if customer_in.previous_balance is not None and customer_in.previous_balance > 0:
                    existing.previous_balance = customer_in.previous_balance
                db.commit()
                db.refresh(existing)
                return existing

    last_cust = db.query(Customer).order_by(Customer.id.desc()).first()
    next_id = (last_cust.id + 1) if last_cust else 1
    code = f"CUST-{next_id:04d}"
    while db.query(Customer).filter(Customer.customer_code == code).first():
        next_id += 1
        code = f"CUST-{next_id:04d}"

    customer = Customer(
        customer_code=code,
        name=customer_in.name,
        phone=customer_in.phone,
        email=customer_in.email,
        address=customer_in.address,
        city=customer_in.city or "Kangeyam",
        district=customer_in.district or "Tirupur",
        state=customer_in.state or "Tamil Nadu",
        pincode=customer_in.pincode or "638701",
        gst_number=customer_in.gst_number,
        notes=customer_in.notes,
        previous_balance=customer_in.previous_balance or 0.0,
        is_active=True
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE",
        entity="CUSTOMER",
        entity_id=str(customer.id),
        details=f"Customer created: {customer.name} ({customer.phone})"
    )
    db.add(audit)
    db.commit()

    return customer

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = customer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="UPDATE",
        entity="CUSTOMER",
        entity_id=str(customer.id),
        details=f"Customer updated: {customer.name}"
    )
    db.add(audit)
    db.commit()

    return customer

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Soft delete / deactivate
    customer.is_active = False
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="DEACTIVATE",
        entity="CUSTOMER",
        entity_id=str(customer.id),
        details=f"Customer deactivated: {customer.name}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Customer {customer.name} deactivated successfully"}
