import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportDataToCsv(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.error("No data available to export.");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(fieldName =>
        JSON.stringify(row[fieldName] || '', (key, value) => value || '')
      ).join(',')
    )
  ];

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportDataToPdf(title: string, data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.error("No data available to export.");
    return;
  }
  
  const doc = new jsPDF({
    orientation: "landscape",
  });
  
  doc.text(title, 14, 15);

  const tableHeaders = [
    "Sr.No", "Project Name", "Area", "Project Holder", "Allocation Date", 
    "Site Survey Start", "Site Survey End", "Contact", "Head Count",
    "Proposal Start", "Proposal End", "3D Start", "3D End",
    "Tender Arch Start", "Tender Arch End", "Tender MEP Start", "Tender MEP End",
    "BOQ Start", "BOQ End", "Tender Status", "Comparative",
    "Working Drawings Start", "Working Drawings End", "Site Visit", "Final Bill", "Project Closure"
  ];
  
  const tableData = data.map(item => [
    item.srNo,
    item.projectName,
    item.area,
    item.projectHolder,
    item.allocationDate,
    (item as any).siteSurveyStart,
    (item as any).siteSurveyEnd,
    (item as any).contact,
    (item as any).headCount,
    (item as any).proposalStart,
    (item as any).proposalEnd,
    (item as any)['3dStart'],
    (item as any)['3dEnd'],
    (item as any).tenderArchStart,
    (item as any).tenderArchEnd,
    (item as any).tenderMepStart,
    (item as any).tenderMepEnd,
    (item as any).boqStart,
    (item as any).boqEnd,
    (item as any).tenderStatus,
    (item as any).comparative,
    (item as any).workingDrawingsStart,
    (item as any).workingDrawingsEnd,
    (item as any).siteVisit,
    (item as any).finalBill,
    (item as any).projectClosure
  ].map(val => val !== undefined && val !== null ? String(val) : ''));

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 20,
    theme: 'grid',
    styles: {
      fontSize: 5,
      cellPadding: 1,
    },
    headStyles: {
        fillColor: [22, 163, 74],
        textColor: [255, 255, 255],
        fontSize: 6,
    }
  });

  doc.save(`${filename}.pdf`);
}
