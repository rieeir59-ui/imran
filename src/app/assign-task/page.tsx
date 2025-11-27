
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';


const projectList = [
    "1. HBL PRESTIGE JOHER TOWN",
    "2. 68-A HBL Prestige & RBC CITY HOUSING SIALKOT -II",
    "3. HBL DHA GUJRANWALA",
    "4. HBL CITY HOUSING SIALKOT",
    "5. HBL ASLAM MOR LAYYAH",
    "6. HBL Hellan Branch 1375 Gujranwala",
    "7. HBL Jaranwala Road",
    "8. HBL Poona branch",
    "9. HBL Raya Branch Lahore",
    "10. HBL Chowk Azam Branch 0847 Multan",
    "11. HBL Islamic prestige",
    "12. FBL-Finance Center-Gulberg LHR",
    "13. FBL-Finance Center-F10 Islamabad",
    "14. FBL JEHANGIRA NOWSHERA KPK",
    "15. FBL IBB Chinar Road Mansehra KPK",
    "16. FBL Jameel Chowk Peshawar",
    "17. FBL Jhangi Branch Gujranwala",
    "18. FBL Ferozpur Road Lahore",
    "19. FBL Park View City Lahore",
    "20. FBL CPC-KHARIAN-BRANCH",
    "21. FBL Bhowana",
    "22. FBL Peer-Wadahi Road Branch Rawalpindi",
    "23. FBL Gulbahar, Peshawer",
    "24. FBL Guest House DHA Phase-4 Lahore",
    "25. FBL Shahdara",
    "26. FBL RHQ (LG + GF)",
    "27. FBL RHQ (Basment)",
];

const designations = [
    "Architect",
    "Draftsperson",
    "3D Visualizer",
    "Quantity Surveyor",
    "Finance Manager",
    "Software Engineer",
];

export default function AssignTaskPage() {
    const [employeeName, setEmployeeName] = useState('');
    const [projectName, setProjectName] = useState('');
    const [designation, setDesignation] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [isSaving, setIsSaving] = useState(false);
    const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);
    const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);


    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();

    const employeesCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/employees`);
    }, [user, firestore]);

    const { data: employees, isLoading: isLoadingEmployees } = useCollection<{name: string}>(employeesCollectionRef);

    const employeeList = React.useMemo(() => {
        return employees ? employees.map(emp => emp.name) : [];
    }, [employees]);

    const tasksCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/tasks`);
    }, [user, firestore]);
    
    const handleAssignTask = () => {
        if (!tasksCollectionRef) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot assign task. User not authenticated.' });
            return;
        }
        if (!employeeName || !projectName || !taskDescription || !startDate || !endDate || !designation) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
            return;
        }

        setIsSaving(true);
        const taskData = {
            employeeName,
            projectName,
            designation,
            taskDescription,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            status: 'Assigned',
            assignedBy: user?.uid,
            createdAt: serverTimestamp(),
        };

        addDoc(tasksCollectionRef, taskData)
          .then(() => {
            toast({ title: 'Task Assigned!', description: `Task for ${projectName} has been assigned to ${employeeName}.` });
            setEmployeeName('');
            setProjectName('');
            setDesignation('');
            setTaskDescription('');
            setStartDate(undefined);
            setEndDate(undefined);
          })
          .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: tasksCollectionRef.path,
                operation: 'create',
                requestResourceData: taskData,
            });
            errorEmitter.emit('permission-error', permissionError);
          })
          .finally(() => {
            setIsSaving(false);
          });
    };

    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                 <div className="mb-4">
                    <Button variant="outline" asChild>
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Assign a New Task</CardTitle>
                        <CardDescription>Select an employee and provide the task details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employee-name">Employee</Label>
                             <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={employeePopoverOpen}
                                  className="w-full justify-between"
                                >
                                  {employeeName || "Select or type an employee..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command onValueChange={(value) => setEmployeeName(value)}>
                                  <CommandInput 
                                    placeholder="Search employee or type to add..."
                                    value={employeeName}
                                     onValueChange={(search) => {
                                        setEmployeeName(search);
                                    }}
                                  />
                                   <CommandList>
                                    {isLoadingEmployees && <div className="p-2 text-center text-sm">Loading employees...</div>}
                                    <CommandEmpty>No employee found. Type to create a new one.</CommandEmpty>
                                    <CommandGroup>
                                      {employeeList.map((employee) => (
                                        <CommandItem
                                          key={employee}
                                          value={employee}
                                          onSelect={(currentValue) => {
                                            setEmployeeName(currentValue === employeeName ? "" : currentValue)
                                            setEmployeePopoverOpen(false)
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              employeeName === employee ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {employee}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Select onValueChange={setDesignation} value={designation}>
                                <SelectTrigger id="designation">
                                    <SelectValue placeholder="Select a designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={projectPopoverOpen}
                                  className="w-full justify-between"
                                >
                                  {projectName || "Select or type a project..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command onValueChange={(value) => setProjectName(value)}>
                                  <CommandInput 
                                    placeholder="Search project or type to add..."
                                    value={projectName}
                                    onValueChange={(search) => {
                                        setProjectName(search);
                                    }}
                                  />
                                   <CommandList>
                                    <CommandEmpty>No project found. Type to create a new one.</CommandEmpty>
                                    <CommandGroup>
                                      {projectList.map((project) => (
                                        <CommandItem
                                          key={project}
                                          value={project}
                                          onSelect={(currentValue) => {
                                            setProjectName(currentValue === projectName ? "" : currentValue)
                                            setProjectPopoverOpen(false)
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              projectName === project ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {project}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="task-description">Task Description</Label>
                            <Textarea
                                id="task-description"
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="Enter a detailed description of the task..."
                            />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start-date">Start Date</Label>
                                <DatePicker date={startDate} onDateChange={setStartDate} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">End Date</Label>
                                <DatePicker date={endDate} onDateChange={setEndDate} />
                            </div>
                        </div>
                        <Button onClick={handleAssignTask} disabled={isSaving} className="w-full">
                            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Assign Task
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
