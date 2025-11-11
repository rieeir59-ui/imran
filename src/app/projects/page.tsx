
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Save, Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { projectChecklistSections } from "@/lib/projects-data";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { initiateAnonymousSignIn, setDocumentNonBlocking } from "@/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface ProjectDetails {
  name: string;
  architect: string;
  projectNo: string;
  projectDate: string;
}

type CheckedItems = Record<string, boolean>;

const DEFAULT_PROJECT_ID = "main-checklist";

export default function ProjectsPage() {
  const [isEditing, setIsEditing] = useState(true);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    architect: "",
    projectNo: "",
    projectDate: "",
  });
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Effect for anonymous sign-in
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const checklistDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/projectChecklists/${DEFAULT_PROJECT_ID}`);
  }, [user, firestore]);

  // Effect to load data from Firestore
  useEffect(() => {
    if (!checklistDocRef) {
      // Still waiting for user/firestore
      return;
    }

    setIsLoading(true);
    getDoc(checklistDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProjectDetails(data.details || { name: "", architect: "", projectNo: "", projectDate: "" });
          setCheckedItems(data.checkedItems || {});
          // If data exists, start in non-editing mode
          setIsEditing(false);
        } else {
          // No data, start in editing mode
          setIsEditing(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching project data:", error);
        toast({
          variant: "destructive",
          title: "Load Failed",
          description: "Could not load project data from the database.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [checklistDocRef, toast]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, checked: boolean | "indeterminate") => {
    if (typeof checked === 'boolean') {
      setCheckedItems((prev) => ({ ...prev, [id]: checked }));
    }
  };

  const handleSave = () => {
    if (!checklistDocRef) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "User not authenticated. Cannot save.",
      });
      return;
    }

    setIsSaving(true);
    const dataToSave = {
      details: projectDetails,
      checkedItems: checkedItems,
    };
    
    setDocumentNonBlocking(checklistDocRef, dataToSave, { merge: true });
    
    // Optimistically update UI
    setIsEditing(false);
    setIsSaving(false);
    toast({
      title: "Project Saved",
      description: "Your project details have been saved.",
    });

  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleDownload = () => {
    window.print();
  };
  
  if (isUserLoading || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading Project...</p>
      </div>
    );
  }
  
  if (!user && !isUserLoading) {
    return (
       <main className="p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Unable to Authenticate</AlertTitle>
              <AlertDescription>
                We could not sign you in. Please refresh the page to try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card className="printable-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 no-print">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft />
                  Back
                </Link>
              </Button>
            </div>
            <CardTitle>Project Checklist</CardTitle>
            <div className="flex items-center gap-2 no-print">
              <Button onClick={handleDownload} variant="outline">
                <Download /> Download
              </Button>
              {isEditing ? (
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                   Save
                </Button>
              ) : (
                <Button onClick={handleEdit}>
                  <Edit /> Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name, Address</Label>
              <Input
                id="name"
                placeholder="Enter project name and address"
                value={projectDetails.name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="architect">Architect</Label>
              <Input
                id="architect"
                placeholder="Enter architect name"
                value={projectDetails.architect}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectNo">Architect Project No</Label>
              <Input
                id="projectNo"
                placeholder="Enter project number"
                value={projectDetails.projectNo}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDate">Project Date</Label>
              <Input
                id="projectDate"
                type="date"
                value={projectDetails.projectDate}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            {projectChecklistSections.map((section, index) => (
              <AccordionItem value={`item-${index + 1}`} key={section.title}>
                <AccordionTrigger className="text-xl font-semibold">
                  {`${index + 1}: - ${section.title}`}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pl-4">
                    {section.subSections.map((subSection) => (
                      <div key={subSection.title}>
                        <h4 className="font-medium text-lg mb-2">
                          {subSection.title}:
                        </h4>
                        <ul className="space-y-2 pl-2">
                          {subSection.items.map((item, itemIndex) => {
                            const checkboxId = `${section.title}-${subSection.title}-${itemIndex}`.replace(/\s+/g, '-');
                            return (
                              <li key={checkboxId} className="flex items-center gap-2">
                                <Checkbox
                                  id={checkboxId}
                                  checked={checkedItems[checkboxId] || false}
                                  onCheckedChange={(checked) => handleCheckboxChange(checkboxId, checked)}
                                  disabled={!isEditing}
                                />
                                <label
                                  htmlFor={checkboxId}
                                  className="text-sm text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {item}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </main>
  );
}

    