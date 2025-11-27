
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
  useStorage,
} from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Image from 'next/image';

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
  const storage = useStorage();

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

  const handleImageUpload = async (file: File, fieldName: string) => {
    if (!user || !storage) {
        toast({ variant: 'destructive', title: 'Upload failed', description: 'User not authenticated.' });
        return;
    }

    const storageRef = ref(storage, `users/${user.uid}/siteVisits/${SITE_VISIT_DOC_ID}/${file.name}`);
    
    try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setFormData((prev: any) => ({ ...prev, [fieldName]: url }));
        toast({ title: 'Image Uploaded', description: 'Image has been saved.'});
    } catch (error) {
        console.error('Error uploading image: ', error);
        toast({ variant: 'destructive', title: 'Upload Error', description: 'Could not upload the image.' });
    }
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
  
    const toDataURL = (url: string) => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));

    const handleDownload = async () => {
        const doc = new jsPDF();
        let y = 15;

        doc.setFontSize(16);
        doc.text("Detailed Site Visit Proforma – Architect Visit", 105, y, { align: 'center' });
        y += 10;

        const drawCheckbox = (x: number, yPos: number, isChecked: boolean) => {
            const boxSize = 3.5;
            doc.setLineWidth(0.2);
            doc.setDrawColor(0);
            if (isChecked) {
                doc.setFillColor(60, 110, 180);
                doc.rect(x, yPos - boxSize, boxSize, boxSize, 'F');
            } else {
                doc.rect(x, yPos - boxSize, boxSize, boxSize, 'S');
            }
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
                    y += 2;
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

        const sections = [
            { title: "1. Exterior Works", fields: ["exterior_facade", "exterior_signage", "exterior_lighting", "exterior_door", "exterior_branding"] },
            { title: "2. Flooring", fields: ["flooring_tiles", "flooring_alignment", "flooring_skirting", "flooring_grouting", "flooring_damage"] },
            { title: "3. Ceiling", fields: ["ceiling_gypsum", "ceiling_paint", "ceiling_height", "ceiling_panels", "ceiling_moisture"] },
            { title: "4. Lighting", fields: ["lighting_all", "lighting_emergency", "lighting_atm", "lighting_hall", "lighting_db"] },
            { title: "5. Furniture & Fixtures", fields: ["furniture_counters", "furniture_seating", "furniture_bm", "furniture_cash", "furniture_atm", "furniture_storage", "furniture_shelving"] },
            { title: "6. Washrooms", fields: ["washroom_tiles", "washroom_wc", "washroom_drainage", "washroom_exhaust", "washroom_accessories"] },
            { title: "7. MEP", fields: ["mep_wiring", "mep_ac", "mep_diffusers", "mep_fire", "mep_cctv", "mep_plumbing"] },
        ];
        
        doc.setFontSize(10);
        sections.forEach(section => {
            if (y > 260) { doc.addPage(); y = 15; }
            y += 5;
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, 14, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            section.fields.forEach(fieldName => {
                 const fieldLabel = fieldName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                 if(y > 280) { doc.addPage(); y = 15; }
                 drawCheckbox(18, y, formData[fieldName]);
                 doc.text(fieldLabel, 24, y);
                 y += 6;
            });
        });
        
        const addNotesSection = (title: string, fieldName: string) => {
             if (y > 260) { doc.addPage(); y = 15; }
            y += 5;
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            const text = doc.splitTextToSize(formData[fieldName] || '', 180);
            doc.text(text, 14, y);
            y += (text.length * 5) + 5;
        }

        addNotesSection("8. Observations", "observations");
        addNotesSection("9. Issues Identified", "issues");
        addNotesSection("10. Solutions", "solutions");
        addNotesSection("11. Actions & Recommendations", "actions");

        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text("12. Pictures with Comments", 14, y);
        y += 5;

        for(let i=1; i<=7; i++) {
            const imageUrl = formData[`image${i}`];
            const comment = formData[`comment${i}`];

            if (imageUrl) {
                 if (y > 190) { doc.addPage(); y = 15; }
                try {
                    const dataUrl = await toDataURL(imageUrl);
                    doc.addImage(dataUrl as string, 'JPEG', 14, y, 80, 60);
                    y += 65;

                    if (comment) {
                        const splitComment = doc.splitTextToSize(`Comment: ${comment}`, 180);
                        if (y + (splitComment.length * 5) > 280) { doc.addPage(); y = 15; }
                        doc.text(splitComment, 14, y);
                        y += (splitComment.length * 5) + 5;
                    }

                } catch (error) {
                    console.error("Error adding image to PDF:", error);
                     if (y > 280) { doc.addPage(); y = 15; }
                    doc.text("Error loading image. Please check the URL.", 14, y);
                    y += 10;
                }
            }
        }

        doc.save('site-visit-proforma.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

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
      const imageName = `image${index}`;
      const imageUrl = formData[imageName];

      return (
           <div key={`picture-field-${index}`} className="border p-4 rounded-md space-y-2">
                <div className="bg-muted h-40 flex items-center justify-center rounded-md relative">
                    {imageUrl ? (
                        <Image src={imageUrl} alt={`Site visit image ${index}`} layout="fill" objectFit="contain" />
                    ) : (
                        <Camera className="w-10 h-10 text-muted-foreground" />
                    )}
                </div>
                {isEditing && (
                    <Input 
                        type="file" 
                        accept="image/png, image/jpeg"
                        className="text-sm"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, imageName);
                        }}
                    />
                )}
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

            <SectionTitle>10. Solutions</SectionTitle>
            {renderTextarea("solutions")}

            <SectionTitle>11. Actions & Recommendations</SectionTitle>
            {renderTextarea("actions")}

            <SectionTitle>12. Pictures with Comments</SectionTitle>
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
