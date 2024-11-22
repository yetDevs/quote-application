from flask import Blueprint, request, jsonify, send_from_directory
from app.utils import generate_pdf
import os
from app.models import db, Customer, Quote, InsulationLocation
from app.utils import generate_pdf

main = Blueprint('main', __name__)

INSULATION_TYPES = {
    'openCell': {
        'walls': {'rValue': 11.01, 'minCode': 'R20', 'inchesPerFoot': 3, 'installCost': 0.80, 'cleanupCost': 0},
        'ceiling': {'rValue': 11.01, 'minCode': 'R32', 'inchesPerFoot': 3, 'installCost': 0.80, 'cleanupCost': 0},
        'crawlWalls': {'rValue': 14.68, 'minCode': 'R14', 'inchesPerFoot': 4, 'installCost': 0.80, 'cleanupCost': 0},
        'crawlWallsUnder2ft': {'rValue': 14.68, 'minCode': 'R14', 'inchesPerFoot': 4, 'installCost': 0.95, 'cleanupCost': 0},
        'pipes': {'rValue': 11.01, 'minCode': 'R11', 'inchesPerFoot': 3, 'installCost': 1.02, 'cleanupCost': 0},
        'polyTarping': {'rValue': 0, 'minCode': '', 'inchesPerFoot': 0, 'installCost': 1.10, 'cleanupCost': 0}
    },
    'closedCell': {
        'walls': {'rValue': 11.4, 'minCode': 'R20', 'inchesPerFoot': 2, 'installCost': 2.20, 'cleanupCost': 0},
        'ceiling': {'rValue': 11.4, 'minCode': 'R32', 'inchesPerFoot': 2, 'installCost': 2.20, 'cleanupCost': 0},
        'crawlWalls': {'rValue': 8.55, 'minCode': 'R18', 'inchesPerFoot': 1.5, 'installCost': 2.20, 'cleanupCost': 0},
        'crawlWallsUnder2ft': {'rValue': 17.1, 'minCode': 'R18', 'inchesPerFoot': 3, 'installCost': 2.20, 'cleanupCost': 0},
        'insulatedTarps': {'rValue': 5.7, 'minCode': 'R5', 'inchesPerFoot': 1, 'installCost': 1.75, 'cleanupCost': 0},
        'fullFillWalls': {'rValue': 22.8, 'minCode': 'R20', 'inchesPerFoot': 4, 'installCost': 2.20, 'cleanupCost': 0},
        'underSlab': {'rValue': 11.4, 'minCode': 'R12', 'inchesPerFoot': 2, 'installCost': 3.30, 'cleanupCost': 0},
        'rimJoists': {'rValue': 0, 'minCode': 'R24/4"', 'inchesPerFoot': 0, 'installCost': 13.50, 'cleanupCost': 0}
    }
}

@main.route('/api/quote', methods=['POST'])
def create_quote():
    data = request.json
    
    # Create customer
    customer = Customer(
        name=data['customer']['name'],
        email=data['customer']['email'],
        phone=data['customer']['phone'],
        address=data['customer']['address']
    )
    db.session.add(customer)
    db.session.flush()
    
    # Create quote
    quote = Quote(
        customer_id=customer.id,
        total_amount=data['totalAmount']
    )
    db.session.add(quote)
    db.session.flush()
    
    # Add locations
    for loc in data['insulation']['locations']:
        location = InsulationLocation(
            quote_id=quote.id,
            location_type=loc['location'],
            insulation_type=data['insulation']['type'],
            square_footage=float(loc['squareFootage']),
            thickness=float(loc['thickness']),
            r_value=INSULATION_TYPES[data['insulation']['type']][loc['location']]['rValue'],
            install_cost=INSULATION_TYPES[data['insulation']['type']][loc['location']]['installCost'],
            cleanup_cost=INSULATION_TYPES[data['insulation']['type']][loc['location']]['cleanupCost'],
            total_cost=float(loc['squareFootage']) * float(loc['thickness']) * 
                      INSULATION_TYPES[data['insulation']['type']][loc['location']]['installCost']
        )
        db.session.add(location)
    
    db.session.commit()
    
    # Generate PDF
    pdf_path = generate_pdf(quote.id)
    
    return jsonify({
        'message': 'Quote created successfully',
        'quote_id': quote.id,
        'pdf_url': f'/api/quotes/{quote.id}/pdf'
    }), 201

@main.route('/api/quotes/<int:quote_id>', methods=['GET'])
def get_quote(quote_id):
    quote = Quote.query.get_or_404(quote_id)
    return jsonify({
        'id': quote.id,
        'customer': {
            'name': quote.customer.name,
            'email': quote.customer.email,
            'phone': quote.customer.phone,
            'address': quote.customer.address
        },
        'locations': [{
            'location_type': loc.location_type,
            'insulation_type': loc.insulation_type,
            'square_footage': loc.square_footage,
            'thickness': loc.thickness,
            'total_cost': loc.total_cost
        } for loc in quote.locations],
        'total_amount': quote.total_amount,
        'date_created': quote.date_created.isoformat()
    })


@main.route('/api/quotes/<int:quote_id>/pdf')
def get_quote_pdf(quote_id):
    try:
        filename = generate_pdf(quote_id)
        return send_from_directory(
            os.path.join(app.root_path, '..', 'static', 'pdfs'),
            filename,
            as_attachment=True,
            download_name=f'Insulation_Quote_{quote_id}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 400