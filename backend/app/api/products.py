from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db, get_current_user
from app.models.product import Product
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
    ProductParseRequest,
    ProductParseResponse,
    ParsedProductItem,
    ProductBatchCreateRequest
)
from app.services.tamil_product_parser import parse_product_text_bulk

router = APIRouter()

@router.post("/parse-text", response_model=ProductParseResponse)
def parse_tamil_product_text(
    req: ProductParseRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Parses raw product text (single or multi-line, in Tamil or English).
    Translates product names to both Tamil and English, extracts unit/kg/gram,
    and assigns price to allotted fields.
    """
    parsed_items = parse_product_text_bulk(req.text)
    items = [ParsedProductItem(**item) for item in parsed_items]
    return ProductParseResponse(count=len(items), items=items)

@router.post("/batch", response_model=List[ProductOut])
def create_products_batch(
    req: ProductBatchCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Batch creates multiple products in database with allotted columns.
    """
    created_products = []
    base_count = db.query(Product).count()

    for idx, p_in in enumerate(req.products):
        count = base_count + idx + 1
        sku = p_in.sku or f"GL-PRD-{count:03d}"

        # If name_ta and name_en are present and name doesn't already have both, format bilingually
        name = p_in.name
        if p_in.name_ta and p_in.name_en and " / " not in name:
            name = f"{p_in.name_ta} / {p_in.name_en}"

        product = Product(
            sku=sku,
            name=name,
            name_ta=p_in.name_ta,
            name_en=p_in.name_en,
            category=p_in.category or "General",
            unit=p_in.unit or "kg",
            price=p_in.price,
            tax_percentage=p_in.tax_percentage or 0.0,
            stock_quantity=p_in.stock_quantity if p_in.stock_quantity is not None else 100.0,
            description=p_in.description,
            is_active=True
        )
        db.add(product)
        created_products.append(product)

    db.commit()
    for product in created_products:
        db.refresh(product)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="BATCH_CREATE",
        entity="PRODUCT",
        entity_id="batch",
        details=f"Batch created {len(created_products)} products into database"
    )
    db.add(audit)
    db.commit()

    return created_products

@router.get("", response_model=List[ProductOut])
def get_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    active_only: bool = True,
    current_user: User = Depends(get_current_user)
) -> Any:
    query = db.query(Product)
    if active_only:
        query = query.filter(Product.is_active == True)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(s), Product.sku.ilike(s)))
    return query.order_by(Product.name.asc()).offset(skip).limit(limit).all()

@router.post("", response_model=ProductOut)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    count = db.query(Product).count() + 1
    sku = product_in.sku or f"GL-PRD-{count:03d}"

    name = product_in.name
    if product_in.name_ta and product_in.name_en and " / " not in name:
        name = f"{product_in.name_ta} / {product_in.name_en}"

    product = Product(
        sku=sku,
        name=name,
        name_ta=product_in.name_ta,
        name_en=product_in.name_en,
        category=product_in.category or "General",
        unit=product_in.unit or "kg",
        price=product_in.price,
        tax_percentage=product_in.tax_percentage or 0.0,
        stock_quantity=product_in.stock_quantity or 0.0,
        description=product_in.description,
        is_active=True
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="CREATE",
        entity="PRODUCT",
        entity_id=str(product.id),
        details=f"Product created: {product.name} (₹{product.price}/{product.unit})"
    )
    db.add(audit)
    db.commit()

    return product

@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="UPDATE",
        entity="PRODUCT",
        entity_id=str(product.id),
        details=f"Product updated: {product.name} (Price: ₹{product.price})"
    )
    db.add(audit)
    db.commit()

    return product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="DEACTIVATE",
        entity="PRODUCT",
        entity_id=str(product.id),
        details=f"Product deactivated: {product.name}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Product {product.name} deactivated"}
