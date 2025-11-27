
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from 'next/link';
import { ArrowLeft, Download, Edit, Save, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const VENDOR_LIST_DOC_ID = 'vendor-list';

const initialVendorData = {
    "Cement Vendors": [],
    "Brick Vendors": [],
    "Steel Vendors List": [],
    "Tiles Vendors": [],
    "Aluminium Products Vendor List": [],
    "GLASS VENDORS": [],
    "List of Paint Vendors": [],
    "List of Jumblon Sheet Vendors": [],
    "Waterproofing Vendors": [],
    "Imported Chemicals Vendors": [],
    "Wood Veeners Vendors": [],
    "List of Timber Vendors": [],
    "Furniture Vendors": [],
    "Kitchen Vendors": [],
    "Fire Places Vendors": [],
    "ELECTRICAL VENDORS": [],
    "Solar & Automation Vendors": [],
};

const defaultHeaders: { [key: string]: string[] } = {
    "Cement Vendors": ["Sr.No", "Company Name", "Person Name", "Products", "Address", "Contact"],
    "Brick Vendors": ["Sr.No", "Company Name", "Person Name", "Products", "Address", "Contact"],
    "Steel Vendors List": ["Sr No.", "Vendor's Name", "Contact Person", "Products", "Address", "Contact"],
    "Tiles Vendors": ["Sr No", "Company Name", "Contact Person", "Products", "Address", "Contact"],
    "Aluminium Products Vendor List": ["Sr No.", "Company Name", "Contact Person", "Products", "Address", "Contact"],
    "GLASS VENDORS": ["Sr No", "Company", "Contact Person", "Products", "Address", "Contact"],
    "List of Paint Vendors": ["Sr No.", "Company", "Contact Person", "Products", "Address", "Contact Number"],
    "List of Jumblon Sheet Vendors": ["Sr No.", "Vendor's Name", "Contact Person", "Products", "Address", "Contact"],
    "Waterproofing Vendors": ["Sr No.", "Vendors Name", "Contact Person", "Services", "Address", "Contact"],
    "Imported Chemicals Vendors": ["Sr No.", "Vendor's Name", "Contact Person", "Products", "Address", "Contact No."],
    "Wood Veeners Vendors": ["Sr No.", "Vendor's Name", "Contact Person", "Products", "Address", "Contact"],
    "List of Timber Vendors": ["Sr#", "Vendors Name", "Contact Person", "Products", "Address", "Contact No"],
    "Furniture Vendors": ["Sr No.", "Vendors Name", "Contact Person", "Services", "Address", "Contact"],
    "Kitchen Vendors": ["Sr No.", "Vendors Name", "Contact Person", "Products", "Address", "Contact"],
    "Fire Places Vendors": ["Sr No", "Vendors Name", "Contact Person", "Products", "Address", "Contact"],
    "ELECTRICAL VENDORS": ["SR #", "COMPANY", "ADDRESS", "CONTACT #", "CONTACT PERSON", "EMAIL ID"],
    "Solar & Automation Vendors": ["Sr No.", "Vendor's Name", "Contact Person", "Products", "Address", "Contact"],
};


export default function VendorListPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [vendorData, setVendorData] = useState<any>(initialVendorData);

    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/vendorList/${VENDOR_LIST_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const sanitizedData: {[key: string]: any} = {};
                Object.keys(initialVendorData).forEach(key => {
                    sanitizedData[key] = data[key] || [];
                });
                setVendorData(sanitizedData);
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'get' });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);

    const handleVendorChange = (category: string, index: number, field: string, value: string) => {
        const updatedCategory = [...vendorData[category]];
        updatedCategory[index] = { ...updatedCategory[index], [field]: value };
        setVendorData((prev: any) => ({ ...prev, [category]: updatedCategory }));
    };

    const addVendor = (category: string) => {
        const newVendor: { [key: string]: any } = { id: Date.now() };
        defaultHeaders[category].forEach(header => {
            newVendor[header] = "";
        });
        setVendorData((prev: any) => ({
            ...prev,
            [category]: [...prev[category], newVendor]
        }));
    };

    const deleteVendor = (category: string, index: number) => {
        const updatedCategory = vendorData[category].filter((_: any, i: number) => i !== index);
        setVendorData((prev: any) => ({...prev, [category]: updatedCategory}));
    };

    const handleSave = () => {
        if (!docRef) return;
        setIsSaving(true);
        setDoc(docRef, vendorData, { merge: true })
            .then(() => {
                toast({ title: "Success", description: "Vendor list saved." });
                setIsEditing(false);
            })
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'write', requestResourceData: vendorData });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        let yPos = 15;

        doc.setFontSize(18);
        doc.text("List of Approved Vendors", 105, yPos, { align: 'center' });
        yPos += 10;
        
        Object.entries(vendorData).forEach(([category, vendors]) => {
            if (Array.isArray(vendors) && vendors.length > 0) {
                 if (yPos > 250) {
                    doc.addPage();
                    yPos = 15;
                }
                const headers = Object.keys(vendors[0]).filter(key => key !== 'id');
                const body = vendors.map(vendor => headers.map(header => vendor[header]));
                
                autoTable(doc, {
                    startY: yPos,
                    head: [[{ content: category, colSpan: headers.length, styles: { halign: 'center', fillColor: [30, 41, 59], textColor: 255 } }]],
                    body: [headers, ...body],
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [70, 70, 70] },
                     didDrawPage: (data) => {
                        yPos = data.cursor?.y || 0;
                    }
                });
                yPos = (doc as any).lastAutoTable.finalY + 10;
            }
        });

        doc.save("approved-vendors.pdf");
    };

    if (isLoading || isUserLoading) return <div className="p-4 flex justify-center items-center"><Loader2 className="animate-spin"/> Loading...</div>;

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>List of Approved Vendors</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownload}><Download className="w-4 h-4 mr-2"/>PDF</Button>
                        {isEditing ? <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button> : <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" className="w-full">
                        {Object.entries(vendorData).map(([category, vendors]) => {
                           const headers = defaultHeaders[category] || (Array.isArray(vendors) && vendors.length > 0 ? Object.keys(vendors[0]).filter(key => key !== 'id') : []);
                           return (
                            <AccordionItem value={category} key={category}>
                                <div className="flex items-center w-full">
                                    <AccordionTrigger className="flex-1 pr-2">
                                        {category}
                                    </AccordionTrigger>
                                    {isEditing && 
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={(e) => {e.stopPropagation(); addVendor(category)}}
                                            className="mr-2"
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2"/>Add
                                        </Button>
                                    }
                                </div>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                                                {isEditing && <TableHead>Actions</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(vendors as any[]).map((vendor, index) => (
                                                <TableRow key={vendor.id || index}>
                                                    {headers.map(header => (
                                                        <TableCell key={header}>
                                                            {isEditing ? 
                                                            <Input value={vendor[header] || ''} onChange={e => handleVendorChange(category, index, header, e.target.value)} />
                                                            : vendor[header]}
                                                        </TableCell>
                                                    ))}
                                                    {isEditing && (
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" onClick={() => deleteVendor(category, index)}>
                                                                <Trash2 className="w-4 h-4 text-destructive"/>
                                                            </Button>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                           )
                        })}
                    </Accordion>
                </CardContent>
            </Card>
        </main>
    )
}
