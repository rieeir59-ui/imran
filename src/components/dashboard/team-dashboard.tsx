
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paintbrush, DraftingCompass, Camera, Calculator, Banknote, User } from "lucide-react";
import Link from "next/link";

const teams = [
    { name: "Architect", icon: Paintbrush, href: "/schedules-by-designation#Architect" },
    { name: "3D Visualizer", icon: Camera, href: "/schedules-by-designation#3D-Visualizer" },
    { name: "BOQ Manager", icon: Calculator, href: "/schedules-by-designation#Quantity-Surveyor" },
    { name: "Finance", icon: Banknote, href: "/schedules-by-designation#Finance-Manager" },
];

const draftspersons = [
    { name: "M Waqas", href: "/weekly-schedule?employee=M%20Waqas" },
    { name: "M Jabbar", href: "/weekly-schedule?employee=M%20Jabbar" },
    { name: "Rana Mujahid", href: "/weekly-schedule?employee=Rana%20Mujahid" },
]

const architects = [
    { name: "Architect Sobia", href: "/weekly-schedule?employee=Architect%20Sobia" },
    { name: "Architect Luqman Aslam", href: "/weekly-schedule?employee=Architect%20Luqman%20Aslam" },
    { name: "Architect Asad", href: "/weekly-schedule?employee=Architect%20Asad" },
    { name: "Architect Haseeb", href: "/weekly-schedule?employee=Architect%20Haseeb" },
    { name: "Architect Khizar", href: "/weekly-schedule?employee=Architect%20Khizar" },
];

const visualizers = [
    { name: "M Mohsin", href: "/weekly-schedule?employee=M%20Mohsin" },
];

const boqManagers = [
    { name: "M Nouman", href: "/weekly-schedule?employee=M%20Nouman" },
];

const financeManagers = [
    { name: "M Waqas", href: "/weekly-schedule?employee=M%20Waqas" },
];

export default function TeamDashboard() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Team Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                     {architects.map((person) => (
                        <Link href={person.href} key={person.name}>
                            <div className="p-4 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center justify-center h-full">
                                <User className="h-8 w-8 text-primary mb-2" />
                                <span className="font-semibold text-center">{person.name}</span>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Drafting Team</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                     {draftspersons.map((person) => (
                        <Link href={person.href} key={person.name}>
                            <div className="p-4 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center justify-center h-full">
                                <User className="h-8 w-8 text-primary mb-2" />
                                <span className="font-semibold text-center">{person.name}</span>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>3D Visualizer Team</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                     {visualizers.map((person) => (
                        <Link href={person.href} key={person.name}>
                            <div className="p-4 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center justify-center h-full">
                                <User className="h-8 w-8 text-primary mb-2" />
                                <span className="font-semibold text-center">{person.name}</span>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>BOQ Team</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {boqManagers.map((person) => (
                        <Link href={person.href} key={person.name}>
                            <div className="p-4 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center justify-center h-full">
                                <User className="h-8 w-8 text-primary mb-2" />
                                <span className="font-semibold text-center">{person.name}</span>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Finance Team</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {financeManagers.map((person) => (
                        <Link href={person.href} key={person.name}>
                            <div className="p-4 rounded-lg border hover:bg-accent transition-colors flex flex-col items-center justify-center h-full">
                                <User className="h-8 w-8 text-primary mb-2" />
                                <span className="font-semibold text-center">{person.name}</span>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
