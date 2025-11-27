
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { collection, addDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const designations = [
    "Architect",
    "Draftsperson",
    "3D Visualizer",
    "Quantity Surveyor",
    "Finance Manager",
    "Software Engineer",
];

function AddEmployeeForm() {
    const searchParams = useSearchParams();
    const designationQueryParam = searchParams.get('designation') || '';

    const [employeeName, setEmployeeName] = useState('');
    const [designation, setDesignation] = useState(designationQueryParam);
    const [isSaving, setIsSaving] = useState(false);

    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const employeesCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/employees`);
    }, [user, firestore]);

    const handleAddEmployee = () => {
        if (!employeesCollectionRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot add employee. User not authenticated.' });
            return;
        }
        if (!employeeName || !designation) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide both name and designation.' });
            return;
        }

        setIsSaving(true);
        const employeeData = {
            name: employeeName,
            designation: designation,
        };

        addDoc(employeesCollectionRef, employeeData)
          .then(() => {
            toast({ title: 'Employee Added!', description: `${employeeName} has been added to the ${designation} team.` });
            setEmployeeName('');
            setDesignation(designationQueryParam); // Reset to default or passed param
          })
          .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: employeesCollectionRef.path,
                operation: 'create',
                requestResourceData: employeeData,
            });
            errorEmitter.emit('permission-error', permissionError);
          })
          .finally(() => {
            setIsSaving(false);
          });
    };

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                 <div className="mb-4">
                    <Button variant="outline" asChild>
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Add a New Employee</CardTitle>
                        <CardDescription>Enter the details for the new team member.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employee-name">Employee Name</Label>
                            <Input
                                id="employee-name"
                                value={employeeName}
                                onChange={(e) => setEmployeeName(e.target.value)}
                                placeholder="e.g., John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Select onValueChange={setDesignation} value={designation}>
                                <SelectTrigger id="designation">
                                    <SelectValue placeholder="Select a designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddEmployee} disabled={isSaving} className="w-full">
                            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Add Employee
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}


export default function AddEmployeePage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <AddEmployeeForm />
        </React.Suspense>
    )
}
