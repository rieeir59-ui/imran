
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import jsPDF from 'jspdf';
import { Download, Edit, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SITE_SURVEY_DOC_ID = 'site-survey';

const Subtitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
);

export default function SiteSurveyPage() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<any>({});
    
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const docRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/siteSurveys/${SITE_SURVEY_DOC_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!docRef) return;
        setIsLoading(true);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                setFormData(docSnap.data());
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsLoading(false));
    }, [docRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!isEditing) return;
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    
    const handleRadioChange = (name: string, value: string) => {
        if (!isEditing) return;
        setFormData({...formData, [name]: value});
    }

    const handleCheckboxChange = (name: string, checked: boolean | 'indeterminate') => {
        if (!isEditing || typeof checked !== 'boolean') return;
        setFormData(prev => ({...prev, [name]: checked }));
    };

    const handleSave = () => {
        if (!docRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated.' });
            return;
        }
        setIsSaving(true);
        setDoc(docRef, formData, { merge: true }).then(() => {
            toast({ title: 'Success', description: 'Site Survey saved.' });
            setIsEditing(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'write',
                requestResourceData: formData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }).finally(() => setIsSaving(false));
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        let y = 15;

        const addText = (text: string, x: number, yPos: number, options = {}) => {
            doc.text(text, x, yPos, options);
        };
        
        const addTitle = (title: string) => {
            if (y > 260) { doc.addPage(); y = 15; }
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(30, 41, 59);
            doc.rect(14, y - 5, 182, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(title, 16, y);
            y += 8;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
        };

        const addField = (label: string, value: string | undefined) => {
             if (y > 280) { doc.addPage(); y = 15; }
            addText(`${label}:`, 14, y);
            const splitValue = doc.splitTextToSize(value || '', 120);
            doc.text(splitValue, 70, y);
            y += (splitValue.length * 5) + 2;
        };
        
        const drawRadio = (x: number, yPos: number, isChecked: boolean) => {
            const radioSize = 1.5; // radius
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.circle(x, yPos - radioSize, radioSize, 'S');
            if (isChecked) {
                doc.setFillColor(0, 0, 0);
                doc.circle(x, yPos - radioSize, radioSize, 'F');
            }
        };

        const addRadio = (label: string, value: string | undefined, options: string[]) => {
            if (y > 280) { doc.addPage(); y = 15; }
            addText(`${label}:`, 14, y);
            let currentX = 70;
            options.forEach(opt => {
                const isChecked = (value && value.toLowerCase() === opt.toLowerCase());
                drawRadio(currentX, y, isChecked);
                doc.text(opt, currentX + 4, y);
                currentX += doc.getTextWidth(opt) + 15;
            });
            y += 7;
        };
        
        const addRadioWithNote = (label: string, value: string | undefined, options: string[], note?: string) => {
             if (y > 280) { doc.addPage(); y = 15; }
             addText(`${label}?`, 14, y);
             let currentX = 70;
             options.forEach(opt => {
                const isChecked = (value && value.toLowerCase() === opt.toLowerCase());
                drawRadio(currentX, y, isChecked);
                doc.text(opt, currentX + 4, y);
                currentX += doc.getTextWidth(opt) + 15;
             });
             if(note) {
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(note, currentX, y);
                doc.setFontSize(10);
                doc.setTextColor(0);
             }
             y += 7;
        };
        
        const drawCheckbox = (x: number, yPos: number, isChecked: boolean) => {
            const boxSize = 3.5;
            doc.setLineWidth(0.2);
            doc.setDrawColor(0);
            doc.rect(x, yPos - boxSize, boxSize, boxSize, 'S'); // Always draw the box
            if (isChecked) {
                doc.setFont('ZapfDingbats');
                doc.text('✓', x + 0.5, yPos); // Draw tick inside
            }
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0,0,0);
        };
        
        const addCheckbox = (label: string, name: string) => {
             if (y > 280) { doc.addPage(); y = 15; }
             drawCheckbox(18, y, formData[name]);
             addText(label, 24, y);
             y += 7;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("SITE SURVEY", 105, y, { align: 'center' });
        y += 5;
        doc.setFontSize(10);
        doc.text("REAL ESTATE MANAGEMENT", 105, y, { align: 'center' });
        y += 5;
        doc.text("PREMISES REVIEW FOR PROPOSED BRANCH/OFFICE", 105, y, { align: 'center' });
        y += 10;
        
        addTitle("Location");
        addRadio("Purpose", formData.purpose, ['Branch', 'Office', 'Other']);
        addField("City", formData.city);
        addField("Region", formData.region);
        addField("Address", formData.address);
        y += 5;
        
        addTitle("Legal File");
        addField("Name of Owner", formData.owner_name);
        addRadioWithNote("Completion Certificate", formData.completion_cert, ["Yes", "No"]);
        addRadioWithNote("Is Leased", formData.is_leased, ["Yes", "No"], "As informed by Owner Representative");
        y += 5;

        addTitle("Area");
        addField("Maximum Frontage (ft)", formData.frontage);
        addField("Maximum Depth (ft)", formData.depth);
        addField("Total Area (Sqft)", formData.total_area);
        addField("Minimum Clear Height (ft)", formData.clear_height);
        addField("Building Plot Size", formData.plot_size);
        addField("Covered Area (Basement)", formData.covered_basement);
        addField("Covered Area (Ground Floor)", formData.covered_ground);
        addField("No. of Stories/Floors", formData.stories);
        y += 5;

        addTitle("Building Overview");
        addRadio("Independent Premises", formData.independent_premises, ["Yes", "No"]);
        addField("Status", formData.status);
        addField("Type of Premises", formData.premises_type);
        addField("Age of Premises", formData.premises_age);
        addField("Interior of Premises", formData.premises_interior);
        addField("Type of Construction", formData.construction_type);
        addRadioWithNote("Independent Entrance", formData.independent_entrance, ["Yes", "No"]);
        addRadioWithNote("Staff Staircase", formData.staff_staircase, ["Yes", "No"]);
        addRadioWithNote("Emergency Exit", formData.emergency_exit, ["Yes", "No"]);
        addRadioWithNote("Can provide exit if not available?", formData.can_provide_exit, ["Yes", "No"]);
        addRadioWithNote("Ramp Available", formData.ramp_available, ["Yes", "No"]);
        addRadioWithNote("Can provide ramp if not available?", formData.can_provide_ramp, ["Yes", "No"]);
        addRadio("Seepage", formData.seepage, ["Yes", "No"]);
        addField("Area of Seepage", formData.seepage_area);
        addField("Cause of Seepage", formData.seepage_cause);
        addRadio("Generator Space", formData.generator_space, ["Yes", "No"]);
        
        doc.text("Property Utilization:", 14, y); y+=7;
        addCheckbox("Fully residential", "pu_res");
        addCheckbox("Fully Commercial", "pu_com");
        addCheckbox("Dual use", "pu_dual");
        addCheckbox("Industrial", "pu_ind");

        addField("Building plinth level from the road", formData.plinth_level);
        addRadioWithNote("Flooding Risk", formData.flooding_risk, ["Yes", "No"]);
        addRadioWithNote("Disable Access", formData.disable_access, ["Yes", "No"]);
        addField("Condition of roof waterproofing", formData.roof_waterproofing);
        addRadioWithNote("Parking Available", formData.parking_available, ["Yes", "No"], "On Main Road");
        addRadioWithNote("Road Approachable", formData.road_approachable, ["Yes", "No"]);
        addRadioWithNote("Hazard in Vicinity (300m)", formData.hazard_vicinity, ["Yes", "No"]);
        addRadioWithNote("Wall Masonry Material", formData.wall_masonry_material, ["Yes", "No"]);
        addRadioWithNote("Signage Space", formData.signage_space, ["Yes", "No"]);

        doc.text("Major retainable building elements:", 14, y); y+=7;
        addCheckbox("Water Tank", "mrb_wt");
        addCheckbox("Vault", "mrb_v");
        addCheckbox("Subflooring", "mrb_sf");
        addCheckbox("Staircase", "mrb_sc");
        addCheckbox("Others", "mrb_o");
        
        addField("In case of Plot provide existing level from road & surrounding buildings", formData.plot_levels);
        y+= 5;
        
        addTitle("Utilities");
        addField("Sanctioned Electrical Load", formData.electrical_load);
        addRadio("Electrical Meter", formData.electrical_meter, ["Single Phase", "3 Phase"]);
        addRadioWithNote("Piped Water", formData.piped_water, ["Yes", "No"]);
        addRadioWithNote("Underground Tank", formData.underground_tank, ["Yes", "No"]);
        addRadioWithNote("Overhead Tank", formData.overhead_tank, ["Yes", "No"]);
        addField("Type of Overhead Tank", formData.overhead_tank_type);
        addField("Type of Water", formData.water_type);
        addRadioWithNote("Gas Connection", formData.gas_connection, ["Yes", "No"]);
        addRadioWithNote("Sewerage Line", formData.sewerage_line, ["Yes", "No"]);
        y += 5;

        addTitle("Bounded As");
        addField("Front", formData.bound_front);
        addField("Back", formData.bound_back);
        addField("Right", formData.bound_right);
        addField("Left", formData.bound_left);
        y+=5;
        
        addTitle("Rental Detail");
        addField("Acquisition", formData.acquisition);
        addField("Expected Rental/month", formData.expected_rental);
        addField("Expected Advance (# of month)", formData.expected_advance);
        addField("Expected period of lease", formData.lease_period);
        addField("Annual increase in rental", formData.rental_increase);
        y+=5;

        addTitle("Survey Conducted By");
        addField("Name", formData.surveyor_name);
        addField("Designation", formData.surveyor_designation);
        addField("Contact", formData.surveyor_contact);
        addField("Cell", formData.surveyor_cell);
        addField("Landline", formData.surveyor_landline);
        addField("Email", formData.surveyor_email);
        addField("Date", formData.survey_date);

        doc.save("site-survey.pdf");
        toast({ title: 'Download Started', description: 'PDF is being generated.' });
    };
    
    const renderInput = (name: string, placeholder?: string) => {
        return isEditing ? <Input name={name} value={formData[name] || ''} onChange={handleInputChange} placeholder={placeholder} /> : <div className="border-b min-h-[24px] py-1">{formData[name] || ''}</div>
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
    
    if (isLoading || isUserLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /> Loading...</div>
    }

    return (
        <main className="p-4 md:p-6 lg:p-8">
             <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-center">SITE SURVEY</CardTitle>
                        <p className='text-center'>REAL ESTATE MANAGEMENT</p>
                        <p className='text-center'>PREMISES REVIEW FOR PROPOSED BRANCH/OFFICE</p>
                        <p className="text-sm text-center">This questionnaire form provides preliminary information for determining the suitability of premises or property to be acquired</p>
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
                <CardContent className="space-y-6">
                    <div>
                        <Subtitle>Location</Subtitle>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Purpose</Label>
                                {renderRadioGroup('purpose', ['Branch', 'Office', 'Other'])}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {renderInput('city', 'City')}
                                {renderInput('region', 'Region')}
                            </div>
                            <div className="col-span-2">{renderInput('address', 'Address')}</div>
                        </div>
                    </div>
                    <div>
                        <Subtitle>Legal File</Subtitle>
                         <div className="grid grid-cols-2 gap-4">
                            {renderInput('owner_name', 'Name of Owner')}
                            {renderRadioGroupWithNote('completion_cert', ['Yes', 'No'], 'Completion Certificate')}
                            {renderRadioGroupWithNote('is_leased', ['Yes', 'No'], 'As informed by Owner Representative')}
                        </div>
                    </div>
        
                    <div>
                        <Subtitle>Area</Subtitle>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Dimension (Attach as-built plan(s))</Label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    {renderInput('frontage', 'Maximum Frontage in feet')}
                                    {renderInput('depth', 'Maximum Depth in feet')}
                                </div>
                            </div>
                            {renderInput('total_area', 'Total Area in Sqft')}
                            {renderInput('clear_height', 'Minimum clear height (floor to roof) in ft')}
                            {renderInput('plot_size', 'Building plot size of which premises is a part')}
                            <div className="grid grid-cols-2 gap-4">
                                {renderInput('covered_basement', 'Covered Area (Basement)')}
                                {renderInput('covered_ground', 'Covered Area (Ground Floor)')}
                            </div>
                            {renderInput('stories', 'No. of Stories/floors (mention, mezzanine basement, roof parapet wall)')}
                        </div>
                    </div>
        
                    <div>
                        <Subtitle>Building Overview</Subtitle>
                         <div className="grid grid-cols-2 gap-4 items-start">
                            <div><Label>Independent Premises</Label>{renderRadioGroup('independent_premises', ['Yes', 'No'])}</div>
                            <div><Label>Status</Label>{renderInput('status')}</div>
                            <div><Label>Type of Premises</Label>{renderInput('premises_type')}</div>
                            <div><Label>Age of Premises</Label>{renderInput('premises_age')}</div>
                            <div><Label>Interior of Premises</Label>{renderInput('premises_interior')}</div>
                            <div><Label>Type of Construction</Label>{renderInput('construction_type')}</div>
        
                            <div className="col-span-2"><p className="font-semibold">Condition of premises with reference to structural stability</p></div>
                            {renderRadioGroupWithNote('independent_entrance', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('staff_staircase', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('emergency_exit', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('can_provide_exit', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('ramp_available', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('can_provide_ramp', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('seepage', ['Yes', 'No'])}
                            {renderInput('seepage_area', 'Area of seepage (Walls, slab, etc.)')}
                            {renderInput('seepage_cause', 'Cause of seepage')}
                            {renderRadioGroupWithNote('generator_space', ['Yes', 'No'])}
                            <div>
                                <Label>Property Utilization</Label>
                                <div className="flex flex-wrap gap-4 mt-2">
                                   <div className="flex items-center space-x-2"><Checkbox id="pu-res" name="pu_res" checked={formData['pu_res']} onCheckedChange={(c) => handleCheckboxChange('pu_res', c)} disabled={!isEditing} /><Label htmlFor="pu-res">Fully residential</Label></div>
                                   <div className="flex items-center space-x-2"><Checkbox id="pu-com" name="pu_com" checked={formData['pu_com']} onCheckedChange={(c) => handleCheckboxChange('pu_com', c)} disabled={!isEditing} /><Label htmlFor="pu-com">Fully Commercial</Label></div>
                                   <div className="flex items-center space-x-2"><Checkbox id="pu-dual" name="pu_dual" checked={formData['pu_dual']} onCheckedChange={(c) => handleCheckboxChange('pu_dual', c)} disabled={!isEditing} /><Label htmlFor="pu-dual">Dual use</Label></div>
                                   <div className="flex items-center space-x-2"><Checkbox id="pu-ind" name="pu_ind" checked={formData['pu_ind']} onCheckedChange={(c) => handleCheckboxChange('pu_ind', c)} disabled={!isEditing} /><Label htmlFor="pu-ind">Industrial</Label></div>
                                </div>
                            </div>
                            {renderInput('plinth_level', 'Building plinth level from the road')}
                            {renderRadioGroupWithNote('flooding_risk', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('disable_access', ['Yes', 'No'])}
                            {renderInput('roof_waterproofing', 'Condition of roof waterproofing (if applicable)')}
                             {renderRadioGroupWithNote('parking_available', ['Yes', 'No'], 'On Main Road')}
                            {renderRadioGroupWithNote('road_approachable', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('hazard_vicinity', ['Yes', 'No'], '300 meter')}
                            {renderRadioGroupWithNote('wall_masonry_material', ['Yes', 'No'])}
                            {renderRadioGroupWithNote('signage_space', ['Yes', 'No'])}
        
                            <div className="col-span-2">
                                <Label>Major retainable building elements</Label>
                                <div className="flex flex-wrap gap-4 mt-2">
                                   <div className="flex items-center space-x-2"><Checkbox id="mrb-wt" name="mrb_wt" checked={formData.mrb_wt} onCheckedChange={c=>handleCheckboxChange('mrb_wt', c)} disabled={!isEditing} /><Label htmlFor="mrb-wt">Water Tank</Label></div>
                                   <div className="flex items-center space-x-2"><Checkbox id="mrb-v" name="mrb_v" checked={formData.mrb_v} onCheckedChange={c=>handleCheckboxChange('mrb_v', c)} disabled={!isEditing} /><Label htmlFor="mrb-v">Vault</Label></div>
                                   <div className="flex items-center space-x-2"><Checkbox id="mrb-sf" name="mrb_sf" checked={formData.mrb_sf} onCheckedChange={c=>handleCheckboxChange('mrb_sf', c)} disabled={!isEditing} /><Label htmlFor="mrb-sf">Subflooring</Label></div>
                                   <div className="flex items-center space-x-2"><Checkbox id="mrb-sc" name="mrb_sc" checked={formData.mrb_sc} onCheckedChange={c=>handleCheckboxChange('mrb_sc', c)} disabled={!isEditing} /><Label htmlFor="mrb-sc">Staircase</Label></div>
                                   <div className="flex items-center space-x-2"><Checkbox id="mrb-o" name="mrb_o" checked={formData.mrb_o} onCheckedChange={c=>handleCheckboxChange('mrb_o', c)} disabled={!isEditing} /><Label htmlFor="mrb-o">Others</Label></div>
                                </div>
                            </div>
                             <div className="col-span-2">{renderInput('plot_levels', 'In case of Plot provide existing level from road & surrounding buildings')}</div>
        
                             <div>
                                <Label>Building Control Violations</Label>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center space-x-2"><Checkbox id="bcv-maj" name="bcv_maj" checked={formData.bcv_maj} onCheckedChange={c=>handleCheckboxChange('bcv_maj', c)} disabled={!isEditing} /><Label htmlFor="bcv-maj">Major</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="bcv-min" name="bcv_min" checked={formData.bcv_min} onCheckedChange={c=>handleCheckboxChange('bcv_min', c)} disabled={!isEditing} /><Label htmlFor="bcv-min">Minor</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id="bcv-no" name="bcv_no" checked={formData.bcv_no} onCheckedChange={c=>handleCheckboxChange('bcv_no', c)} disabled={!isEditing} /><Label htmlFor="bcv-no">No Deviation</Label></div>
                                    <Label className="text-sm text-muted-foreground">As performed by owner representative</Label>
                                </div>
                            </div>
                         </div>
                    </div>
        
                    <div>
                        <Subtitle>Utilities</Subtitle>
                        <div className="grid grid-cols-2 gap-4">
                            {renderInput('electrical_load', 'Sanctioned electrical load')}
                            <div>
                                <Label>Type of electrical load</Label>
                                 <div className="flex flex-wrap gap-4 mt-2">
                                     <div className="flex items-center space-x-2"><Checkbox id="el-com" name="el_com" checked={formData.el_com} onCheckedChange={c=>handleCheckboxChange('el_com', c)} disabled={!isEditing} /><Label htmlFor="el-com">Commercial</Label></div>
                                     <div className="flex items-center space-x-2"><Checkbox id="el-ind" name="el_ind" checked={formData.el_ind} onCheckedChange={c=>handleCheckboxChange('el_ind', c)} disabled={!isEditing} /><Label htmlFor="el-ind">Industrial</Label></div>
                                     <div className="flex items-center space-x-2"><Checkbox id="el-res" name="el_res" checked={formData.el_res} onCheckedChange={c=>handleCheckboxChange('el_res', c)} disabled={!isEditing} /><Label htmlFor="el-res">Residential</Label></div>
                                </div>
                            </div>
                            <div>
                                <Label>Electrical Meter</Label>
                                {renderRadioGroup('electrical_meter', ['Single Phase', '3 Phase'])}
                            </div>
                            {renderRadioGroupWithNote('piped_water', ['Yes', 'No'], 'Piped Water')}
                            {renderRadioGroupWithNote('underground_tank', ['Yes', 'No'], 'Underground Tank')}
                            {renderRadioGroupWithNote('overhead_tank', ['Yes', 'No'], 'Overhead Tank')}
                            {renderInput('overhead_tank_type', 'Type of Overhead tank (RCC, Fiber etc.)')}
                            {renderInput('water_type', 'Type of water (boring or liner water)')}
                            {renderRadioGroupWithNote('gas_connection', ['Yes', 'No'], 'Gas Connection')}
                            {renderRadioGroupWithNote('sewerage_line', ['Yes', 'No'], 'Sewerage Line')}
                        </div>
                    </div>
        
                    <div>
                        <Subtitle>Bounded As</Subtitle>
                        <div className="grid grid-cols-2 gap-4">
                            {renderInput('bound_front', 'Front')}
                            {renderInput('bound_back', 'Back')}
                            {renderInput('bound_right', 'Right')}
                            {renderInput('bound_left', 'Left')}
                        </div>
                    </div>
        
                    <div>
                        <Subtitle>Rental Detail</Subtitle>
                         <div className="grid grid-cols-2 gap-4">
                             {renderInput('acquisition', 'Acquisition')}
                             {renderInput('expected_rental', 'Expected Rental/month')}
                             {renderInput('expected_advance', 'Expected Advance (# of month)')}
                             {renderInput('lease_period', 'Expected period of lease')}
                             {renderInput('rental_increase', 'Annual increase in rental')}
                         </div>
                    </div>
                     <div>
                        <Subtitle>Survey Conducted By</Subtitle>
                         <div className="grid grid-cols-2 gap-4">
                             {renderInput('surveyor_name', 'Name')}
                             {renderInput('surveyor_designation', 'Designation')}
                             {renderInput('surveyor_contact', 'Contact')}
                             {renderInput('surveyor_cell', 'Cell')}
                             {renderInput('surveyor_landline', 'Landline')}
                             {renderInput('surveyor_email', 'Email')}
                             {renderInput('survey_date', 'Date')}
                         </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
