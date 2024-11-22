from app import db
from datetime import datetime

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    quotes = db.relationship('Quote', backref='customer', lazy=True)

class Quote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')
    locations = db.relationship('InsulationLocation', backref='quote', lazy=True)

class InsulationLocation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quote_id = db.Column(db.Integer, db.ForeignKey('quote.id'), nullable=False)
    location_type = db.Column(db.String(50), nullable=False)
    insulation_type = db.Column(db.String(50), nullable=False)
    square_footage = db.Column(db.Float)
    thickness = db.Column(db.Float)
    r_value = db.Column(db.Float)
    install_cost = db.Column(db.Float)
    cleanup_cost = db.Column(db.Float)
    total_cost = db.Column(db.Float)