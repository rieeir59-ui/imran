
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { projectChecklistData, ProjectChecklistItem } from "@/lib/projects-data";

const statusVariant = {
  "Completed": "default",
  "In Progress": "secondary",
  "Not Started": "outline",
}

export default function ProjectsPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Serial No.</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectChecklistData.map((item: ProjectChecklistItem) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status] as any}>{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
