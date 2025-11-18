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

type OverallStatus = {
  no: number;
  text: string;
  [key: string]: any;
};

type Remarks = {
    text: string;
    date: string;
}

export function exportDataToPdf(title: string, data: any[], filename: string, overallStatus?: OverallStatus[], remarks?: Remarks) {
  if (!data || data.length === 0) {
    console.error("No data available to export.");
    return;
  }
  
  const doc = new jsPDF({
    orientation: "landscape",
  });
  
  doc.text(title, 14, 15);

  const tableHeaders = Object.keys(data[0]).map(key => {
    // Simple camelCase to Title Case conversion
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  });
  
  const tableData = data.map(item => Object.values(item).map(val => val !== undefined && val !== null ? String(val) : ''));

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 20,
    theme: 'grid',
    styles: {
      fontSize: 5,
      cellPadding: 1,
      overflow: 'linebreak',
    },
    headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontSize: 6,
    },
    didDrawPage: (data) => {
        // Optional: if you want to add footers etc.
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY || 20;

  if (overallStatus && overallStatus.length > 0) {
    finalY += 10;
    doc.text("Overall Status", 14, finalY);
    autoTable(doc, {
      startY: finalY + 2,
      head: [['No.', 'Status']],
      body: overallStatus.map(s => [s.no, s.text]),
      theme: 'grid',
      headStyles: { fillColor: [241, 245, 249] /* slate-100 */, textColor: [30, 41, 59] },
    });
    finalY = (doc as any).lastAutoTable.finalY;
  }

  if (remarks && remarks.text) {
    finalY += 10;
    doc.text("Remarks", 14, finalY);
    const splitText = doc.splitTextToSize(remarks.text, 260);
    doc.text(splitText, 14, finalY + 5);
    if(remarks.date) {
        doc.text(`Date: ${remarks.date}`, 14, finalY + 5 + (splitText.length * 5) + 5);
    }
  }


  doc.save(`${filename}.pdf`);
}
