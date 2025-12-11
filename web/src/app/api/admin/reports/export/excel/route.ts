import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

// 🔹 Placeholder for DB function
async function getExcelData() {
  return [
    { id: "T001", title: "Example Task", status: "Completed", date: new Date().toLocaleString() }
  ];
}

export async function POST() {
  const data = await getExcelData();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("SolveIt Report");

  sheet.columns = [
    { header: "Task ID", key: "id", width: 15 },
    { header: "Title", key: "title", width: 35 },
    { header: "Status", key: "status", width: 15 },
    { header: "Date", key: "date", width: 25 },
  ];

  data.forEach(row => sheet.addRow(row));

  // Convert to Buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="solveit-report.xlsx"`,
    },
  });
}
