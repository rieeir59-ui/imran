
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';

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
    const handleRadioChange = (name: string, value: string) => {
        if (!isEditing) return;
        setFormData({...formData, [name]: value});
    }

  const handleImageUpload = async (file: File, fieldName: string) => {
    if (!user || !storage) {
        toast({ variant: 'destructive', title: 'Upload failed', description: 'User not authenticated.' });
        return;
    }

    const storageRef = ref(storage, `users/${user.uid}/siteVisits/${file.name}`);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        // Optional: handle progress updates
      },
      (error) => {
        console.error('Error uploading image: ', error);
        toast({ variant: 'destructive', title: 'Upload Error', description: 'Could not upload the image.' });
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData((prev: any) => ({ ...prev, [fieldName]: url }));
        toast({ title: 'Image Uploaded', description: 'Image has been saved.'});
      }
    );
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
  
    const handleDownload = async () => {
        const doc = new jsPDF();
        let y = 15;

        // --- PDF Header ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("SITE SURVEY", 105, y, { align: 'center' });
        y += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("ARCHITECTURAL - ENGINEERING - CONSTRUCTIONS", 105, y, { align: 'center' });
        y += 5;
        doc.text("PREMISES REVIEW FOR PROPOSED BRANCH/OFFICE", 105, y, { align: 'center' });
        y += 8;

        // --- Helper to add a section with a title and key-value pairs ---
        const addSection = (title: string, data: (string | [string, string])[][], startY: number) => {
            autoTable(doc, {
                startY: startY,
                head: [[{ content: title, styles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } }]],
                body: data,
                theme: 'grid',
                columnStyles: { 0: { fontStyle: 'bold' } },
                didDrawPage: (data) => { y = data.cursor?.y || 0; }
            });
            return (doc as any).lastAutoTable.finalY + 5;
        }
        
        const getYesNo = (fieldName: string) => formData[fieldName] ? 'Yes' : 'No';

        // --- Location ---
        y = addSection("Location", [
            ["Purpose", formData.purpose || ''],
            ["City", formData.city || ''],
            ["Region", formData.region || ''],
            ["Address", formData.address || ''],
        ], y);

        // --- Legal File ---
        y = addSection("Legal File", [
            ["Name of Owner", formData.owner_name || ''],
            ["Completion Certificate", getYesNo('completion_cert')],
            ["Is Leased", `${getYesNo('is_leased')} (As informed by Owner Representative)`],
        ], y);

        // --- Area ---
        y = addSection("Area (Attach as-built plan(s))", [
            ["Maximum Frontage (ft)", formData.frontage || ''],
            ["Maximum Depth (ft)", formData.depth || ''],
            ["Total Area (Sqft)", formData.total_area || ''],
            ["Minimum Clear Height (ft)", formData.clear_height || ''],
            ["Building Plot Size", formData.plot_size || ''],
            ["Covered Area (Basement)", formData.covered_basement || ''],
            ["Covered Area (Ground Floor)", formData.covered_ground || ''],
            ["No. of Stories/Floors", formData.stories || ''],
        ], y);
        
        // --- Building Overview ---
        const buildingOverviewData = [
            ["Independent Premises", formData.independent_premises || ''],
            ["Status", formData.status || ''],
            ["Type of Premises", formData.premises_type || ''],
            ["Age of Premises", formData.premises_age || ''],
            ["Interior of Premises", formData.premises_interior || ''],
            ["Type of Construction", formData.construction_type || ''],
            ["Independent Entrance", getYesNo('independent_entrance')],
            ["Staff Staircase", getYesNo('staff_staircase')],
            ["Emergency Exit", `${getYesNo('emergency_exit')} (Can provide if not available: ${getYesNo('can_provide_exit')})`],
            ["Ramp Available", `${getYesNo('ramp_available')} (Can provide if not available: ${getYesNo('can_provide_ramp')})`],
            ["Seepage", `${getYesNo('seepage')} (Area: ${formData.seepage_area || 'N/A'}, Cause: ${formData.seepage_cause || 'N/A'})`],
            ["Generator Space", getYesNo('generator_space')],
            ["Property Utilization", [
                formData.pu_res && "Fully residential",
                formData.pu_com && "Fully Commercial",
                formData.pu_dual && "Dual use",
                formData.pu_ind && "Industrial"
            ].filter(Boolean).join(', ')],
            ["Building plinth level from road", formData.plinth_level || ''],
            ["Flooding Risk", getYesNo('flooding_risk')],
            ["Disable Access", getYesNo('disable_access')],
            ["Condition of roof waterproofing", formData.roof_waterproofing || ''],
            ["Parking Available", `${getYesNo('parking_available')} (On Main Road)`],
            ["Road Approachable", getYesNo('road_approachable')],
            ["Hazard in Vicinity (300m)", getYesNo('hazard_vicinity')],
            ["Wall Masonry Material", formData.wall_masonry_material || ''],
            ["Signage Space", getYesNo('signage_space')],
            ["Major Retainable Elements", [
                formData.mrb_wt && "Water Tank",
                formData.mrb_v && "Vault",
                formData.mrb_sf && "Subflooring",
                formData.mrb_sc && "Staircase",
                formData.mrb_o && "Others"
            ].filter(Boolean).join(', ')],
            ["In case of Plot, existing level from road", formData.plot_levels || ''],
        ];
        y = addSection("Building Overview", buildingOverviewData, y);


        // --- Utilities ---
        y = addSection("Utilities", [
            ["Sanctioned Electrical Load", formData.electrical_load || ''],
            ["Type of electrical load", [
                formData.el_com && "Commercial",
                formData.el_ind && "Industrial",
                formData.el_res && "Residential"
            ].filter(Boolean).join(', ')],
            ["Electrical Meter", formData.electrical_meter || ''],
            ["Piped Water", getYesNo('piped_water')],
            ["Underground Tank", getYesNo('underground_tank')],
            ["Overhead Tank", `${getYesNo('overhead_tank')} (Type: ${formData.overhead_tank_type || 'N/A'})`],
            ["Type of Water", formData.water_type || ''],
            ["Gas Connection", getYesNo('gas_connection')],
            ["Sewerage Line", getYesNo('sewerage_line')],
        ], y);
        
        // --- Bounded As ---
        y = addSection("Bounded As", [
            ["Front", formData.bound_front || ''],
            ["Back", formData.bound_back || ''],
            ["Right", formData.bound_right || ''],
            ["Left", formData.bound_left || ''],
        ], y);
        
        // --- Rental Detail ---
        y = addSection("Rental Detail", [
            ["Acquisition", formData.acquisition || ''],
            ["Expected Rental/month", formData.expected_rental || ''],
            ["Expected Advance (# of months)", formData.expected_advance || ''],
            ["Expected period of lease", formData.lease_period || ''],
            ["Annual increase in rental", formData.rental_increase || ''],
        ], y);
        
        // --- Survey Conducted By ---
        y = addSection("Survey Conducted By", [
            ["Name", formData.surveyor_name || ''],
            ["Designation", formData.surveyor_designation || ''],
            ["Contact", formData.surveyor_contact || ''],
            ["Cell", formData.surveyor_cell || ''],
            ["Landline", formData.surveyor_landline || ''],
            ["Email", formData.surveyor_email || ''],
            ["Date", formData.survey_date || ''],
        ], y);


        // --- Footer ---
        const footerY = doc.internal.pageSize.height - 15;
        doc.setLineWidth(0.2);
        doc.line(14, footerY, 196, footerY);
        y += 4;
        doc.setFontSize(7);
        const footerText = "Y-101 (Com), Phase-III, DHA Lahore Cantt | 0321-6995378, 042-35692522 | info@isbahhassan.com | www.isbahhassan.com";
        doc.text(footerText, 105, footerY + 4, { align: 'center'});

        doc.save('site-survey-proforma.pdf');
        toast({ title: 'Download Started', description: 'Your PDF is being generated.' });
    };

  const renderInput = (name: string, placeholder?: string) => {
      if (isEditing) {
          return <Input name={name} value={formData[name] || ''} onChange={handleInputChange} placeholder={placeholder} />
      }
      return <p className="border-b min-h-[24px] py-1">{formData[name] || ''}</p>
  }
  
  const renderTextarea = (name: string) => {
      if(isEditing) {
          return <Textarea name={name} value={formData[name] || ''} onChange={handleInputChange} rows={3} />
      }
      return <p className="border-b min-h-[72px] py-1 whitespace-pre-wrap">{formData[name] || ''}</p>
  }
    const renderRadioGroup = (name: string, items: string[]) => {
        return <RadioGroup name={name} value={formData[name]} onValueChange={(v) => handleRadioChange(name, v)} className="flex gap-4 mt-2" disabled={!isEditing}>
            {items.map(item => <div key={item} className="flex items-center space-x-2"><RadioGroupItem value={item.toLowerCase()} id={`${name}-${item.toLowerCase()}`} /><Label htmlFor={`${name}-${item.toLowerCase()}`}>{item}</Label></div>)}
        </RadioGroup>
    }

    const renderRadioGroupWithNote = (name: string, items: string[], note?: string) => {
        const title = name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        return <div className="flex items-center gap-2 flex-wrap">
            <Label>{title}?</Label>
            <RadioGroup className="flex gap-4" value={formData[name]} onValueChange={(v) => handleRadioChange(name, v)} disabled={!isEditing}>
              {items.map(item => <div key={item} className="flex items-center space-x-2"><RadioGroupItem value={item.toLowerCase()} /><Label>{item}</Label></div>)}
            </RadioGroup>
            {note && <Label className="text-sm text-muted-foreground">{note}</Label>}
        </div>
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
         <CardFooter className="flex-col items-center justify-center pt-6 border-t">
            <Separator className="mb-4"/>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><MapPin size={12}/> Y-101 (Com), Phase-III, DHA Lahore Cantt</div>
                <div className="flex items-center gap-1"><Phone size={12}/> 0321-6995378, 042-35692522</div>
                <div className="flex items-center gap-1"><Mail size={12}/> info@isbahhassan.com</div>
                <div className="flex items-center gap-1"><Globe size={12}/> www.isbahhassan.com</div>
            </div>
        </CardFooter>
      </Card>
    </main>
  );
};

export default SiteVisitPage;
