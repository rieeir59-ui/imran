'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, DraftingCompass, Lamp, LayoutList, Hammer, Zap, FileText, Wrench } from 'lucide-react';

const drawingCategories = [
    { title: 'Sample List of Drawings', href: '/sample-list-of-drawings', icon: FileText },
    { title: 'Structural Drawings', href: '/structural-drawings', icon: Hammer },
    { title: 'Plumbing Drawings', href: '/plumbing-drawings', icon: Wrench },
    { title: 'Electrification Drawings', href: '/electrification-drawings', icon: Zap },
    { title: 'Shop Drawings Sample Record', href: '/shop-drawings-record', icon: LayoutList },
    { title: 'Lighting Drawings', href: '/lighting-drawings', icon: Lamp },
];

export default function DrawingsPage() {
    return (
        <main className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <Button variant="outline" asChild>
                    <Link href="/bank"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>List of Drawings</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drawingCategories.map((category) => (
                        <Link href={category.href} key={category.href}>
                            <div className="p-6 rounded-lg border hover:bg-accent transition-colors flex items-center gap-4 h-full">
                                <category.icon className="h-8 w-8 text-primary" />
                                <div>
                                    <h3 className="text-lg font-semibold">{category.title}</h3>
                                </div>
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </main>
    );
}
