
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Edit,
  Save,
  Loader2,
  Download,
  ArrowLeft,
  Camera,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  useFirestore,
  useUser,
  useMemoFirebase,
  FirestorePermissionError,
  errorEmitter,
} from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SITE_VISIT_DOC_ID = 'site-visit-proforma';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <>
    <h3 className="text-lg font-semibold mt-6 mb-3">{children}</h3>
    <Separator className="mb-4" />
  </>
);

const FormRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-2 md:gap-4 py-2">
    <Label className="md:text-right font-semibold pt-1">{label}</Label>
    <div className="md:col-span-2">{children}</div>
  </div>
);

const ChecklistItem = ({
  name,
  label,
  formData,
  handleCheckboxChange,
  isEditing,
}: {
  name: string;
  label: string;
  formData: any;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  isEditing: boolean;
}) => (
  <div className="flex items-center gap-2">
    <Checkbox
      id={name}
      checked={formData[name] || false}
      onCheckedChange={(checked) =>
        handleCheckboxChange(name, checked as boolean)
      }
      disabled={!isEditing}
    />
    <Label htmlFor={name} className="font-normal">
      {label}
    </Label>
  </div>
);

const SiteVisitPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const docRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/siteVisits/${SITE_VISIT_DOC_ID}`);
  }, [user, firestore]);

  useEffect(() => {
    if (!docRef) {
        setIsLoading(false);
        return
    };
    setIsLoading(true);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsLoading(false));
  }, [docRef]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    if (!docRef) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not authenticated.',
      });
      return;
    }
    setIsSaving(true);
    setDoc(docRef, formData, { merge: true })
      .then(() => {
        toast({ title: 'Success', description: 'Site visit data saved.' });
        setIsEditing(false);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: formData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsSaving(false));
  };
  
  const handleDownload = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text("Detailed Site Visit Proforma – Architect Visit", 105, y, { align: 'center' });
    y += 10;
    
    const drawCheckbox = (x: number, yPos: number, isChecked: boolean) => {
        const boxSize = 3.5;
        doc.setDrawColor(0);
        if (isChecked) {
            doc.setFillColor(0, 0, 0);
            doc.rect(x, yPos - boxSize, boxSize, boxSize, 'F');
            doc.setFont('ZapfDingbats');
            doc.setTextColor(255,255,255);
            doc.text('✓', x + 0.5, yPos - 0.5);
            doc.setTextColor(0,0,0);
        } else {
             doc.setFillColor(255, 255, 255);
            doc.rect(x, yPos - boxSize, boxSize, boxSize, 'S');
        }
        doc.setFont('helvetica', 'normal');
    };

    const addSection = (title: string, fields: (string | {label: string, name: string, type: 'checkbox' | 'text'})[]) => {
        if(y > 250) { doc.addPage(); y = 15; }
        y += 5;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        fields.forEach(field => {
            if (typeof field === 'string') {
                 y += 2; // small space
            } else if (field.type === 'checkbox') {
                 drawCheckbox(18, y, formData[field.name]);
                 doc.text(field.label, 24, y);
                 y += 6;
            } else {
                 const value = formData[field.name] || '';
                 doc.text(`${field.label}:`, 18, y);
                 const splitValue = doc.splitTextToSize(value, 120);
                 doc.text(splitValue, 70, y);
                 y += (splitValue.length * 5) + 2;
            }
        })
    }

    addSection("Basic Information", [
        {label: "Site / Branch Name", name: "siteName", type: 'text'},
        {label: "City", name: "city", type: 'text'},
        {label: "Date", name: "date", type: 'text'},
        {label: "Visit Number", name: "visitNumber", type: 'text'},
        {label: "Architect Name", name: "architectName", type: 'text'},
    ]);
    
    addSection("1. Exterior Works", [
        {label: "Facade condition", name: "exterior_facade", type: 'checkbox'},
        {label: "External signage installed", name: "exterior_signage", type: 'checkbox'},
        {label: "Outdoor lighting functional", name: "exterior_lighting", type: 'checkbox'},
        {label: "Entrance door alignment & quality", name: "exterior_door", type: 'checkbox'},
        {label: "Branding elements (panels/vinyls) installed", name: "exterior_branding", type: 'checkbox'},
    ]);
    
    addSection("2. Flooring", [
        {label: "Tiles installed as per approved design", name: "flooring_tiles", type: 'checkbox'},
        {label: "Tile alignment and leveling", name: "flooring_alignment", type: 'checkbox'},
        {label: "Skirting installation", name: "flooring_skirting", type: 'checkbox'},
        {label: "Grouting quality", name: "flooring_grouting", type: 'checkbox'},
        {label: "Any cracks or damages observed", name: "flooring_damage", type: 'checkbox'},
    ]);
    
    addSection("3. Ceiling", [
        {label: "Gypsum ceiling installed", name: "ceiling_gypsum", type: 'checkbox'},
        {label: "Ceiling paint finish", name: "ceiling_paint", type: 'checkbox'},
        {label: "Ceiling height as per plan", name: "ceiling_height", type: 'checkbox'},
        {label: "Access panels installed", name: "ceiling_panels", type: 'checkbox'},
        {label: "No moisture / cracks visible", name: "ceiling_moisture", type: 'checkbox'},
    ]);
    
    addSection("4. Lighting", [
        {label: "All lights installed (LED panels, spotlights, etc.)", name: "lighting_all", type: 'checkbox'},
        {label: "Emergency lights operational", name: "lighting_emergency", type: 'checkbox'},
        {label: "ATM room lighting", name: "lighting_atm", type: 'checkbox'},
        {label: "Customer hall lighting uniformity", name: "lighting_hall", type: 'checkbox'},
        {label: "DB (Distribution Board) labeling", name: "lighting_db", type: 'checkbox'},
    ]);

    doc.addPage();
    y = 15;

    addSection("5. Furniture & Fixtures", [
        {label: "Teller counters installed", name: "furniture_counters", type: 'checkbox'},
        {label: "Customer waiting area seating", name: "furniture_seating", type: 'checkbox'},
        {label: "Branch Manager table and chair", name: "furniture_bm", type: 'checkbox'},
        {label: "Cash cabin partitions", name: "furniture_cash", type: 'checkbox'},
        {label: "ATM Lobby furniture", name: "furniture_atm", type: 'checkbox'},
        {label: "Storage cabinetry & drawers", name: "furniture_storage", type: 'checkbox'},
        {label: "File shelving", name: "furniture_shelving", type: 'checkbox'},
    ]);

    addSection("6. Washrooms", [
        {label: "Floor & wall tiles installed", name: "washroom_tiles", type: 'checkbox'},
        {label: "WC & washbasin installed", name: "washroom_wc", type: 'checkbox'},
        {label: "Water pressure & drainage", name: "washroom_drainage", type: 'checkbox'},
        {label: "Exhaust fan functional", name: "washroom_exhaust", type: 'checkbox'},
        {label: "Accessories (soap, tissue, mirrors)", name: "washroom_accessories", type: 'checkbox'},
    ]);

    addSection("7. MEP (Mechanical, Electrical, Plumbing)", [
        {label: "Electrical wiring completed", name: "mep_wiring", type: 'checkbox'},
        {label: "AC indoor/outdoor units installed & operational", name: "mep_ac", type: 'checkbox'},
        {label: "Air diffusers installed", name: "mep_diffusers", type: 'checkbox'},
        {label: "Fire alarm system installed and tested", name: "mep_fire", type: 'checkbox'},
        {label: "CCTV cameras installed & positioned properly", name: "mep_cctv", type: 'checkbox'},
        {label: "Plumbing leak test", name: "mep_plumbing", type: 'checkbox'},
    ]);

    addSection("8. Observations", [{label: "", name: "observations", type: 'text'}]);
    addSection("9. Issues Identified", [{label: "", name: "issues", type: 'text'}]);
    addSection("10. Actions & Recommendations", [{label: "", name: "actions", type: 'text'}]);
    
    doc.save('site-visit-proforma.pdf');
    toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
  }

  const renderInput = (name: string) => {
      if (isEditing) {
          return <Input name={name} value={formData[name] || ''} onChange={handleInputChange} />
      }
      return <p className="border-b min-h-[24px] py-1">{formData[name] || ''}</p>
  }
  
  const renderTextarea = (name: string) => {
      if(isEditing) {
          return <Textarea name={name} value={formData[name] || ''} onChange={handleInputChange} rows={3} />
      }
      return <p className="border-b min-h-[72px] py-1 whitespace-pre-wrap">{formData[name] || ''}</p>
  }
  
  const renderPictureField = (index: number) => {
      const commentName = `comment${index}`;

      return (
           <div key={`picture-field-${index}`} className="border p-4 rounded-md space-y-2">
                <div className="bg-muted h-40 flex items-center justify-center rounded-md">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                </div>
                {isEditing && <Input type="file" className="text-sm" />}
                <FormRow label="Comment:">
                    {renderTextarea(commentName)}
                </FormRow>
           </div>
      )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detailed Site Visit Proforma – Architect Visit</CardTitle>
           <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}><Download className="mr-2"/>PDF</Button>
            {isEditing ? (
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Save
                </Button>
            ) : (
                <Button onClick={() => setIsEditing(true)}><Edit className="mr-2" /> Edit</Button>
            )}
           </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SectionTitle>Basic Information</SectionTitle>
            <FormRow label="Site / Branch Name:">{renderInput("siteName")}</FormRow>
            <FormRow label="City:">{renderInput("city")}</FormRow>
            <FormRow label="Date:">{renderInput("date")}</FormRow>
            <FormRow label="Visit Number (e.g., 1, 2, 3):">{renderInput("visitNumber")}</FormRow>
            <FormRow label="Architect Name:">{renderInput("architectName")}</FormRow>
            
            <SectionTitle>1. Exterior Works</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <ChecklistItem name="exterior_facade" label="Facade condition" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing}/>
                <ChecklistItem name="exterior_signage" label="External signage installed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing}/>
                <ChecklistItem name="exterior_lighting" label="Outdoor lighting functional" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing}/>
                <ChecklistItem name="exterior_door" label="Entrance door alignment & quality" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing}/>
                <ChecklistItem name="exterior_branding" label="Branding elements (panels/vinyls) installed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing}/>
            </div>
            
            <SectionTitle>2. Flooring</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <ChecklistItem name="flooring_tiles" label="Tiles installed as per approved design" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="flooring_alignment" label="Tile alignment and leveling" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="flooring_skirting" label="Skirting installation" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="flooring_grouting" label="Grouting quality" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="flooring_damage" label="Any cracks or damages observed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
            </div>

            <SectionTitle>3. Ceiling</SectionTitle>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <ChecklistItem name="ceiling_gypsum" label="Gypsum ceiling installed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="ceiling_paint" label="Ceiling paint finish" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="ceiling_height" label="Ceiling height as per plan" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="ceiling_panels" label="Access panels installed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="ceiling_moisture" label="No moisture / cracks visible" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
            </div>

            <SectionTitle>4. Lighting</SectionTitle>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <ChecklistItem name="lighting_all" label="All lights installed (LED panels, spotlights, etc.)" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="lighting_emergency" label="Emergency lights operational" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="lighting_atm" label="ATM room lighting" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="lighting_hall" label="Customer hall lighting uniformity" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="lighting_db" label="DB (Distribution Board) labeling" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
            </div>

             <SectionTitle>5. Furniture & Fixtures</SectionTitle>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <ChecklistItem name="furniture_counters" label="Teller counters installed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="furniture_seating" label="Customer waiting area seating" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="furniture_bm" label="Branch Manager table and chair" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="furniture_cash" label="Cash cabin partitions" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="furniture_atm" label="ATM Lobby furniture" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="furniture_storage" label="Storage cabinetry & drawers" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="furniture_shelving" label="File shelving" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
            </div>

             <SectionTitle>6. Washrooms</SectionTitle>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <ChecklistItem name="washroom_tiles" label="Floor & wall tiles installed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="washroom_wc" label="WC & washbasin installed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="washroom_drainage" label="Water pressure & drainage" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="washroom_exhaust" label="Exhaust fan functional" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="washroom_accessories" label="Accessories (soap, tissue, mirrors)" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
            </div>

            <SectionTitle>7. MEP (Mechanical, Electrical, Plumbing)</SectionTitle>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                <ChecklistItem name="mep_wiring" label="Electrical wiring completed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="mep_ac" label="AC indoor/outdoor units installed & operational" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="mep_diffusers" label="Air diffusers installed" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="mep_fire" label="Fire alarm system installed and tested" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="mep_cctv" label="CCTV cameras installed & positioned properly" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
                <ChecklistItem name="mep_plumbing" label="Plumbing leak test" formData={formData} handleCheckboxChange={handleCheckboxChange} isEditing={isEditing} />
            </div>

            <SectionTitle>8. Observations</SectionTitle>
            {renderTextarea("observations")}
            
            <SectionTitle>9. Issues Identified</SectionTitle>
            {renderTextarea("issues")}

            <SectionTitle>10. Actions & Recommendations</SectionTitle>
            {renderTextarea("actions")}

            <SectionTitle>11. Pictures with Comments</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({length: 7}).map((_, i) => renderPictureField(i + 1))}
            </div>

          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default SiteVisitPage;

    