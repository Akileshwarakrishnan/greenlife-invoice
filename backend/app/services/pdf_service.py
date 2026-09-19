import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_LEFT, TA_CENTER
from app.core.config import settings
from app.utils.number_words import number_to_words_inr

def draw_page_frame(canvas, doc):
    """Draws the dark green outer rounded border matching client's official template."""
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#284B35"))
    canvas.setLineWidth(1.5)
    # A4 is 595.27 x 841.89 points
    canvas.roundRect(18, 18, 559, 805, 8, fill=0)
    canvas.restoreState()

def generate_invoice_pdf(invoice_data: dict, is_quotation: bool = False) -> bytes:
    """
    Generates a PDF exactly matching the client's official bill template:
    - CASH / CREDIT BILL (media_1789831879300.jpg)
    - PRODUCT QUOTATION (media_1789831900563.jpg)
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=26,
        leftMargin=26,
        topMargin=26,
        bottomMargin=26
    )

    story = []
    styles = getSampleStyleSheet()

    # Brand Colors matching template
    c_deep_green = colors.HexColor("#284B35")
    c_sage = colors.HexColor("#E4EFE7")
    c_border = colors.HexColor("#284B35")

    # Typography styles (Using standard Helvetica with 'Rs.' to prevent Unicode '■' boxes)
    tbl_hdr_style = ParagraphStyle(
        "TblHdr",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=c_deep_green
    )
    tbl_cell_style = ParagraphStyle(
        "TblCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.black
    )
    tbl_cell_c_style = ParagraphStyle(
        "TblCellC",
        parent=tbl_cell_style,
        alignment=TA_CENTER
    )
    tbl_cell_r_style = ParagraphStyle(
        "TblCellR",
        parent=tbl_cell_style,
        alignment=TA_RIGHT
    )
    box_hdr_style = ParagraphStyle(
        "BoxHdr",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=9,
        alignment=TA_CENTER,
        textColor=c_deep_green
    )
    box_text_style = ParagraphStyle(
        "BoxText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7,
        leading=9,
        textColor=colors.HexColor("#222222")
    )
    meta_pill_style = ParagraphStyle(
        "MetaPill",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=12,
        alignment=TA_CENTER,
        textColor=c_deep_green
    )

    # 1. EXACT CLIENT BILL HEADER BANNER (With Goddess Lakshmi Logo, FSSAI, MSME, Tamil & English text)
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    bill_header_path = os.path.join(static_dir, "bill_header.png")

    if os.path.exists(bill_header_path):
        # Header image aspect ratio is 651 x 203. Display at width 540 pt -> height = 135 pt
        header_img = RLImage(bill_header_path, width=540, height=135)
        story.append(header_img)
    else:
        # Fallback text if image missing
        fb_text = f"""
        <b>{settings.BUSINESS_NAME}</b><br/>
        {settings.BUSINESS_ADDRESS}<br/>
        Phone: {settings.BUSINESS_PHONE} | Email: {settings.BUSINESS_EMAIL}
        """
        story.append(Paragraph(fb_text, tbl_cell_c_style))

    story.append(Spacer(1, 4))

    # 2. BILL META BAR (No. | Title Pill | Date)
    inv_num = invoice_data.get('invoice_number', 'GLNF/25-26/0001')
    inv_date = invoice_data.get('invoice_date', datetime.now().strftime('%d/%m/%Y'))
    pill_title = "PRODUCT QUOTATION" if is_quotation else "CASH / CREDIT BILL"

    meta_table = Table(
        [
            [
                Paragraph(f"<b>No.</b> &nbsp; {inv_num}", tbl_cell_style),
                Paragraph(f"<b>{pill_title}</b>", meta_pill_style),
                Paragraph(f"<b>Date :</b> &nbsp; {inv_date}", tbl_cell_r_style)
            ]
        ],
        colWidths=[180, 180, 180]
    )
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (1, 0), (1, 0), c_sage),
        ('BOX', (1, 0), (1, 0), 1, c_border),
        ('PADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, c_border),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 4))

    # 3. CUSTOMER PARTICULARS BOX
    cust_name = invoice_data.get('customer_name', 'Walk-in Customer')
    cust_addr = invoice_data.get('customer_address', 'Direct Store Visit')
    cust_phone = invoice_data.get('customer_phone', '')
    cust_gst = invoice_data.get('customer_gstin') or 'Not Applicable'

    cust_info_text = f"""
    <b>Name &nbsp; : &nbsp; {cust_name}</b><br/>
    <b>Address : &nbsp;</b> {cust_addr}<br/>
    <b>Mobile : &nbsp;</b> {cust_phone} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>GST : &nbsp;</b> {cust_gst}
    """

    cust_table = Table(
        [[Paragraph(cust_info_text, tbl_cell_style)]],
        colWidths=[540]
    )
    cust_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 1, c_border),
    ]))
    story.append(cust_table)
    story.append(Spacer(1, 4))

    # 4. CURRENT BILL ITEMS TABLE
    items_data = [
        [
            Paragraph("<b>Mrp.</b>", tbl_hdr_style),
            Paragraph("<b>Particulars</b>", tbl_hdr_style),
            Paragraph("<b>Kg./Ltr./Unit</b>", tbl_hdr_style),
            Paragraph("<b>Qty</b>", tbl_hdr_style),
            Paragraph("<b>Rate (Rs.)</b>", tbl_hdr_style),
            Paragraph("<b>Amount (Rs.)</b>", tbl_hdr_style)
        ]
    ]

    items = invoice_data.get("items", [])
    subtotal = float(invoice_data.get("subtotal") or 0.0)

    for idx, it in enumerate(items, 1):
        p_name = it.get('product_name', '')
        unit = it.get('unit', 'kg')
        qty = it.get('quantity', 1)
        price = float(it.get('unit_price') or 0.0)
        tot = float(it.get('total_amount') or (qty * price))
        items_data.append([
            Paragraph(str(idx), tbl_cell_c_style),
            Paragraph(f"<b>{p_name}</b>", tbl_cell_style),
            Paragraph(str(unit), tbl_cell_c_style),
            Paragraph(f"{qty:g}", tbl_cell_c_style),
            Paragraph(f"{price:.2f}", tbl_cell_r_style),
            Paragraph(f"{tot:.2f}", tbl_cell_r_style)
        ])

    # Pad with empty rows to preserve traditional bill form structure if items < 3
    for _ in range(max(0, 3 - len(items))):
        items_data.append([
            Paragraph("", tbl_cell_style),
            Paragraph("", tbl_cell_style),
            Paragraph("", tbl_cell_style),
            Paragraph("", tbl_cell_style),
            Paragraph("", tbl_cell_style),
            Paragraph("", tbl_cell_style)
        ])

    # Total row
    items_data.append([
        Paragraph("<b>TOTAL</b>", ParagraphStyle("TotHdr", parent=tbl_hdr_style, alignment=TA_RIGHT)),
        "", "", "", "",
        Paragraph(f"<b>{subtotal:.2f}</b>", ParagraphStyle("TotVal", parent=tbl_cell_r_style, fontName="Helvetica-Bold"))
    ])

    items_table = Table(
        items_data,
        colWidths=[35, 235, 75, 45, 75, 75]
    )
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_sage),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('SPAN', (0, -1), (4, -1)),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 4))

    # 5. OLD BILL DETAILS (PREVIOUS INVOICE)
    prev_balance = float(invoice_data.get("previous_balance") or 0.0)
    old_bill_data = [
        [
            Paragraph("<b>OLD BILL DETAILS (Previous Invoice)</b>", ParagraphStyle("OldHdr", parent=tbl_hdr_style, textColor=colors.white))
        ]
    ]
    
    old_hdr_table = Table(old_bill_data, colWidths=[540])
    old_hdr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_deep_green),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('PADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(old_hdr_table)

    old_items_data = [
        [
            Paragraph("<b>Old Bill No.</b> &nbsp; GLNF-PREV-DUE", tbl_cell_style),
            Paragraph("", tbl_cell_style),
            Paragraph("", tbl_cell_style),
            Paragraph("", tbl_cell_style),
            Paragraph("<b>Old Bill Date :</b> &nbsp; Previous Record", tbl_cell_r_style),
            Paragraph("", tbl_cell_style)
        ],
        [
            Paragraph("<b>Mrp.</b>", tbl_hdr_style),
            Paragraph("<b>Particulars</b>", tbl_hdr_style),
            Paragraph("<b>Kg./Ltr./Unit</b>", tbl_hdr_style),
            Paragraph("<b>Qty</b>", tbl_hdr_style),
            Paragraph("<b>Rate (Rs.)</b>", tbl_hdr_style),
            Paragraph("<b>Amount (Rs.)</b>", tbl_hdr_style)
        ]
    ]

    if prev_balance > 0:
        old_items_data.append([
            Paragraph("1", tbl_cell_c_style),
            Paragraph("Previous Balance Due", tbl_cell_style),
            Paragraph("Account", tbl_cell_c_style),
            Paragraph("1", tbl_cell_c_style),
            Paragraph(f"{prev_balance:.2f}", tbl_cell_r_style),
            Paragraph(f"{prev_balance:.2f}", tbl_cell_r_style)
        ])
    else:
        old_items_data.append([
            Paragraph("-", tbl_cell_c_style),
            Paragraph("No Old Balance", tbl_cell_style),
            Paragraph("-", tbl_cell_c_style),
            Paragraph("-", tbl_cell_c_style),
            Paragraph("0.00", tbl_cell_r_style),
            Paragraph("0.00", tbl_cell_r_style)
        ])

    old_items_data.append([
        Paragraph("<b>OLD BILL TOTAL</b>", ParagraphStyle("OldTot", parent=tbl_hdr_style, alignment=TA_RIGHT)),
        "", "", "", "",
        Paragraph(f"<b>{prev_balance:.2f}</b>", ParagraphStyle("OldVal", parent=tbl_cell_r_style, fontName="Helvetica-Bold"))
    ])

    old_table = Table(old_items_data, colWidths=[35, 235, 75, 45, 75, 75])
    old_table.setStyle(TableStyle([
        ('SPAN', (0, 0), (3, 0)),
        ('SPAN', (4, 0), (5, 0)),
        ('BACKGROUND', (0, 1), (-1, 1), c_sage),
        ('GRID', (0, 1), (-1, -1), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('SPAN', (0, -1), (4, -1)),
        ('PADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(old_table)
    story.append(Spacer(1, 4))

    # 6. BOTTOM 4-BOX SECTION (DELIVERY MODE | PAYMENT MODE | COURIER DETAILS | BILL SUMMARY)
    courier_charges = float(invoice_data.get("courier_charges") or 0.0)
    grand_total = float(invoice_data.get("grand_total") or (subtotal + prev_balance + courier_charges))
    pay_method = (invoice_data.get("payment_method") or "cash").lower()
    
    is_walkin = courier_charges == 0
    is_courier = courier_charges > 0

    delivery_text = f"""
    <b>DELIVERY MODE</b><br/><br/>
    {'[X]' if is_walkin else '[  ]'} Walk-in<br/>
    {'[X]' if is_courier else '[  ]'} Courier<br/>
    [  ] Home Delivery
    """

    payment_text = f"""
    <b>PAYMENT MODE</b><br/><br/>
    {'[X]' if pay_method == 'cash' else '[  ]'} Cash<br/>
    {'[X]' if pay_method == 'upi' else '[  ]'} UPI<br/>
    {'[X]' if pay_method == 'bank_transfer' else '[  ]'} Bank Transfer<br/>
    {'[X]' if pay_method == 'credit' else '[  ]'} Credit
    """

    courier_text = f"""
    <b>COURIER DETAILS</b><br/><br/>
    Courier Partner : {'ST Courier' if is_courier else '...............'}<br/>
    Tracking No. &nbsp;&nbsp;&nbsp;&nbsp;: {'TRK-' + str(inv_num)[-4:] if is_courier else '...............'}
    """

    summary_rows = [
        [Paragraph("<b>BILL SUMMARY</b>", ParagraphStyle("SumHdr", parent=box_hdr_style, textColor=colors.white)), ""],
        [Paragraph("Product Total", box_text_style), Paragraph(f"Rs. {subtotal:,.2f}", tbl_cell_r_style)],
        [Paragraph("Courier Charges", box_text_style), Paragraph(f"Rs. {courier_charges:,.2f}", tbl_cell_r_style)],
        [Paragraph("<b>GRAND TOTAL</b>", ParagraphStyle("GTText", parent=box_text_style, fontName="Helvetica-Bold", fontSize=8)),
         Paragraph(f"<b>Rs. {grand_total:,.2f}</b>", ParagraphStyle("GTVAl", parent=tbl_cell_r_style, fontName="Helvetica-Bold", fontSize=8, textColor=c_deep_green))]
    ]
    summary_table = Table(summary_rows, colWidths=[80, 80])
    summary_table.setStyle(TableStyle([
        ('SPAN', (0, 0), (1, 0)),
        ('BACKGROUND', (0, 0), (1, 0), c_deep_green),
        ('BACKGROUND', (0, 3), (1, 3), c_sage),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('PADDING', (0, 0), (-1, -1), 2),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    bottom_boxes_table = Table(
        [
            [
                Paragraph(delivery_text, box_text_style),
                Paragraph(payment_text, box_text_style),
                Paragraph(courier_text, box_text_style),
                summary_table
            ]
        ],
        colWidths=[105, 105, 150, 180]
    )
    bottom_boxes_table.setStyle(TableStyle([
        ('BOX', (0, 0), (0, 0), 0.5, c_border),
        ('BOX', (1, 0), (1, 0), 0.5, c_border),
        ('BOX', (2, 0), (2, 0), 0.5, c_border),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (2, 0), 3),
        ('PADDING', (3, 0), (3, 0), 0),
    ]))
    story.append(bottom_boxes_table)
    story.append(Spacer(1, 4))

    # 7. RUPEES IN WORDS & PROPRIETOR SIGN-OFF
    words_rupees = number_to_words_inr(grand_total)
    sign_table = Table(
        [
            [
                Paragraph(f"<b>Rupees (in words) :</b> &nbsp; {words_rupees}", tbl_cell_style),
                Paragraph("_____________________<br/>Proprietor<br/><b>RVS.Arumugam</b>", tbl_cell_r_style)
            ]
        ],
        colWidths=[380, 160]
    )
    sign_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(sign_table)
    story.append(Spacer(1, 4))

    # 8. FOOTER BANK DETAILS BOX (SBI UDUMALPET)
    bank_text = f"""
    <b>BANK:</b> {settings.BUSINESS_BANK_NAME} &nbsp;|&nbsp; <b>IFSC:</b> {settings.BUSINESS_IFSC}<br/>
    <b>A/C NAME:</b> {settings.BUSINESS_ACCOUNT_NAME} &nbsp;|&nbsp; <b>C/C :</b> {settings.BUSINESS_ACCOUNT_NUMBER}
    """
    bank_table = Table(
        [
            [Paragraph(bank_text, ParagraphStyle("BankP", parent=tbl_cell_style, fontSize=7.5, leading=9, alignment=TA_CENTER))]
        ],
        colWidths=[540]
    )
    bank_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_sage),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('PADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(bank_table)

    # Build PDF document with outer border on page
    doc.build(story, onFirstPage=draw_page_frame, onLaterPages=draw_page_frame)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
