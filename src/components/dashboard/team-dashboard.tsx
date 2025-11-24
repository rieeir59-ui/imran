
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
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';

const teams = [
  { name: 'Architects', icon: Paintbrush, href: '/schedules-by-designation#Architects' },
  { name: 'Software Engineers', icon: Code, href: '/schedules-by-designation#Software-Engineers' },
  { name: '3D Visualizer', icon: Camera, href: '/schedules-by-designation#3D-Visualizer' },
  { name: 'BOQ Manager', icon: Calculator, href: '/schedules-by-designation#Quantity-Surveyor' },
  { name: 'Finance', icon: Banknote, href: '/schedules-by-designation#Finance-Manager' },
];

const allEmployees = [
  'M Waqas',
  'M Jabbar',
  'Rana Mujahid',
  'Architect Sobia',
  'Architect Luqman Aslam',
  'Architect Asad',
  'Architect Haseeb',
  'Architect Khizar',
  'M Mohsin',
  'M Nouman',
];

const draftspersons = [
  { name: 'M Mujahid', href: '/weekly-schedule?employee=M%20Mujahid' },
  { name: 'M Jabbar', href: '/weekly-schedule?employee=M%20Jabbar' },
  { name: 'M Waqas', href: '/weekly-schedule?employee=M%20Waqas' },
];

const architects = [
    { name: 'Sobia Razzak', href: '/weekly-schedule?employee=Sobia%20Razzak' },
    { name: 'M Asad', href: '/weekly-schedule?employee=M%20Asad' },
    { name: 'M Haseeb', href: '/weekly-schedule?employee=M%20Haseeb' },
    { name: 'M Waleed Zahid', href: '/weekly-schedule?employee=M%20Waleed%20Zahid' },
    { name: 'M Khizar', href: '/weekly-schedule?employee=M%20Khizar' },
];

const visualizers = [{ name: 'M Mohsin', href: '/weekly-schedule?employee=M%20Mohsin' }];

const boqManagers = [{ name: 'M Nouman', href: '/weekly-schedule?employee=M%20Nouman' }];

const financeManagers = [{ name: 'M Waqas', href: '/weekly-schedule?employee=M%20Waqas' }];

const softwareEngineers = [
    { name: 'Imran Abbas', href: '/weekly-schedule?employee=Imran%20Abbas' },
    { name: 'Rabiya Eman', href: '/weekly-schedule?employee=Rabiya%20Eman' },
];

interface Task {
  employeeName: string;
}

export default function TeamDashboard() {
  const [employeesWithTasks, setEmployeesWithTasks] = useState<Set<string>>(new Set());
  const { user } = useUser();
  const firestore = useFirestore();

  const tasksCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/tasks`);
  }, [user, firestore]);

  useEffect(() => {
    if (!tasksCollectionRef) return;

    getDocs(tasksCollectionRef)
      .then((snapshot) => {
        const assignedEmployees = new Set<string>();
        snapshot.forEach((doc) => {
          const task = doc.data() as Task;
          assignedEmployees.add(task.employeeName);
        });
        setEmployeesWithTasks(assignedEmployees);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, [tasksCollectionRef]);

  const renderEmployeeCard = (employee: { name: string; href: string }) => {
    const hasTask = employeesWithTasks.has(employee.name);
    return (
      <Link href={employee.href} key={employee.name}>
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

  const AddEmployeeCard = ({href}: {href: string}) => (
    <Link href={href} passHref>
        <div className="p-4 rounded-lg border-dashed border-2 hover:bg-accent hover:border-solid transition-colors flex flex-col items-center justify-center h-full">
            <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-muted-foreground text-center">Add Employee</span>
        </div>
    </Link>
  );

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
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Architects Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {architects.map(renderEmployeeCard)}
          <AddEmployeeCard href="/weekly-schedule?designation=Architect" />
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Software Engineering Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {softwareEngineers.map(renderEmployeeCard)}
           <AddEmployeeCard href="/weekly-schedule?designation=Software%20Engineer" />
        </CardContent>
      </Card>
       <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>3D Visualizer Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {visualizers.map(renderEmployeeCard)}
          <AddEmployeeCard href="/weekly-schedule?designation=3D%20Visualizer" />
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>BOQ Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {boqManagers.map(renderEmployeeCard)}
           <AddEmployeeCard href="/weekly-schedule?designation=Quantity%20Surveyor" />
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Finance Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {financeManagers.map(renderEmployeeCard)}
          <AddEmployeeCard href="/weekly-schedule?designation=Finance%20Manager" />
        </CardContent>
      </Card>
    </div>
  );
}
