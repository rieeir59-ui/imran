
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
} from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useState, useEffect } from 'react';

const teams = [
  { name: 'Architect', icon: Paintbrush, href: '/schedules-by-designation#Architect' },
  { name: 'Draftsperson', icon: DraftingCompass, href: '/schedules-by-designation#Draftsperson' },
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
  { name: 'M Waqas', href: '/weekly-schedule?employee=M%20Waqas' },
  { name: 'M Jabbar', href: '/weekly-schedule?employee=M%20Jabbar' },
  { name: 'Rana Mujahid', href: '/weekly-schedule?employee=Rana%20Mujahid' },
];

const architects = [
  { name: 'Architect Sobia', href: '/weekly-schedule?employee=Architect%20Sobia' },
  { name: 'Architect Luqman Aslam', href: '/weekly-schedule?employee=Architect%20Luqman%20Aslam' },
  { name: 'Architect Asad', href: '/weekly-schedule?employee=Architect%20Asad' },
  { name: 'Architect Haseeb', href: '/weekly-schedule?employee=Architect%20Haseeb' },
  { name: 'Architect Khizar', href: '/weekly-schedule?employee=Architect%20Khizar' },
];

const visualizers = [{ name: 'M Mohsin', href: '/weekly-schedule?employee=M%20Mohsin' }];

const boqManagers = [{ name: 'M Nouman', href: '/weekly-schedule?employee=M%20Nouman' }];

const financeManagers = [{ name: 'M Waqas', href: '/weekly-schedule?employee=M%20Waqas' }];

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Team Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Architect Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {architects.map(renderEmployeeCard)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Drafting Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {draftspersons.map(renderEmployeeCard)}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>3D Visualizer Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {visualizers.map(renderEmployeeCard)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>BOQ Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {boqManagers.map(renderEmployeeCard)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Finance Team</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {financeManagers.map(renderEmployeeCard)}
        </CardContent>
      </Card>
    </div>
  );
}
