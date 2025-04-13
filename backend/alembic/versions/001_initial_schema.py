"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2023-07-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types
    user_role = postgresql.ENUM('admin', 'supervisor', 'collector', 'seller', name='userrole')
    user_role.create(op.get_bind())
    
    order_status = postgresql.ENUM('pending', 'in_progress', 'paid', 'partially_paid', 'negotiating', 'cancelled', 'delivered', name='orderstatus')
    order_status.create(op.get_bind())
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('role', sa.Enum('admin', 'supervisor', 'collector', 'seller', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    
    # Create orders table
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_number', sa.String(), nullable=False),
        sa.Column('customer_name', sa.String(), nullable=False),
        sa.Column('customer_phone', sa.String(), nullable=False),
        sa.Column('customer_address', sa.String(), nullable=False),
        sa.Column('total_amount', sa.Float(), nullable=False),
        sa.Column('paid_amount', sa.Float(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'paid', 'partially_paid', 'negotiating', 'cancelled', 'delivered', name='orderstatus'), nullable=True),
        sa.Column('tracking_code', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('is_duplicate', sa.Boolean(), nullable=True),
        sa.Column('seller_id', sa.Integer(), nullable=True),
        sa.Column('collector_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['collector_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['seller_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_orders_id'), 'orders', ['id'], unique=False)
    op.create_index(op.f('ix_orders_order_number'), 'orders', ['order_number'], unique=True)
    
    # Create billing_history table
    op.create_table(
        'billing_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_billing_history_id'), 'billing_history', ['id'], unique=False)


def downgrade():
    # Drop tables
    op.drop_table('billing_history')
    op.drop_table('orders')
    op.drop_table('users')
    
    # Drop enum types
    op.execute('DROP TYPE orderstatus')
    op.execute('DROP TYPE userrole')
