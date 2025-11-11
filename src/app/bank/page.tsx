
"use client";

import { useData } from "@/lib/data-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankBranch } from "@/lib/data";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};

export default function BankPage() {
  const { data } = useData();

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Bank Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Transaction Volume</TableHead>
                <TableHead className="text-right">Employees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bank.map((branch: BankBranch) => (
                <TableRow key={branch.id}>
                  <TableCell>{branch.id}</TableCell>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.location}</TableCell>
                  <TableCell className="text-right">{formatCurrency(branch.value)}</TableCell>
                  <TableCell className="text-right">{formatNumber(branch.transactionVolume)}</TableCell>
                  <TableCell className="text-right">{branch.employees}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
