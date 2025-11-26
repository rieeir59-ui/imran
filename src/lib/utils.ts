
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

export function exportDataToPdf(title: string, data: any[], filename:string, overallStatus?: OverallStatus[], remarks?: Remarks) {
  if (!data || data.length === 0) {
    console.error("No data available to export.");
    return;
  }
  
  const doc = new jsPDF({
    orientation: "landscape",
  });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 58, 83);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  const headers = Object.keys(data[0]);
  const tableHeaders = headers.map(key => {
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  });
  
  const tableData = data.map(item => headers.map(header => {
    const value = item[header];
    return value !== undefined && value !== null ? String(value) : '';
  }));

  const columnStyles: { [key: string]: any } = {};
  headers.forEach((header, index) => {
      let width = 20; // default width
      if (header.toLowerCase().includes('name')) {
          width = 35;
      } else if (header.toLowerCase().includes('date')) {
          width = 20;
      } else if (header.toLowerCase().includes('area')) {
          width = 18;
      } else if (header.toLowerCase().includes('holder')) {
          width = 25;
      } else if (header.toLowerCase() === 'srno') {
          width = 10;
      }
      columnStyles[index] = { cellWidth: width };
  });


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
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 6,
        fontStyle: 'bold',
    },
    columnStyles: columnStyles
  });

  let finalY = (doc as any).lastAutoTable.finalY || 20;

  if (finalY > 180) { // check if new page is needed
    doc.addPage();
    finalY = 15;
  }

  if (overallStatus && overallStatus.length > 0) {
    finalY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Overall Status", 14, finalY);
    doc.setFont('helvetica', 'normal');
    autoTable(doc, {
      startY: finalY + 4,
      head: [['No.', 'Status']],
      body: overallStatus.map(s => [s.no, s.text]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });
    finalY = (doc as any).lastAutoTable.finalY;
  }

  if (remarks && remarks.text) {
    if (finalY > 180) {
        doc.addPage();
        finalY = 15;
    }
    finalY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Remarks", 14, finalY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(remarks.text, 260);
    doc.text(splitText, 14, finalY + 6);
    if(remarks.date) {
        doc.text(`Date: ${remarks.date}`, 14, finalY + 6 + (splitText.length * 5) + 5);
    }
  }

  doc.save(`${filename}.pdf`);
}

export function exportChecklistToPdf(formData: any, checklistCategories: string[], initialChecklists: any) {
  const doc = new jsPDF();
  let y = 15;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 58, 83);
  doc.text("Project Checklist", 105, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${formData.project || ''}`, 14, y);
  doc.text(`Architect: ${formData.architect || ''}`, 14, y + 5);
  doc.text(`Name, Address: ${formData.nameAddress || ''}`, 105, y);
  doc.text(`Architect Project No: ${formData.architectProjectNo || ''}`, 105, y + 5);
  doc.text(`Project Date: ${formData.projectDate || ''}`, 105, y + 10);
  y += 20;

  const tableBody: (string | { content: string; colSpan: number; styles: any })[][] = [];

  checklistCategories.forEach((categoryKey) => {
    tableBody.push([
      { 
        content: `${categoryKey.toUpperCase()}`, 
        colSpan: 2, 
        styles: { fontStyle: 'bold', fillColor: [30, 41, 59], textColor: [255, 255, 255] } 
      }
    ]);

    const subSections = initialChecklists[categoryKey];
    Object.keys(subSections).forEach((subTitle) => {
      tableBody.push([
        { 
          content: subTitle, 
          colSpan: 2, 
          styles: { fontStyle: 'bold', fillColor: [236, 240, 241], textColor: [0,0,0] } 
        }
      ]);
      
      const items = subSections[subTitle];
      items.forEach((item: string) => {
          const itemKey = `${categoryKey}-${subTitle}-${item}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
          const isChecked = formData[itemKey];
          tableBody.push([item, isChecked ? '[✓]' : '[ ]']);
      });
    });
  });

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Status']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 15, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.row.raw.length === 1 && typeof data.row.raw[0] === 'object') {
        data.cell.styles.halign = 'left';
      }
    }
  });


  doc.save('project-checklist.pdf');
}

export function exportServicesToPdf(formData: any, serviceSections: any) {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 58, 83);
    doc.text("List of Services", 105, y, { align: 'center' });
    y += 15;

    Object.entries(serviceSections).forEach(([mainTitle, subSections], mainIndex) => {
        if (y > 260) {
            doc.addPage();
            y = 15;
        }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(30, 41, 59);
        doc.rect(14, y - 5, 182, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(`${mainIndex + 1}: - ${mainTitle}`, 16, y);
        y += 9;
        doc.setTextColor(0, 0, 0);


        Object.entries(subSections as Record<string, string[]>).forEach(([subTitle, items]) => {
            if (y > 270) {
                doc.addPage();
                y = 15;
            }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(subTitle, 18, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            items.forEach(item => {
                if (y > 280) {
                    doc.addPage();
                    y = 15;
                }
                const itemKey = `${mainTitle}-${subTitle}-${item}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
                const isChecked = formData[itemKey];
                doc.text(isChecked ? '[✓]' : '[ ]', 22, y);
                doc.text(item, 30, y);
                y += 6;
            });
            y += 2;
        });
    });

    doc.save('list-of-services.pdf');
}
