
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
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

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

export default function TeamDashboard() {
  const [employeesByDesignation, setEmployeesByDesignation] = useState<Record<string, Employee[]>>({
    'Architect': [
      { id: '1', name: 'Sobia', designation: 'Architect' },
      { id: '2', name: 'Luqman Aslam', designation: 'Architect' },
      { id: '3', name: 'M. Asad', designation: 'Architect' },
      { id: '4', name: 'M. Haseeb', designation: 'Architect' },
      { id: '5', name: 'M. Waleed Zahid', designation: 'Architect' },
      { id: '6', name: 'M. Khizar', designation: 'Architect' },
    ]
  });
  const [employeesWithTasks, setEmployeesWithTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();

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
        const groupedByDesignation = fetchedEmployees.reduce((acc, employee) => {
            const { designation } = employee;
            if (!acc[designation]) {
                acc[designation] = [];
            }
            acc[designation].push(employee);
            return acc;
        }, {} as Record<string, Employee[]>);
        
        // Merge with initial architects
        groupedByDesignation['Architect'] = [
            ...(employeesByDesignation['Architect'] || []),
            ...(groupedByDesignation['Architect'] || [])
        ].filter((employee, index, self) => 
            index === self.findIndex((e) => e.name === employee.name)
        );

        setEmployeesByDesignation(groupedByDesignation);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [employeesCollectionRef]);

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

  const renderEmployeeCard = (employee: { name: string; designation: string }) => {
    const hasTask = employeesWithTasks.has(employee.name);
    const href = `/weekly-schedule?employee=${encodeURIComponent(employee.name)}&designation=${encodeURIComponent(employee.designation)}`;
    return (
      <Link href={href} key={employee.name}>
        <div className="p-4 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center justify-center h-full relative">
          <User className="h-8 w-8 text-primary mb-2" />
          <span className="font-semibold text-center">{employee.name}</span>
          {hasTask ? (
            <CheckCircle className="h-5 w-5 text-green-500 absolute top-2 right-2" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 absolute top-2 right-2" />
          )}
        </div>
      </Link>
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
                {isLoading && team.designation !== 'Architect' ? (
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
