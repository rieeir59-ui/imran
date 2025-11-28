
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
import { useFirestore, useUser, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, onSnapshot, doc, deleteDoc, writeBatch, getDocs, query, setDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect, useMemo, useRef } from 'react';
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

const setupInitialTeam = async (firestore: any, user: any) => {
    const employeesCollectionRef = collection(firestore, `users/${user.uid}/employees`);
    
    const correctArchitects = [
      { name: "Sobia Razzak", designation: "Architect" },
      { name: "Luqman Aslam", designation: "Architect" },
      { name: "Syed M Asad", designation: "Architect" },
      { name: "M Haseeb", designation: "Architect" },
      { name: "M Waleed Zahid", designation: "Architect" },
      { name: "M Khizar", designation: "Architect" },
    ];
    
    const batch = writeBatch(firestore);

    correctArchitects.forEach(architect => {
        const newDocRef = doc(employeesCollectionRef);
        batch.set(newDocRef, architect);
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
  const setupDone = useRef(false);

  const employeesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/employees`);
  }, [user, firestore]);

  const tasksCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [user, firestore]);

  useEffect(() => {
    if (!employeesCollectionRef || !user || !firestore) {
        setIsLoading(false);
        return;
    }
    
    if (setupDone.current) return;
    setupDone.current = true;

    const checkAndRunInitialSetup = async () => {
        const setupDocRef = doc(firestore, `users/${user.uid}/app-settings`, 'initialSetup');
        const docSnap = await getDoc(setupDocRef);
        if (!docSnap.exists() || !docSnap.data().teamSetupDone) {
            await setupInitialTeam(firestore, user);
            await setDoc(setupDocRef, { teamSetupDone: true });
        }
    };

    checkAndRunInitialSetup().then(() => {
        const unsubscribe = onSnapshot(employeesCollectionRef, (snapshot) => {
            const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            
            const groupedByDesignation = fetchedEmployees.reduce((acc, employee) => {
                const { designation } = employee;
                if (!acc[designation]) {
                    acc[designation] = [];
                }
                acc[designation].push(employee);
                return acc;
            }, {} as Record<string, Employee[]>);

            if (groupedByDesignation['Architect']) {
                const architectOrder = ["Sobia Razzak", "Luqman Aslam", "Syed M Asad", "M Haseeb", "M Waleed Zahid", "M Khizar"];
                groupedByDesignation['Architect'].sort((a, b) => {
                    const indexA = architectOrder.indexOf(a.name);
                    const indexB = architectOrder.indexOf(b.name);
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
            }
            
            setEmployeesByDesignation(groupedByDesignation);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }).catch(error => {
        console.error("Error in initial setup or snapshot listener:", error);
        setIsLoading(false);
    });

  }, [employeesCollectionRef, firestore, user]);

  useEffect(() => {
    if (!tasksCollectionRef) return;

    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
        const assignedEmployees = new Set<string>();
        snapshot.forEach((doc) => {
          const task = doc.data() as Task;
          if (task.employeeName) {
            assignedEmployees.add(task.employeeName);
          }
        });
        setEmployeesWithTasks(assignedEmployees);
    }, (error) => {
        console.error("Error fetching tasks:", error);
    });
    
    return () => unsubscribe();
  }, [tasksCollectionRef]);

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication error.' });
      return;
    }
    const docRef = doc(firestore, `users/${user.uid}/employees`, employeeId);
    
    deleteDoc(docRef)
      .then(() => {
        toast({ title: 'Employee Deleted', description: 'The employee has been removed successfully.' });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
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

