
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paintbrush, DraftingCompass, Camera, Calculator, Banknote } from "lucide-react";
import Link from "next/link";

const teams = [
    { name: "Draftsperson", icon: DraftingCompass, href: "/schedules-by-designation#Draftsperson" },
    { name: "Architect", icon: Paintbrush, href: "/schedules-by-designation#Architect" },
    { name: "3D Visualizer", icon: Camera, href: "/schedules-by-designation#3D Visualizer" },
    { name: "BOQ Manager", icon: Calculator, href: "/schedules-by-designation#Quantity Surveyor" },
    { name: "Finance", icon: Banknote, href: "/schedules-by-designation#Finance Manager" },
];

export default function TeamDashboard() {
    return (
        <Card>
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
    );
}
