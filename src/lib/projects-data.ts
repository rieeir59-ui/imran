export type ProjectChecklistItem = {
  id: number;
  title: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
};

export const projectChecklistData: ProjectChecklistItem[] = [
  { id: 1, title: 'Project Checklist', status: 'Completed' },
  { id: 2, title: 'Project Information', status: 'Completed' },
  { id: 3, title: 'Predesign general assessment', status: 'In Progress' },
  { id: 4, title: 'Project Data', status: 'In Progress' },
  { id: 5, title: 'Project Agreement', status: 'Not Started' },
  { id: 6, title: 'List of Services', status: 'Not Started' },
  { id: 7, title: 'Requirement Performa (for Residential Project) site plan Site Survey', status: 'Not Started' },
  { id: 8, title: 'Site Survey', status: 'Not Started' },
  { id: 9, title: 'Project Bylaws', status: 'Not Started' },
  { id: 10, title: 'Proposal request', status: 'Not Started' },
  { id: 11, title: 'Drawings (architectural/interior/submission)', status: 'Not Started' },
  { id: 12, title: 'Shop Drawings Sample Record', status: 'Not Started' },
  { id: 13, title: 'Project Chart (Studio)', status: 'Not Started' },
  { id: 14, title: 'Architect field report/Transmittal letter/minutes of the meeting', status: 'Not Started' },
  { id: 15, title: 'List Of Sub consultants', status: 'Not Started' },
  { id: 16, title: 'List of Contractors', status: 'Not Started' },
  { id: 17, title: 'List of approve vendors', status: 'Not Started' },
  { id: 18, title: 'Time line Schedule', status: 'Not Started' },
  { id: 19, title: 'Project Application Summary', status: 'Not Started' },
  { id: 20, title: 'Continuation Sheet', status: 'Not Started' },
  { id: 21, title: 'Construction Activity schedule', status: 'Not Started' },
  { id: 22, title: 'Preliminary Project Budget', status: 'Not Started' },
  { id: 23, title: 'Bill Of Quantity', status: 'Not Started' },
  { id: 24, title: 'Rate Analysis', status: 'Not Started' },
  { id: 25, title: 'Change Order', status: 'Not Started' },
  { id: 26, title: 'Application and Certificate for Payment', status: 'Not Started' },
  { id: 27, title: 'Instruction Sheet', status: 'Not Started' },
  { id: 28, title: 'Other Provisions', status: 'Not Started' },
  { id: 29, title: 'Consent of Surety', status: 'Not Started' },
  { id: 30, title: 'Certificate Substantial Summary', status: 'Not Started' },
  { id: 31, title: 'Total Package of Project', status: 'Not Started' },
  { id: 32, title: 'Architects Supplemental Instructions', status: 'Not Started' },
  { id: 33, title: 'Construction Change Director', status: 'Not Started' },
];
