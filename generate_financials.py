import openpyxl
from openpyxl.styles import Font

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Cash Flow 2025"

# Header
ws.append(["Month", "Revenue (USD)", "Operating Expenses (USD)", "Net Cash Flow"])
for cell in ws[1]:
    cell.font = Font(bold=True)

# Data rows
data = [
    ["2025-01", 12000, 8000, 4000],
    ["2025-02", 13500, 8200, 5300],
    ["2025-03", 15000, 8500, 6500],
    ["2025-04", 17000, 8800, 8200],
    ["2025-05", 19000, 9000, 10000],
    ["2025-06", 21000, 9500, 11500],
]
for row in data:
    ws.append(row)

# Summary row
ws.append([])
ws.append(["Total", sum(d[1] for d in data), sum(d[2] for d in data), sum(d[3] for d in data)])

wb.save("ZimSupplyCo_Financials.xlsx")
print("✅ Created ZimSupplyCo_Financials.xlsx")
