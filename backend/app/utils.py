from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from app.models import Quote, InsulationLocation
import os
from datetime import datetime

def generate_pdf(quote_id):
    # Get quote data
    quote = Quote.query.get(quote_id)
    if not quote:
        raise ValueError("Quote not found")

    # Create PDF directory if it doesn't exist
    pdf_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'pdfs')
    os.makedirs(pdf_dir, exist_ok=True)
    
    # PDF file path
    filename = f'quote_{quote_id}_{datetime.now().strftime("%Y%m%d")}.pdf'
    pdf_path = os.path.join(pdf_dir, filename)

    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )

    # Styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        spaceAfter=30
    ))
    styles.add(ParagraphStyle(
        name='CustomHeading',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=12
    ))
    styles.add(ParagraphStyle(
        name='CustomBody',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=6
    ))

    # Build content
    elements = []

    # Header
    elements.append(Paragraph("Insulation Quote", styles['CustomTitle']))
    elements.append(Paragraph(f"Quote #: {quote.id}", styles['CustomBody']))
    elements.append(Paragraph(f"Date: {quote.date_created.strftime('%B %d, %Y')}", styles['CustomBody']))
    elements.append(Spacer(1, 20))

    # Customer Information
    elements.append(Paragraph("Customer Information", styles['CustomHeading']))
    elements.append(Paragraph(f"Name: {quote.customer.name}", styles['CustomBody']))
    elements.append(Paragraph(f"Email: {quote.customer.email}", styles['CustomBody']))
    elements.append(Paragraph(f"Phone: {quote.customer.phone}", styles['CustomBody']))
    elements.append(Paragraph(f"Address: {quote.customer.address}", styles['CustomBody']))
    elements.append(Spacer(1, 20))

    # Insulation Details
    elements.append(Paragraph("Insulation Details", styles['CustomHeading']))

    # Create table header
    table_data = [
        ['Location', 'Type', 'Square Footage', 'Thickness', 'R-Value', 'Install Cost', 'Total Cost']
    ]

    # Add location data
    for location in quote.locations:
        table_data.append([
            location.location_type.replace(/([A-Z])/g, ' $1').title(),
            location.insulation_type.replace(/([A-Z])/g, ' $1').title(),
            f"{location.square_footage:.2f} sq ft",
            f"{location.thickness:.1f}\"",
            f"R-{location.r_value:.1f}",
            f"${location.install_cost:.2f}/sqft/inch",
            f"${location.total_cost:.2f}"
        ])

    # Add total row
    table_data.append([
        'Total',
        '',
        '',
        '',
        '',
        '',
        f"${quote.total_amount:.2f}"
    ])

    # Create and style table
    table = Table(table_data, colWidths=[1.5*inch, 1*inch, 1*inch, 0.8*inch, 0.8*inch, 1*inch, 1*inch])
    table.setStyle(TableStyle([
        # Borders
        ('GRID', (0, 0), (-1, -2), 1, colors.black),
        ('BOX', (0, -1), (-1, -1), 1, colors.black),
        
        # Header style
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        
        # Total row style
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        
        # Align numbers right
        ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
        
        # Cell padding
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))

    # Terms and Conditions
    elements.append(Paragraph("Terms and Conditions", styles['CustomHeading']))
    terms = [
        "1. This quote is valid for 30 days from the date of issue.",
        "2. 50% deposit required to schedule installation.",
        "3. Final payment due upon completion of work.",
        "4. All work to be completed according to local building codes.",
        "5. Minimum R-values are in accordance with local energy codes.",
        "6. Cleanup and disposal of materials included in price.",
        "7. Work area to be left clean and free of debris.",
        "8. One-year warranty on materials and labor."
    ]
    for term in terms:
        elements.append(Paragraph(term, styles['CustomBody']))

    # Build PDF
    doc.build(elements)
    
    return filename