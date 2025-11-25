'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { ArrowLeft, Download, Edit, Save, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SHOP_DRAWING_RECORD_DOC_ID = 'shop-drawing-record';

const initialRecord = () => ({
  id: Date.now() + Math.random(),
  dateRecord: '',
  specSectionNo: '',
  drawingNo: '',
  title: '',
  trade: '',
  recordNo: '',
  referredTo: '',
  dateSent: '',
  numCopies: '',
  dateRetdReferred: '',
  action: '',
  dateRetd: '',
  copiesToContractor: false,
  copiesToOwner: false,
  copiesToField: false,
  copiesToFile: false,
});

export default function ShopDrawingsRecordPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    project: '',
    architectsProjectNo: '',
    contractor: '',
    records: [initialRecord()]
  });

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const docRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/shopDrawingRecords/${SHOP_DRAWING_RECORD_DOC_ID}`);
  }, [user, firestore]);

  useEffect(() => {
    if (!docRef) return;
    setIsLoading(true);
    getDoc(docRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
            ...data,
            records: data.records && data.records.length > 0 ? data.records : [initialRecord()]
        });
      }
    }).finally(() => setIsLoading(false));
  }, [docRef]);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRecordChange = (index: number, field: string, value: string | boolean) => {
    const newRecords = [...formData.records];
    (newRecords[index] as any)[field] = value;
    setFormData({ ...formData, records: newRecords });
  };
  
  const addRecord = () => {
    setFormData({ ...formData, records: [...formData.records, initialRecord()] });
  };

  const removeRecord = (index: number) => {
    const newRecords = formData.records.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, records: newRecords });
  };

  const handleSave = () => {
    if (!docRef) return;
    setIsSaving(true);
    setDoc(docRef, formData, { merge: true }).then(() => {
      toast({ title: 'Success', description: 'Shop drawings record saved.' });
      setIsEditing(false);
    }).finally(() => setIsSaving(false));
  };
  
  const handleDownload = () => {
    const doc = new jsPDF('l', 'pt', 'a4');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("SHOP DRAWINGS & SAMPLE RECORD", doc.internal.pageSize.width / 2, 25, { align: 'center'});
    
    autoTable(doc, {
        startY: 40,
        html: '#shop-drawings-table',
        theme: 'grid',
        styles: { fontSize: 6, cellPadding: 1 },
        headStyles: { fillColor: [30, 41, 59], textColor: 255 },
    })
    doc.save("shop-drawings-record.pdf");
    toast({ title: 'Download Started' });
  }

  const renderField = (value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
    return isEditing ? <Input value={value} onChange={onChange} className="h-8" /> : <div className="p-1 min-h-[32px]">{value}</div>;
  };
  
  if (isLoading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/drawings"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Drawings</Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>SHOP DRAWINGS & SAMPLE RECORD</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline"><Download className="w-4 h-4 mr-2"/>PDF</Button>
            {isEditing ? (
              <>
                <Button onClick={addRecord} variant="outline"><PlusCircle className="w-4 h-4 mr-2"/>Add Record</Button>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <Save className="w-4 h-4 mr-2"/>}Save</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <Label>Project:</Label>
              {renderField(formData.project, (e) => handleHeaderChange(e))}
            </div>
            <div className="space-y-1">
              <Label>Architect's Project No:</Label>
              {renderField(formData.architectsProjectNo, (e) => handleHeaderChange(e))}
            </div>
            <div className="space-y-1">
              <Label>Contractor:</Label>
              {renderField(formData.contractor, (e) => handleHeaderChange(e))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table id="shop-drawings-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date Record</TableHead>
                  <TableHead>Spec. Section No.</TableHead>
                  <TableHead>Shop Drawing or Sample Drawing No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Contractor/ Subcontractor/ Trade</TableHead>
                  <TableHead># Record</TableHead>
                  <TableHead colSpan={4}>Referred</TableHead>
                  <TableHead colSpan={4}>Action</TableHead>
                  <TableHead>Date Ret'd.</TableHead>
                  <TableHead colSpan={4}>Copies To</TableHead>
                  {isEditing && <TableHead></TableHead>}
                </TableRow>
                <TableRow>
                    <TableHead></TableHead><TableHead></TableHead><TableHead></TableHead><TableHead></TableHead><TableHead></TableHead><TableHead></TableHead>
                    <TableHead>To</TableHead><TableHead>Date Sent</TableHead><TableHead># Copies</TableHead><TableHead>Date Ret'd.</TableHead>
                    <TableHead>Approved</TableHead><TableHead>App'd as Noted</TableHead><TableHead>Revise &amp; Resubmit</TableHead><TableHead>Not Approved</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Contractor</TableHead><TableHead>Owner</TableHead><TableHead>Field</TableHead><TableHead>File</TableHead>
                    {isEditing && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.records?.map((record: any, index: number) => (
                  <TableRow key={record.id}>
                    <TableCell><Input type="date" value={record.dateRecord} onChange={e => handleRecordChange(index, 'dateRecord', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input value={record.specSectionNo} onChange={e => handleRecordChange(index, 'specSectionNo', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input value={record.drawingNo} onChange={e => handleRecordChange(index, 'drawingNo', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input value={record.title} onChange={e => handleRecordChange(index, 'title', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input value={record.trade} onChange={e => handleRecordChange(index, 'trade', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input value={record.recordNo} onChange={e => handleRecordChange(index, 'recordNo', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input value={record.referredTo} onChange={e => handleRecordChange(index, 'referredTo', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input type="date" value={record.dateSent} onChange={e => handleRecordChange(index, 'dateSent', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input value={record.numCopies} onChange={e => handleRecordChange(index, 'numCopies', e.target.value)} disabled={!isEditing} /></TableCell>
                    <TableCell><Input type="date" value={record.dateRetdReferred} onChange={e => handleRecordChange(index, 'dateRetdReferred', e.target.value)} disabled={!isEditing} /></TableCell>
                    
                    <TableCell><Checkbox checked={record.action === 'approved'} onCheckedChange={checked => handleRecordChange(index, 'action', checked ? 'approved' : '')} disabled={!isEditing}/></TableCell>
                    <TableCell><Checkbox checked={record.action === 'noted'} onCheckedChange={checked => handleRecordChange(index, 'action', checked ? 'noted' : '')} disabled={!isEditing}/></TableCell>
                    <TableCell><Checkbox checked={record.action === 'revise'} onCheckedChange={checked => handleRecordChange(index, 'action', checked ? 'revise' : '')} disabled={!isEditing}/></TableCell>
                    <TableCell><Checkbox checked={record.action === 'not_approved'} onCheckedChange={checked => handleRecordChange(index, 'action', checked ? 'not_approved' : '')} disabled={!isEditing}/></TableCell>

                    <TableCell><Input type="date" value={record.dateRetd} onChange={e => handleRecordChange(index, 'dateRetd', e.target.value)} disabled={!isEditing} /></TableCell>
                    
                    <TableCell><Checkbox checked={record.copiesToContractor} onCheckedChange={checked => handleRecordChange(index, 'copiesToContractor', !!checked)} disabled={!isEditing}/></TableCell>
                    <TableCell><Checkbox checked={record.copiesToOwner} onCheckedChange={checked => handleRecordChange(index, 'copiesToOwner', !!checked)} disabled={!isEditing}/></TableCell>
                    <TableCell><Checkbox checked={record.copiesToField} onCheckedChange={checked => handleRecordChange(index, 'copiesToField', !!checked)} disabled={!isEditing}/></TableCell>
                    <TableCell><Checkbox checked={record.copiesToFile} onCheckedChange={checked => handleRecordChange(index, 'copiesToFile', !!checked)} disabled={!isEditing}/></TableCell>
                    
                    {isEditing && <TableCell><Button variant="ghost" size="icon" onClick={() => removeRecord(index)}><Trash2 className="w-4 h-4 text-destructive"/></Button></TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
