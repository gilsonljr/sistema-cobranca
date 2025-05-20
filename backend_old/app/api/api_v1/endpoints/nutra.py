from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.nutra_product import (
    NutraProduct, Kit, KitProduct, Distributor, 
    DistributorOrder, DistributorOrderItem, StockHistory,
    KitSale, ProductType, OrderStatus, StockChangeReason
)
from app.schemas.nutra import (
    Product, ProductCreate, ProductUpdate,
    Kit, KitCreate, KitUpdate,
    Distributor, DistributorCreate, DistributorUpdate,
    Order, OrderCreate, OrderUpdate,
    StockHistory, StockHistoryCreate,
    KitSale, KitSaleCreate,
    ProductStockStatus, SalesAnalytics, InventorySummary
)
from datetime import datetime, timedelta
from sqlalchemy import func, desc

router = APIRouter()

# Product endpoints
@router.get("/products", response_model=List[Product])
def get_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
):
    """
    Get all products.
    """
    query = db.query(NutraProduct)
    if active_only:
        query = query.filter(NutraProduct.active == True)
    return query.offset(skip).limit(limit).all()

@router.post("/products", response_model=Product)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new product.
    """
    db_product = NutraProduct(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Create initial stock history if stock > 0
    if product.current_stock > 0:
        stock_history = StockHistory(
            product_id=db_product.id,
            user_id=current_user.id,
            change_amount=product.current_stock,
            reason=StockChangeReason.MANUAL,
            notes="Initial stock"
        )
        db.add(stock_history)
        db.commit()
    
    return db_product

@router.get("/products/{product_id}", response_model=Product)
def get_product(
    product_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific product by ID.
    """
    product = db.query(NutraProduct).filter(NutraProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{product_id}", response_model=Product)
def update_product(
    product_id: int = Path(...),
    product_update: ProductUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a product.
    """
    db_product = db.query(NutraProduct).filter(NutraProduct.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a product (soft delete by setting active=False).
    """
    db_product = db.query(NutraProduct).filter(NutraProduct.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db_product.active = False
    db.commit()
    return {"message": "Product deactivated successfully"}

# Stock adjustment endpoint
@router.post("/products/{product_id}/adjust-stock", response_model=StockHistory)
def adjust_stock(
    product_id: int = Path(...),
    stock_change: StockHistoryCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Adjust the stock of a product.
    """
    db_product = db.query(NutraProduct).filter(NutraProduct.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update product stock
    db_product.current_stock += stock_change.change_amount
    if db_product.current_stock < 0:
        raise HTTPException(status_code=400, detail="Stock cannot be negative")
    
    # Create stock history entry
    stock_history = StockHistory(
        product_id=product_id,
        user_id=current_user.id,
        change_amount=stock_change.change_amount,
        reason=stock_change.reason,
        reference_type=stock_change.reference_type,
        reference_id=stock_change.reference_id,
        notes=stock_change.notes
    )
    
    db.add(stock_history)
    db.commit()
    db.refresh(stock_history)
    
    return stock_history

@router.get("/products/{product_id}/stock-history", response_model=List[StockHistory])
def get_stock_history(
    product_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Get stock history for a product.
    """
    product = db.query(NutraProduct).filter(NutraProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    history = db.query(StockHistory).filter(
        StockHistory.product_id == product_id
    ).order_by(desc(StockHistory.created_at)).offset(skip).limit(limit).all()
    
    return history

# Kit endpoints
@router.get("/kits", response_model=List[Kit])
def get_kits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
):
    """
    Get all kits.
    """
    query = db.query(Kit)
    if active_only:
        query = query.filter(Kit.active == True)
    return query.offset(skip).limit(limit).all()

@router.post("/kits", response_model=Kit)
def create_kit(
    kit: KitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new kit.
    """
    # Create kit
    db_kit = Kit(
        name=kit.name,
        description=kit.description,
        active=kit.active
    )
    db.add(db_kit)
    db.commit()
    db.refresh(db_kit)
    
    # Add products to kit
    for product_item in kit.products:
        kit_product = KitProduct(
            kit_id=db_kit.id,
            product_id=product_item["product_id"],
            quantity=product_item["quantity"]
        )
        db.add(kit_product)
    
    db.commit()
    db.refresh(db_kit)
    
    return db_kit

@router.get("/kits/{kit_id}", response_model=Kit)
def get_kit(
    kit_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific kit by ID.
    """
    kit = db.query(Kit).filter(Kit.id == kit_id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Kit not found")
    return kit

@router.put("/kits/{kit_id}", response_model=Kit)
def update_kit(
    kit_id: int = Path(...),
    kit_update: KitUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a kit.
    """
    db_kit = db.query(Kit).filter(Kit.id == kit_id).first()
    if not db_kit:
        raise HTTPException(status_code=404, detail="Kit not found")
    
    # Update basic kit info
    update_data = kit_update.dict(exclude={"products"}, exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_kit, field, value)
    
    # Update kit products if provided
    if kit_update.products is not None:
        # Remove existing kit products
        db.query(KitProduct).filter(KitProduct.kit_id == kit_id).delete()
        
        # Add new kit products
        for product_item in kit_update.products:
            kit_product = KitProduct(
                kit_id=kit_id,
                product_id=product_item["product_id"],
                quantity=product_item["quantity"]
            )
            db.add(kit_product)
    
    db.commit()
    db.refresh(db_kit)
    return db_kit

@router.delete("/kits/{kit_id}")
def delete_kit(
    kit_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a kit (soft delete by setting active=False).
    """
    db_kit = db.query(Kit).filter(Kit.id == kit_id).first()
    if not db_kit:
        raise HTTPException(status_code=404, detail="Kit not found")
    
    db_kit.active = False
    db.commit()
    return {"message": "Kit deactivated successfully"}

# Kit sales endpoints
@router.post("/kit-sales", response_model=KitSale)
def create_kit_sale(
    kit_sale: KitSaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record a kit sale and deduct stock.
    """
    # Get kit and its products
    kit = db.query(Kit).filter(Kit.id == kit_sale.kit_id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Kit not found")
    
    kit_products = db.query(KitProduct).filter(KitProduct.kit_id == kit_sale.kit_id).all()
    if not kit_products:
        raise HTTPException(status_code=400, detail="Kit has no products")
    
    # Check if there's enough stock for all products
    for kit_product in kit_products:
        product = db.query(NutraProduct).filter(NutraProduct.id == kit_product.product_id).first()
        required_quantity = kit_product.quantity * kit_sale.quantity
        
        if product.current_stock < required_quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough stock for product {product.name}. Required: {required_quantity}, Available: {product.current_stock}"
            )
    
    # Create kit sale record
    sale_date = kit_sale.sale_date or datetime.utcnow()
    db_kit_sale = KitSale(
        kit_id=kit_sale.kit_id,
        quantity=kit_sale.quantity,
        sale_date=sale_date,
        user_id=current_user.id,
        notes=kit_sale.notes
    )
    db.add(db_kit_sale)
    db.commit()
    db.refresh(db_kit_sale)
    
    # Deduct stock for each product in the kit
    for kit_product in kit_products:
        product = db.query(NutraProduct).filter(NutraProduct.id == kit_product.product_id).first()
        deduction_amount = kit_product.quantity * kit_sale.quantity
        
        # Update product stock
        product.current_stock -= deduction_amount
        
        # Create stock history entry
        stock_history = StockHistory(
            product_id=kit_product.product_id,
            user_id=current_user.id,
            change_amount=-deduction_amount,
            reason=StockChangeReason.KIT_SALE,
            reference_type="kit_sale",
            reference_id=db_kit_sale.id,
            notes=f"Kit sale: {kit.name} x{kit_sale.quantity}"
        )
        db.add(stock_history)
    
    db.commit()
    return db_kit_sale

@router.get("/kit-sales", response_model=List[KitSale])
def get_kit_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get kit sales with optional date filtering.
    """
    query = db.query(KitSale)
    
    if start_date:
        query = query.filter(KitSale.sale_date >= start_date)
    if end_date:
        query = query.filter(KitSale.sale_date <= end_date)
    
    return query.order_by(desc(KitSale.sale_date)).offset(skip).limit(limit).all()

# Distributor endpoints
@router.get("/distributors", response_model=List[Distributor])
def get_distributors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
):
    """
    Get all distributors.
    """
    query = db.query(Distributor)
    if active_only:
        query = query.filter(Distributor.active == True)
    return query.offset(skip).limit(limit).all()

@router.post("/distributors", response_model=Distributor)
def create_distributor(
    distributor: DistributorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new distributor.
    """
    db_distributor = Distributor(**distributor.dict())
    db.add(db_distributor)
    db.commit()
    db.refresh(db_distributor)
    return db_distributor

@router.get("/distributors/{distributor_id}", response_model=Distributor)
def get_distributor(
    distributor_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific distributor by ID.
    """
    distributor = db.query(Distributor).filter(Distributor.id == distributor_id).first()
    if not distributor:
        raise HTTPException(status_code=404, detail="Distributor not found")
    return distributor

@router.put("/distributors/{distributor_id}", response_model=Distributor)
def update_distributor(
    distributor_id: int = Path(...),
    distributor_update: DistributorUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a distributor.
    """
    db_distributor = db.query(Distributor).filter(Distributor.id == distributor_id).first()
    if not db_distributor:
        raise HTTPException(status_code=404, detail="Distributor not found")
    
    update_data = distributor_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_distributor, field, value)
    
    db.commit()
    db.refresh(db_distributor)
    return db_distributor

@router.delete("/distributors/{distributor_id}")
def delete_distributor(
    distributor_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a distributor (soft delete by setting active=False).
    """
    db_distributor = db.query(Distributor).filter(Distributor.id == distributor_id).first()
    if not db_distributor:
        raise HTTPException(status_code=404, detail="Distributor not found")
    
    db_distributor.active = False
    db.commit()
    return {"message": "Distributor deactivated successfully"}

# Order endpoints
@router.get("/orders", response_model=List[Order])
def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    status: Optional[OrderStatus] = None
):
    """
    Get all orders with optional status filtering.
    """
    query = db.query(DistributorOrder)
    
    if status:
        query = query.filter(DistributorOrder.status == status)
    
    return query.order_by(desc(DistributorOrder.created_at)).offset(skip).limit(limit).all()

@router.post("/orders", response_model=Order)
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new order.
    """
    # Create order
    db_order = DistributorOrder(
        distributor_id=order.distributor_id,
        user_id=current_user.id,
        expected_delivery_date=order.expected_delivery_date,
        notes=order.notes,
        status=OrderStatus.PENDENTE
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Add order items
    for item in order.items:
        order_item = DistributorOrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(order_item)
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

@router.get("/orders/{order_id}", response_model=Order)
def get_order(
    order_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific order by ID.
    """
    order = db.query(DistributorOrder).filter(DistributorOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/orders/{order_id}", response_model=Order)
def update_order(
    order_id: int = Path(...),
    order_update: OrderUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an order.
    """
    db_order = db.query(DistributorOrder).filter(DistributorOrder.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if status is being updated to COMPLETO
    old_status = db_order.status
    
    # Update basic order info
    update_data = order_update.dict(exclude={"items"}, exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)
    
    # Update order items if provided
    if order_update.items is not None:
        # Remove existing order items
        db.query(DistributorOrderItem).filter(DistributorOrderItem.order_id == order_id).delete()
        
        # Add new order items
        for item in order_update.items:
            order_item = DistributorOrderItem(
                order_id=order_id,
                product_id=item.product_id,
                quantity=item.quantity
            )
            db.add(order_item)
    
    db.commit()
    db.refresh(db_order)
    
    # If status changed to COMPLETO, add stock
    if old_status != OrderStatus.COMPLETO and db_order.status == OrderStatus.COMPLETO:
        order_items = db.query(DistributorOrderItem).filter(DistributorOrderItem.order_id == order_id).all()
        
        for item in order_items:
            product = db.query(NutraProduct).filter(NutraProduct.id == item.product_id).first()
            
            # Update product stock
            product.current_stock += item.quantity
            
            # Create stock history entry
            stock_history = StockHistory(
                product_id=item.product_id,
                user_id=current_user.id,
                change_amount=item.quantity,
                reason=StockChangeReason.ORDER_RECEIVED,
                reference_type="order",
                reference_id=order_id,
                notes=f"Order received from distributor #{db_order.distributor_id}"
            )
            db.add(stock_history)
        
        db.commit()
    
    return db_order

@router.post("/orders/{order_id}/complete", response_model=Order)
def complete_order(
    order_id: int = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mark an order as complete and add stock.
    """
    db_order = db.query(DistributorOrder).filter(DistributorOrder.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.status == OrderStatus.COMPLETO:
        raise HTTPException(status_code=400, detail="Order is already complete")
    
    # Update order status
    db_order.status = OrderStatus.COMPLETO
    db.commit()
    
    # Add stock for each product in the order
    order_items = db.query(DistributorOrderItem).filter(DistributorOrderItem.order_id == order_id).all()
    
    for item in order_items:
        product = db.query(NutraProduct).filter(NutraProduct.id == item.product_id).first()
        
        # Update product stock
        product.current_stock += item.quantity
        
        # Create stock history entry
        stock_history = StockHistory(
            product_id=item.product_id,
            user_id=current_user.id,
            change_amount=item.quantity,
            reason=StockChangeReason.ORDER_RECEIVED,
            reference_type="order",
            reference_id=order_id,
            notes=f"Order received from distributor #{db_order.distributor_id}"
        )
        db.add(stock_history)
    
    db.commit()
    db.refresh(db_order)
    
    return db_order

# Analytics endpoints
@router.get("/analytics/low-stock", response_model=List[ProductStockStatus])
def get_low_stock_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    threshold_percentage: float = 100.0  # Default to show products at or below minimum stock
):
    """
    Get products with low stock.
    """
    products = db.query(NutraProduct).filter(NutraProduct.active == True).all()
    
    low_stock_products = []
    for product in products:
        if product.minimum_stock > 0:
            percentage = (product.current_stock / product.minimum_stock) * 100
        else:
            percentage = 100.0
        
        if percentage <= threshold_percentage:
            status = "out" if product.current_stock == 0 else "low" if percentage < 100 else "ok"
            
            low_stock_products.append(
                ProductStockStatus(
                    id=product.id,
                    name=product.name,
                    type=product.type,
                    current_stock=product.current_stock,
                    minimum_stock=product.minimum_stock,
                    status=status,
                    percentage=percentage
                )
            )
    
    return sorted(low_stock_products, key=lambda x: x.percentage)

@router.get("/analytics/sales", response_model=SalesAnalytics)
def get_sales_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = 30
):
    """
    Get sales analytics for the specified number of days.
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get kit sales in the period
    kit_sales = db.query(KitSale).filter(KitSale.sale_date >= start_date).all()
    
    total_sales = len(kit_sales)
    total_revenue = 0.0
    products_sold = {}
    kits_sold = {}
    
    for sale in kit_sales:
        kit = db.query(Kit).filter(Kit.id == sale.kit_id).first()
        if not kit:
            continue
        
        # Count kit
        kit_name = kit.name
        if kit_name in kits_sold:
            kits_sold[kit_name] += sale.quantity
        else:
            kits_sold[kit_name] = sale.quantity
        
        # Get kit products
        kit_products = db.query(KitProduct).filter(KitProduct.kit_id == sale.kit_id).all()
        
        for kit_product in kit_products:
            product = db.query(NutraProduct).filter(NutraProduct.id == kit_product.product_id).first()
            if not product:
                continue
            
            # Count product
            product_name = product.name
            product_quantity = kit_product.quantity * sale.quantity
            
            if product_name in products_sold:
                products_sold[product_name] += product_quantity
            else:
                products_sold[product_name] = product_quantity
            
            # Add to revenue
            total_revenue += product.sale_price * product_quantity
    
    return SalesAnalytics(
        total_sales=total_sales,
        total_revenue=total_revenue,
        products_sold=products_sold,
        kits_sold=kits_sold
    )

@router.get("/analytics/inventory", response_model=InventorySummary)
def get_inventory_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get inventory summary.
    """
    products = db.query(NutraProduct).filter(NutraProduct.active == True).all()
    
    total_products = len(products)
    low_stock_count = 0
    out_of_stock_count = 0
    total_inventory_value = 0.0
    low_stock_items = []
    
    for product in products:
        # Calculate inventory value
        product_value = product.current_stock * product.cost
        total_inventory_value += product_value
        
        # Check stock status
        if product.current_stock == 0:
            out_of_stock_count += 1
            status = "out"
            percentage = 0.0
        elif product.minimum_stock > 0 and product.current_stock < product.minimum_stock:
            low_stock_count += 1
            status = "low"
            percentage = (product.current_stock / product.minimum_stock) * 100
        else:
            status = "ok"
            percentage = (product.current_stock / max(product.minimum_stock, 1)) * 100
        
        # Add to low stock items if needed
        if status in ["out", "low"]:
            low_stock_items.append(
                ProductStockStatus(
                    id=product.id,
                    name=product.name,
                    type=product.type,
                    current_stock=product.current_stock,
                    minimum_stock=product.minimum_stock,
                    status=status,
                    percentage=percentage
                )
            )
    
    return InventorySummary(
        total_products=total_products,
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count,
        total_inventory_value=total_inventory_value,
        low_stock_items=sorted(low_stock_items, key=lambda x: x.percentage)
    )
