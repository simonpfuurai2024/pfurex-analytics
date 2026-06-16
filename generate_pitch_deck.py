from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("Helvetica", size=14)

pdf.cell(200, 10, txt="ZimSupplyCo - Investor Pitch Deck", align="C", ln=True)
pdf.ln(10)

pdf.set_font("Helvetica", size=12)
pdf.cell(200, 8, txt="1. Executive Summary", ln=True)
pdf.set_font("Helvetica", size=10)
pdf.multi_cell(0, 6, txt="ZimSupplyCo is a digital logistics platform connecting informal traders with affordable transport. We solve fragmented logistics by aggregating vehicles and providing real-time tracking, with a 40% cost reduction over traditional couriers.")

pdf.ln(5)
pdf.set_font("Helvetica", size=12)
pdf.cell(200, 8, txt="2. Business Model", ln=True)
pdf.set_font("Helvetica", size=10)
pdf.multi_cell(0, 6, txt="15% commission per delivery, plus subscription for premium features. Customers are informal traders and SMEs. Sales channels: mobile app, USSD, and B2B partnerships.")

pdf.ln(5)
pdf.set_font("Helvetica", size=12)
pdf.cell(200, 8, txt="3. Traction", ln=True)
pdf.set_font("Helvetica", size=10)
pdf.multi_cell(0, 6, txt="2,000+ deliveries, 500 active drivers, 1,200 registered businesses. Revenue growing 150% month-over-month. Integrated with EcoCash.")

pdf.ln(5)
pdf.set_font("Helvetica", size=12)
pdf.cell(200, 8, txt="4. Team", ln=True)
pdf.set_font("Helvetica", size=10)
pdf.multi_cell(0, 6, txt="CEO: Simon Pfuurai (Comp Sys Eng), CTO: Tinashe Matore (ex-Econet), Ops Lead: Chiedza Moyo (ex-DHL).")

pdf.ln(5)
pdf.set_font("Helvetica", size=12)
pdf.cell(200, 8, txt="5. Funding Ask", ln=True)
pdf.set_font("Helvetica", size=10)
pdf.multi_cell(0, 6, txt="Seeking $100,000 for 30% equity, with buyback option. Funds will expand to Gweru and Masvingo, hire developers, and scale marketing.")

pdf.output("ZimSupplyCo_Pitch_Deck.pdf")
print("Created ZimSupplyCo_Pitch_Deck.pdf")
