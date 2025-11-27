
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Paintbrush,
  DraftingCompass,
  Camera,
  Calculator,
  Banknote,
  User,
  CheckCircle,
  XCircle,
  Code,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, onSnapshot, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


const teams = [
  { name: 'Architects', icon: Paintbrush, href: '/schedules-by-designation?name=Architect', designation: 'Architect' },
  { name: 'Software Engineers', icon: Code, href: '/schedules-by-designation?name=Software+Engineer', designation: 'Software Engineer' },
  { name: '3D Visualizer', icon: Camera, href: '/schedules-by-designation?name=3D+Visualizer', designation: '3D Visualizer' },
  { name: 'BOQ Management', icon: Calculator, href: '/schedules-by-designation?name=Quantity+Surveyor', designation: 'Quantity Surveyor' },
  { name: 'Finance', icon: Banknote, href: '/schedules-by-designation?name=Finance+Manager', designation: 'Finance Manager' },
  { name: 'Draftspersons', icon: DraftingCompass, href: '/schedules-by-designation?name=Draftsperson', designation: 'Draftsperson' },
];

interface Employee {
    id: string;
    name: string;
    designation: string;
}

interface Task {
  employeeName: string;
}

// One-time function to add initial architects
const addInitialArchitects = async (firestore: any, user: any, employees: Employee[]) => {
  const architectsToAdd = [
    { name: "Sobia Razzak", designation: "Architect" },
    { name: "Luqman Aslam", designation: "Architect" },
    { name: "M. Asad", designation: "Architect" },
    { name: "M. Haseeb", designation: "Architect" },
    { name: "M. Waleed Zahid", designation: "Architect" },
    { name: "M. Khizar", designation: "Architect" },
  ];

  const existingArchitectNames = new Set(
    employees
      .filter(emp => emp.designation === 'Architect')
      .map(emp => emp.name)
  );

  const newArchitects = architectsToAdd.filter(
    arch => !existingArchitectNames.has(arch.name)
  );

  if (newArchitects.length === 0) {
    return; // All architects already exist
  }

  const batch = writeBatch(firestore);
  const employeesCollectionRef = collection(firestore, `users/${user.uid}/employees`);

  newArchitects.forEach(architect => {
    const newDocRef = doc(employeesCollectionRef);
    batch.set(newDocRef, architect);
  });

  await batch.commit();
};

const addInitialSoftwareEngineers = async (firestore: any, user: any, employees: Employee[]) => {
  const engineersToAdd = [
    { name: "Imran Abbas", designation: "Software Engineer" },
    { name: "Rabiya Eman", designation: "Software Engineer" },
  ];

  const existingEngineers = new Set(
    employees
      .filter(emp => emp.designation === 'Software Engineer')
      .map(emp => emp.name)
  );

  const newEngineers = engineersToAdd.filter(
    eng => !existingEngineers.has(eng.name)
  );

  if (newEngineers.length === 0) {
    return;
  }

  const batch = writeBatch(firestore);
  const employeesCollectionRef = collection(firestore, `users/${user.uid}/employees`);

  newEngineers.forEach(engineer => {
    const newDocRef = doc(employeesCollectionRef);
    batch.set(newDocRef, engineer);
  });

  await batch.commit();
};

const addInitial3DVisualizer = async (firestore: any, user: any, employees: Employee[]) => {
  const visualizersToAdd = [
    { name: "Mohsin", designation: "3D Visualizer" },
  ];

  const existingVisualizers = new Set(
    employees
      .filter(emp => emp.designation === '3D Visualizer')
      .map(emp => emp.name)
  );

  const newVisualizers = visualizersToAdd.filter(
    viz => !existingVisualizers.has(viz.name)
  );

  if (newVisualizers.length === 0) {
    return;
  }

  const batch = writeBatch(firestore);
  const employeesCollectionRef = collection(firestore, `users/${user.uid}/employees`);

  newVisualizers.forEach(visualizer => {
    const newDocRef = doc(employeesCollectionRef);
    batch.set(newDocRef, visualizer);
  });

  await batch.commit();
};

const addInitialBOQManager = async (firestore: any, user: any, employees: Employee[]) => {
  const boqManagersToAdd = [
    { name: "M Nouman", designation: "Quantity Surveyor" },
  ];

  const existingManagers = new Set(
    employees
      .filter(emp => emp.designation === 'Quantity Surveyor')
      .map(emp => emp.name)
  );

  const newManagers = boqManagersToAdd.filter(
    mgr => !existingManagers.has(mgr.name)
  );

  if (newManagers.length === 0) {
    return;
  }

  const batch = writeBatch(firestore);
  const employeesCollectionRef = collection(firestore, `users/${user.uid}/employees`);

  newManagers.forEach(manager => {
    const newDocRef = doc(employeesCollectionRef);
    batch.set(newDocRef, manager);
  });

  await batch.commit();
};

const addInitialFinanceManager = async (firestore: any, user: any, employees: Employee[]) => {
  const managersToAdd = [
    { name: "M Waqas", designation: "Finance Manager" },
  ];

  const existingManagers = new Set(
    employees
      .filter(emp => emp.designation === 'Finance Manager')
      .map(emp => emp.name)
  );

  const newManagers = managersToAdd.filter(
    mgr => !existingManagers.has(mgr.name)
  );

  if (newManagers.length === 0) {
    return;
  }

  const batch = writeBatch(firestore);
  const employeesCollectionRef = collection(firestore, `users/${user.uid}/employees`);

  newManagers.forEach(manager => {
    const newDocRef = doc(employeesCollectionRef);
    batch.set(newDocRef, manager);
  });

  await batch.commit();
};


export default function TeamDashboard() {
  const [employeesByDesignation, setEmployeesByDesignation] = useState<Record<string, Employee[]>>({});
  const [employeesWithTasks, setEmployeesWithTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const employeesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/employees`);
  }, [user, firestore]);

  const tasksCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [user, firestore]);

  useEffect(() => {
    if (!employeesCollectionRef) {
        setIsLoading(false);
        return;
    }
    const unsubscribe = onSnapshot(employeesCollectionRef, (snapshot) => {
        const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        
        if (user && firestore) {
          addInitialArchitects(firestore, user, fetchedEmployees).catch(console.error);
          addInitialSoftwareEngineers(firestore, user, fetchedEmployees).catch(console.error);
          addInitial3DVisualizer(firestore, user, fetchedEmployees).catch(console.error);
          addInitialBOQManager(firestore, user, fetchedEmployees).catch(console.error);
          addInitialFinanceManager(firestore, user, fetchedEmployees).catch(console.error);
        }
        
        const groupedByDesignation = fetchedEmployees.reduce((acc, employee) => {
            const { designation } = employee;
            if (!acc[designation]) {
                acc[designation] = [];
            }
            acc[designation].push(employee);
            return acc;
        }, {} as Record<string, Employee[]>);
        
        setEmployeesByDesignation(groupedByDesignation);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [employeesCollectionRef, firestore, user]);

  useEffect(() => {
    if (!tasksCollectionRef) return;

    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
        const assignedEmployees = new Set<string>();
        snapshot.forEach((doc) => {
          const task = doc.data() as Task;
          assignedEmployees.add(task.employeeName);
        });
        setEmployeesWithTasks(assignedEmployees);
    });
    
    return () => unsubscribe();
  }, [tasksCollectionRef]);

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication error.' });
      return;
    }
    const docRef = doc(firestore, `users/${user.uid}/employees`, employeeId);
    try {
      await deleteDoc(docRef);
      toast({ title: 'Employee Deleted', description: 'The employee has been removed successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete the employee.' });
    }
  };

  const renderEmployeeCard = (employee: { id: string, name: string; designation: string }) => {
    const hasTask = employeesWithTasks.has(employee.name);
    const href = `/weekly-schedule?employee=${encodeURIComponent(employee.name)}&designation=${encodeURIComponent(employee.designation)}`;

    return (
      <div key={employee.id} className="relative group">
         <Link href={href} className="block p-4 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center justify-center h-full min-h-[124px]">
            <User className="h-8 w-8 text-primary mb-2" />
            <span className="font-semibold text-center">{employee.name}</span>
            {hasTask ? (
              <CheckCircle className="h-5 w-5 text-green-500 absolute top-2 right-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 absolute top-2 right-2" />
            )}
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
                variant="destructive"
                size="icon"
                className="absolute bottom-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {employee.name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  const AddEmployeeCard = ({designation}: {designation: string}) => (
    <Link href={`/add-employee?designation=${encodeURIComponent(designation)}`} passHref>
        <div className="p-4 rounded-lg border-dashed border-2 hover:bg-accent hover:border-solid transition-colors flex flex-col items-center justify-center h-full min-h-[124px]">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-muted-foreground text-center">Add Employee</span>
        </div>
    </Link>
  );
  
  const renderTeamSection = (team: { name: string, designation: string }) => {
    const teamEmployees = employeesByDesignation[team.designation] || [];
    return (
        <Card className="lg:col-span-3" key={team.name}>
            <CardHeader>
                <CardTitle>{team.name} Team</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {isLoading && !employeesByDesignation[team.designation] ? (
                    <>
                        <Skeleton className="h-[124px] w-full" />
                        <Skeleton className="h-[124px] w-full" />
                    </>
                ) : (
                    teamEmployees.map(renderEmployeeCard)
                )}
                <AddEmployeeCard designation={team.designation} />
            </CardContent>
        </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Team Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {teams.map((team) => (
            <Link href={team.href} key={team.name}>
              <div className="p-4 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center justify-center h-full">
                <team.icon className="h-8 w-8 text-primary mb-2" />
                <span className="font-semibold text-center">{team.name}</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
      
      {teams.map(team => renderTeamSection(team))}
    </div>
  );
}
