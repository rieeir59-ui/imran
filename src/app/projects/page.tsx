
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectChecklistSections } from "@/lib/projects-data";

export default function ProjectsPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name, Address</Label>
              <Input id="project-name" placeholder="Enter project name and address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-architect">Architect</Label>
              <Input id="project-architect" placeholder="Enter architect name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-no">Architect Project No</Label>
              <Input id="project-no" placeholder="Enter project number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-date">Project Date</Label>
              <Input id="project-date" type="date" />
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
                        <h4 className="font-medium text-lg mb-2">{subSection.title}:</h4>
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
