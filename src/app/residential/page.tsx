
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
import { ResidentialProperty } from "@/lib/data";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export default function ResidentialPage() {
  const { data } = useData();

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Residential Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.residential.map((property: ResidentialProperty) => (
                <TableRow key={property.id}>
                  <TableCell>{property.id}</TableCell>
                  <TableCell>{property.name}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell className="text-right">{formatCurrency(property.value)}</TableCell>
                  <TableCell className="text-right">{property.units}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
