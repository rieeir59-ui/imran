
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit, Save } from "lucide-react";
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

interface ProjectDetails {
  name: string;
  architect: string;
  projectNo: string;
  projectDate: string;
}

export default function ProjectsPage() {
  const [isEditing, setIsEditing] = useState(true);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    architect: "",
    projectNo: "",
    projectDate: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("projectChecklistDetails");
      if (savedData) {
        setProjectDetails(JSON.parse(savedData));
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to parse project details from localStorage", error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem("projectChecklistDetails", JSON.stringify(projectDetails));
      setIsEditing(false);
      toast({
        title: "Project Saved",
        description: "Your project details have been saved locally.",
      });
    } catch (error) {
      console.error("Failed to save project details to localStorage", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save your project details.",
      });
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleDownload = () => {
    window.print();
  };

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
                <Button onClick={handleSave}>
                  <Save /> Save
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

          <Accordion type="single" collapsible className="w-full">
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
                        <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                          {subSection.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
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
