
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Save, Loader2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser, useMemoFirebase, setDocumentNonBlocking, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const DEFAULT_ASSESSMENT_ID = "main-predesign-assessment";

const Section = ({ title, items, formData, handleInputChange, isEditing }: { title: string, items: string[], formData: any, handleInputChange: any, isEditing: boolean }) => (
    <div className="flex-1 space-y-2">
        <h3 className="font-bold text-lg mb-2 underline">{title}</h3>
        {items.map(item => {
            const fieldName = item.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');
            return (
                <div key={fieldName} className="flex flex-col">
                    <Label htmlFor={fieldName} className="mb-1 text-sm">{item}</Label>
                    <Input 
                        id={fieldName}
                        name={fieldName}
                        value={formData[fieldName] || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="h-8"
                    />
                </div>
            )
        })}
    </div>
);

export default function PredesignAssessmentPage() {
    const [isEditing, setIsEditing] = useState(true);
    const [formData, setFormData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { toast } = useToast();
    const firestore = useFirestore();
    const auth = useAuth();
    const { user, isUserLoading } = useUser();
    
    useEffect(() => {
        if (!isUserLoading && !user && auth) {
            initiateAnonymousSignIn(auth);
        }
    }, [isUserLoading, user, auth]);

    const assessmentDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/predesignAssessments/${DEFAULT_ASSESSMENT_ID}`);
    }, [user, firestore]);
    
    useEffect(() => {
        if (!assessmentDocRef) return;

        setIsLoading(true);
        getDoc(assessmentDocRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    setFormData(docSnap.data() || {});
                }
                setIsEditing(true); 
            })
            .catch(async (serverError) => {
                console.error("Error fetching assessment data:", serverError);
                const permissionError = new FirestorePermissionError({
                  path: assessmentDocRef.path,
                  operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [assessmentDocRef]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!assessmentDocRef) {
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "User not authenticated.",
            });
            return;
        }

        setIsSaving(true);
        setDocumentNonBlocking(assessmentDocRef, formData, { merge: true });

        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast({
                title: "Assessment Saved",
                description: "Your predesign assessment has been saved.",
            });
        }, 500);
    };

    if (isUserLoading || isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading Assessment...</p>
            </div>
        );
    }

    if (!user && !isUserLoading) {
        return (
          <main className="p-4 md:p-6 lg:p-8">
           <Card>
             <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
             <CardContent>
               <Alert variant="destructive">
                 <Terminal className="h-4 w-4" />
                 <AlertTitle>Unable to Authenticate</AlertTitle>
                 <AlertDescription>We could not sign you in. Please refresh the page to try again.</AlertDescription>
               </Alert>
             </CardContent>
           </Card>
         </main>
       )
    }

    const humanFactors = ["Activities", "Behavior", "Objectives / Goals", "Organization", "Hierarchy", "Groups", "Positions", "Classifications", "Leadership", "Characteristics (Demographics)", "Social Forces", "Political Forces", "Interactions", "Communication", "Relationships", "Transfer of materials", "Policies / Codes", "Attitudes / Values", "Customs / Beliefs", "Perceptions", "Preferences", "Qualities", "Comfort", "Productivity", "Efficiency", "Security", "Safety", "Access", "Privacy", "Territory", "Control", "Convenience"];
    const physicalFactors = ["Location", "Region", "Locality", "Community", "Vicinity", "Site Conditions", "Building / Facility", "Envelope", "Structure", "Systems", "Engineering", "Communications", "Lighting", "Security", "Space", "Types", "Dimensions", "Relationship", "Equipment / Furnishings", "Materials / Finishes", "Support Services", "Storage", "Parking", "Access", "Waste removal", "Utilities (water, sewage, telephone)", "Operations", "Environment", "Comfort", "Visual", "Acoustical", "Energy Use / Conservation", "Durability / Flexibility"];
    const externalFactors = ["Legal Restrictions", "(Codes / Standards/Regulations)", "Building", "Land use", "Systems", "Energy", "Environment", "Materials", "Safety", "Solar access", "Topography", "Climate", "Ecology", "Resource Availability", "Energy Supplies / Prices", "Conventional", "Solar", "Alternatives", "Economy", "Financing", "Time", "Schedule", "Deadlines", "Operations", "Costs / Budget", "Construction", "Material", "Services", "Operations", "Cost / Benefits"];


    return (
        <main className="p-4 md:p-6 lg:p-8">
            <Card className="printable-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 no-print">
                            <Button variant="outline" asChild>
                                <Link href="/"><ArrowLeft />Back</Link>
                            </Button>
                        </div>
                        <CardTitle className="text-center text-2xl">PREDESIGN ASSESSMENT</CardTitle>
                        <div className="flex items-center gap-2 no-print">
                            <Button onClick={() => window.print()} variant="outline"><Download /> Download</Button>
                            {isEditing ? (
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save
                                </Button>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}><Edit /> Edit</Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Label>Project (Name, Address):</Label>
                            <Input name="project_name_address" value={formData.project_name_address || ''} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label>Architect:</Label>
                            <Input name="architect" value={formData.architect || ''} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                         <div className="flex items-center gap-2">
                            <Label>Architects Project No:</Label>
                            <Input name="architect_project_no" value={formData.architect_project_no || ''} onChange={handleInputChange} disabled={!isEditing} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label>Project Date:</Label>
                            <Input name="project_date" value={formData.project_date || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="YYYY-MM-DD" />
                        </div>
                    </div>
                    <Separator className="my-6"/>
                    <div className="flex flex-col md:flex-row gap-8">
                        <Section title="Human Factors" items={humanFactors} formData={formData} handleInputChange={handleInputChange} isEditing={isEditing} />
                        <Section title="Physical Factors" items={physicalFactors} formData={formData} handleInputChange={handleInputChange} isEditing={isEditing} />
                        <Section title="External Factors" items={externalFactors} formData={formData} handleInputChange={handleInputChange} isEditing={isEditing} />
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

    