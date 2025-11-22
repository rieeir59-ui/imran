
'use client';

import React, { useState, useEffect, Fragment } from 'react';
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
import { Edit, Save, Loader2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';

const BILL_OF_QUANTITY_DOC_ID = 'bill-of-quantity';

const BillOfQuantityPage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const initialData = {
      items: [
        { id: 1, srNo: '1', description: 'EXCAVATION', unit: '', qty: '', rate: '', amount: '', isHeader: true, subItems: [
          { id: 1.1, srNo: 'a', description: 'Excavation for isolated, stripe/combined & Brick foundations in clay and sandy soil including cost of dressing, leveling and compaction in approved manners and disposal of surplus excavated soil away from site, all excavated area will be proof rolled as directed by the Consultant/Engineer incharge.', unit: 'C.FT', qty: '59,972', rate: '', amount: '' },
          { id: 1.2, srNo: 'b', description: 'Basement', unit: 'C.FT', qty: '225', rate: '', amount: '' },
        ]},
        { id: 2, srNo: '2', description: 'BACK FILLING', unit: '', qty: '', rate: '', amount: '', isHeader: true, subItems: [
            { id: 2.1, srNo: '', description: 'Back Filling including watering and compaction in layers not exceeding 150mm compacted thickness to dry Compaction Test (ASTM D-1557) upto 95% Modified AASHTO by using the borrowed local sand from the local nearby site, as directed by the Consultant/Engineer incharge', unit: 'C.FT', qty: '12,000', rate: '', amount: '' },
        ]},
        { id: 3, srNo: '3', description: 'TERMITE PROOFING', isHeader: true, subItems: [
            { id: 3.1, srNo: 'a', description: 'Providing and applying of Termite Control by spraying FMC Biflex or Mirage 5% SC by Ali Akbar Group in clear water under all floors, excavation including side walls and bottom of all pits & trenches, for footing and under floors.', unit: '', qty: '', rate: '', amount: '' },
            { id: 3.2, srNo: 'b', description: 'Basement', unit: 'S.ft', qty: '5,452', rate: '', amount: '' },
            { id: 3.3, srNo: 'c', description: 'Ground Floor', unit: 'S.ft', qty: '6,222', rate: '', amount: '' },
            { id: 3.4, srNo: 'd', description: 'First Floor', unit: 'S.ft', qty: '4,986', rate: '', amount: '' },
        ]},
        { id: 4, srNo: '4', description: 'PLAIN CEMENT CONCRETE UNDER FOUNDATIONS/FLOOR', isHeader: true, subItems: [
            { id: 4.1, srNo: 'i', description: 'Providing and laying P.C.C plain cement concrete (1:4:8) using ordinary Portland cement chenab sand and Dina stone 1.5\'\' down as blinding layer under foundations/floor & swimming pool including confining, leveling, compacting and curing etc. complete in all respect finished smooth as directed by the Consultant/Engineer incharge.', unit: 'C.FT', qty: '5,452', rate: '', amount: '' },
            { id: 4.2, srNo: 'ii', description: 'Column Foundation', unit: 'C.ft', qty: '125', rate: '', amount: '' },
        ]},
        { id: 5, srNo: '5', description: 'Water Stopper', isHeader: true, subItems: [
            { id: 5.1, srNo: 'i', description: 'Providing and fixing of water stopper 4mm thick and 229 mm wide poly vinyl chloride ribbed bar by Marflex or approved equivalent installed in the centre of x-section of the concrete structure joint of retaining walls, water tanks and expansion joints complete in all respect as per drawings and as directed by the consultant / Engineer. (9" Decora)', unit: 'R.ft', qty: '525', rate: '', amount: '' },
            { id: 5.2, srNo: 'ii', description: 'O.H.W.T', unit: 'R.ft', qty: '60', rate: '', amount: '' },
        ]},
        { id: 6, srNo: '6', description: 'Reinforced Cement Concrete Work (3000 Psi)', isHeader: true, subItems: [
            { id: 6.01, srNo: '6.1', description: 'Providing, laying, vibrating, compacting, finishing and curing etc. straight or curved, cast in situ reinforced cement concrete at any floor/height/depth, from ready mix plant, 3000 Psi minimum cylinder compressive strength at 28 days, mix using Ordinary Portland Grey Cement, fine aggregate (100% clean lawrence pur sand ) and sargodah crushed coarse aggregate 3/4\'\' down graded with approved quality admixture by Sika/Imporient or approved equivalent, including laying through pump, vibrating through electro mechanical vibrators, placing of all pipes and embedded items before concreting curing finishing complete but excluding the cost of steel reinforcement complete in all respect as per drawings and as directed by the Consultant/Engineer incharge', unit: '', qty: '', rate: '', amount: '' },
            { id: 6.02, srNo: '6.2', description: 'Basement Retaining Walls', unit: 'C.ft', qty: '4,050', rate: '', amount: '' },
            { id: 6.03, srNo: '6.3', description: 'Basement Pool Walls', unit: 'C.ft', qty: '1,335', rate: '', amount: '' },
            { id: 6.04, srNo: '6.4', description: 'Basement Pool Base', unit: 'C.ft', qty: '473', rate: '', amount: '' },
            { id: 6.05, srNo: '6.5', description: 'Basement water body walls & Base', unit: 'C.ft', qty: '230', rate: '', amount: '' },
            { id: 6.06, srNo: '6.6', description: 'Basement Column Foundations', unit: 'C.ft', qty: '1,664', rate: '', amount: '' },
            { id: 6.07, srNo: '6.7', description: 'Basement Basement Coulumn', unit: 'C.ft', qty: '340', rate: '', amount: '' },
            { id: 6.08, srNo: '6.8', description: 'Basement Lintel', unit: 'C.ft', qty: '495', rate: '', amount: '' },
            { id: 6.09, srNo: '6.9', description: 'Basement Slab & Beam', unit: 'C.ft', qty: '4,224', rate: '', amount: '' },
            { id: 6.10, srNo: '6.10', description: 'Ground Floor Column Foundations', unit: 'C.ft', qty: '36', rate: '', amount: '' },
            { id: 6.11, srNo: '6.11', description: 'Ground Floor Coulumn', unit: 'C.ft', qty: '425', rate: '', amount: '' },
            { id: 6.12, srNo: '6.12', description: 'Ground Floor Lintel', unit: 'C.ft', qty: '375', rate: '', amount: '' },
            { id: 6.13, srNo: '6.13', description: 'Ground Floor Slab & Beam', unit: 'C.ft', qty: '4,800', rate: '', amount: '' },
            { id: 6.14, srNo: '6.14', description: 'First Floor Coulumn', unit: 'C.ft', qty: '375', rate: '', amount: '' },
            { id: 6.15, srNo: '6.15', description: 'First Floor Lintel', unit: 'C.ft', qty: '165', rate: '', amount: '' },
            { id: 6.16, srNo: '6.16', description: 'First Floor Slab & Beam', unit: 'C.ft', qty: '3,314', rate: '', amount: '' },
            { id: 6.17, srNo: '6.17', description: 'Baement to first Floor Stair', unit: 'C.ft', qty: '400', rate: '', amount: '' },
            { id: 6.18, srNo: '6.18', description: 'O.H.W.T Base and walls', unit: 'C.ft', qty: '583', rate: '', amount: '' },
            { id: 6.19, srNo: '6.19', description: 'U.G.W.T Base and walls', unit: 'C.ft', qty: '252', rate: '', amount: '' },
            { id: 6.20, srNo: '6.20', description: 'Septic Tank', unit: 'C.ft', qty: '185', rate: '', amount: '' },
        ]},
        { id: 7, srNo: '7', description: 'STEEL REINFORCEMENT', unit: '', qty: '', rate: '', amount: '', isHeader: true, subItems: [
            { id: 7.1, srNo: '', description: 'Providing fabricating, laying, fixing, Mild Steel deformed bars (non-TMT) grade 60 with minimum yield stress conforming to ASTM specifications A-615. including cost of cutting, bending, placing, binded annealed binding wire 16 guage, removal of rest from bars if any, in specified overlaps, chairs, sports, spacers, wastage, etc. Complete in all respects by an approved source such as Afco steel, Prime steel, Ittefaq steel, Model Steel, City Steel UAE ( if not available, client will specify the alternate brand. Only the lengths shown on Drawings shall be paid for in accordance with the Bar bending schedule prepared the contractors from the drawings and submitted well in advance to the Engineer for the approval, steel lengths from the site multiply by the standard weights will used for the purpose of payment and duly approved by the consultant/Engineer Incharge.', unit: 'Ton', qty: '75', rate: '', amount: '' }
        ]},
        { id: 8, srNo: '8', description: 'Brick Work', isHeader: true, subItems: [
            { id: 8.01, srNo: '8.1', description: 'Providing and laying first class burnt brick work 9"and above thickness to in cement sand mortar (1:5) including all scaffolding, racking out joints and making all flush or groove joints steel dowels at joints to masonry or columns, complete in all respects as per drawing, specifications, and or as directed by the Engineer', unit: '', qty: '', rate: '', amount: '' },
            { id: 8.02, srNo: '8.1.1', description: 'Basement 9" Thick Wall', unit: 'C.ft', qty: '414', rate: '', amount: '' },
            { id: 8.03, srNo: '8.1.2', description: 'Basement 13.50" Thick Wall', unit: 'C.ft', qty: '1,384', rate: '', amount: '' },
            { id: 8.04, srNo: '8.1.3', description: 'Ground Floor 15" Thick Wall', unit: 'C.ft', qty: '900', rate: '', amount: '' },
            { id: 8.05, srNo: '8.1.4', description: 'Ground Floor 13.50" Thick Wall', unit: 'C.ft', qty: '1,814', rate: '', amount: '' },
            { id: 8.06, srNo: '8.1.5', description: 'Ground Floor 9" Thick Wall', unit: 'C.ft', qty: '1,206', rate: '', amount: '' },
            { id: 8.07, srNo: '8.1.6', description: 'First Floor 15" Thick Wall', unit: 'C.ft', qty: '825', rate: '', amount: '' },
            { id: 8.08, srNo: '8.1.7', description: 'First Floor 13.50" Thick Wall', unit: 'C.ft', qty: '354', rate: '', amount: '' },
            { id: 8.09, srNo: '8.1.8', description: 'First Floor 9" Thick Wall', unit: 'C.ft', qty: '2,175', rate: '', amount: '' },
            { id: 8.10, srNo: '8.2', description: 'Providing and laying first class burnt brick work 4½" thickness to in cement sand mortar (1:4) including all scaffolding, racking out joints and making all flush or groove joints steel dowels at joints to masonry or columns, complete in all respects as per drawing, specifications, and or as directed by the Engineer.', unit: '', qty: '', rate: '', amount: '' },
            { id: 8.11, srNo: '8.2.1', description: 'Basement Floor', unit: 'S.ft', qty: '3,264', rate: '', amount: '' },
            { id: 8.12, srNo: '8.2.2', description: 'Ground Floor', unit: 'S.ft', qty: '960', rate: '', amount: '' },
            { id: 8.13, srNo: '8.2.3', description: 'First Floor', unit: 'S.ft', qty: '528', rate: '', amount: '' },
            { id: 8.14, srNo: '8.2.4', description: 'Boundary Wall', unit: 'S.ft', qty: '3,960', rate: '', amount: '' },
        ]},
        { id: 9, srNo: '9', description: 'Plaster Work', isHeader: true, subItems: [
            { id: 9.1, srNo: '', description: 'Supply, mix, apply and cure Cement sand plaster of any height, includes making sharp corners, edges, grooves, all scaffolding. complete in all respects as per drawing, specifications, and or as directed by the Engineer', unit: 'S.ft', qty: '27,890', rate: '', amount: '' }
        ]},
        { id: 10, srNo: '10', description: 'Brick Blast', isHeader: true, subItems: [
            { id: 10.1, srNo: '10.1', description: 'Basement Floor', unit: 'C.ft', qty: '1,799', rate: '', amount: '' },
            { id: 10.2, srNo: '10.2', description: 'Ground Floor', unit: 'C.ft', qty: '2,053', rate: '', amount: '' },
            { id: 10.3, srNo: '10.3', description: 'First Floor', unit: 'C.ft', qty: '1,645', rate: '', amount: '' },
        ]},
        { id: 11, srNo: '11', description: 'PCC SUB FLOOR', isHeader: true, subItems: [
            { id: 11.1, srNo: '11.1', description: 'Cement Concrete (1:2:4), including placing, compacting, finishing and curing complete. (Screed Under Floor)', unit: '', qty: '', rate: '', amount: '' },
            { id: 11.2, srNo: '11.2', description: 'Baement Floor', unit: 'C.ft', qty: '1,799', rate: '', amount: '' },
            { id: 11.3, srNo: '11.3', description: 'Ground Floor', unit: 'C.ft', qty: '2,053', rate: '', amount: '' },
            { id: 11.4, srNo: '11.4', description: 'First Floor', unit: 'C.ft', qty: '1,645', rate: '', amount: '' },
        ]},
        { id: 12, srNo: '12', description: 'Roof insulation and water proofing', isHeader: true, subItems: [
            { id: 12.1, srNo: '', description: 'Providing and laying Roof insulation and water proofing to roof consisting of given below of as directed by the Engineer incharge. - Bituminous primer coat. - 2-coats of cold applied rubberized bitumen - One layer of polythene 500 gauge - 1½” thick "extruded polystyrene board" 1½" thick. (density 34 Kg/m³) - One layer of polythene 500 gauge - 4” thick average mud (compacted thickness). - Brick tiles 9”x4-1/2”x1-1/2” laid in cement sand mortar 1:4 and grouted with cement sand mortar 1:3 using 1-part of OPC and 3-parts of clean approved quality sand, complete as per drawings, specifications and instructions of the Consultant.', unit: 'S.ft', qty: '6,561', rate: '', amount: '' },
        ]},
        { id: 13, srNo: '13', description: 'D.P.C', isHeader: true, subItems: [
            { id: 13.1, srNo: 'i', description: 'Supply, mix, place, cure, compact concrete (1:2:4) 1-1/2" horizontal damp proof course on brick masonry wall includes form work & mixing of rhombic 707 manufactured by MBT in concrete & application of one coat of same chemical on masonry surface before pouring of mixed concrete according to drawings and manufacturers instructions or As directed by the consultant.', unit: 'S.ft', qty: '654', rate: '', amount: '' },
        ]},
      ]
    };

    const [formData, setFormData] = useState(initialData);

    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const boqDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/projectData/${BILL_OF_QUANTITY_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!boqDocRef) return;
        setIsLoading(true);
        getDoc(boqDocRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const sanitizedItems = data.items?.map((item: any) => ({
                    ...item,
                    subItems: item.subItems || initialData.items.find(i => i.id === item.id)?.subItems || []
                }));
                setFormData({ ...initialData, ...data, items: sanitizedItems || initialData.items });
            } else {
                 setFormData(initialData);
            }
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data.' });
        }).finally(() => setIsLoading(false));
    }, [boqDocRef, toast]);
    
    const handleItemChange = (itemId: number, field: string, value: string) => {
        const newItems = formData.items.map(item => {
            let updatedItem = { ...item };

            const updateAmount = (i: any) => {
                if ((field === 'qty' || field === 'rate') && i.qty && i.rate) {
                    const qty = parseFloat(String(i.qty).replace(/,/g, '')) || 0;
                    const rate = parseFloat(String(i.rate).replace(/,/g, '')) || 0;
                    i.amount = (qty * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            }

            if (item.id === itemId) {
                updatedItem = { ...item, [field]: value };
                updateAmount(updatedItem);
            } else if (item.subItems) {
                const newSubItems = item.subItems.map(subItem => {
                    if (subItem.id === itemId) {
                        const updatedSubItem = { ...subItem, [field]: value };
                        updateAmount(updatedSubItem);
                        return updatedSubItem;
                    }
                    return subItem;
                });
                updatedItem.subItems = newSubItems;
            }
            return updatedItem;
        });
        setFormData({ ...formData, items: newItems });
    };

    const handleSave = () => {
        if (!boqDocRef) return;
        setIsSaving(true);
        setDoc(boqDocRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Bill of Quantity saved.' });
            setIsEditing(false);
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save data.' });
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
      const doc = new jsPDF();
      const body: any[] = [];

      formData.items.forEach(item => {
          if (item.isHeader) {
              body.push([{ content: `${item.srNo}. ${item.description}`, colSpan: 6, styles: { fontStyle: 'bold', fillColor: [22, 163, 74], textColor: [255,255,255] } }]);
          } else {
              body.push([item.srNo, item.description, item.unit, item.qty, item.rate, item.amount]);
          }

          if (item.subItems) {
              item.subItems.forEach((sub: any) => {
                  let desc = sub.description;
                  if (sub.srNo) {
                      desc = `${sub.srNo}. ${desc}`;
                  }
                   body.push([
                      '', // Keep Sr. No empty for sub-items
                      desc,
                      sub.unit,
                      sub.qty,
                      sub.rate,
                      sub.amount
                  ]);
              });
          }
      });
      
      doc.setFontSize(16);
      doc.text("BILL OF QUANTITY", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });


      autoTable(doc, {
          startY: 25,
          head: [['Sr. No', 'Description', 'Unit', 'Qty', 'Rate', 'Amount (Rs)']],
          body: body,
          theme: 'grid',
          headStyles: {
              fillColor: [41, 128, 185],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
          },
          columnStyles: {
              0: { cellWidth: 15 },
              1: { cellWidth: 85 },
          },
          didParseCell: function (data) {
              if (data.row.raw[0].content) { // check if it's a header row
                  data.cell.styles.fontStyle = 'bold';
                  data.cell.styles.fillColor = '#34495e';
                  data.cell.styles.textColor = '#ffffff';
              }
          }
      });
      
      doc.save("bill-of-quantity.pdf");
      toast({title: "Download Started", description: "Your PDF is being generated."});
    };
    
    const renderCell = (itemId: number, field: string, value: string) => {
        if (isEditing) {
            return <Input value={value || ''} onChange={(e) => handleItemChange(itemId, field, e.target.value)} className="h-8"/>;
        }
        return value;
    };
    
    const renderRow = (item: any) => {
        const mainRow = (
             <TableRow key={item.id} className={cn(item.isHeader && "font-bold bg-muted")}>
                <TableCell>{item.srNo}</TableCell>
                <TableCell colSpan={item.isHeader ? 5 : 1}>
                    {renderCell(item.id, 'description', item.description)}
                </TableCell>
                {!item.isHeader && (
                    <>
                        <TableCell>{renderCell(item.id, 'unit', item.unit)}</TableCell>
                        <TableCell>{renderCell(item.id, 'qty', item.qty)}</TableCell>
                        <TableCell>{renderCell(item.id, 'rate', item.rate)}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                    </>
                )}
            </TableRow>
        );

        if (item.subItems) {
            return (
                <Fragment key={item.id}>
                    {mainRow}
                    {item.subItems.map((sub: any) => (
                        <TableRow key={sub.id}>
                            <TableCell>{sub.srNo}</TableCell>
                            <TableCell>{sub.description}</TableCell>
                            <TableCell>{renderCell(sub.id, 'unit', sub.unit)}</TableCell>
                            <TableCell>{renderCell(sub.id, 'qty', sub.qty)}</TableCell>
                            <TableCell>{renderCell(sub.id, 'rate', sub.rate)}</TableCell>
                            <TableCell>{sub.amount}</TableCell>
                        </TableRow>
                    ))}
                </Fragment>
            );
        }

        return mainRow;
    }
    
    if (isLoading || isUserLoading) {
        return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
        <main className="container mx-auto p-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/bank"><ArrowLeft /> Back</Link>
                        </Button>
                        <CardTitle>Bill Of Quantity</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleDownload} variant="outline"><Download /> PDF</Button>
                        {isEditing ? (
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                            </Button>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sr. No</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Amount (Rs)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.items.map(renderRow)}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
};

export default BillOfQuantityPage;
