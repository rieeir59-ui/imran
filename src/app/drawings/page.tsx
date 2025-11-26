'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  DraftingCompass,
  Lamp,
  LayoutList,
  Hammer,
  Zap,
  FileText,
  Building,
  Wrench,
  PlusCircle,
  Loader2,
  Save,
  Image,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DRAWING_CATEGORIES_DOC_ID = 'drawing-categories';

const initialDrawingCategories = [
  { title: 'Architectural Drawings', href: '/architectural-drawings', icon: 'Building' },
  { title: 'Sample List of Drawings', href: '/sample-list-of-drawings', icon: 'FileText' },
  { title: 'Structural Drawings', href: '/structural-drawings', icon: 'Hammer' },
  { title: 'Plumbing Drawings', href: '/plumbing-drawings', icon: 'Wrench' },
  { title: 'Electrification Drawings', href: '/electrification-drawings', icon: 'Zap' },
  { title: 'Shop Drawings Sample Record', href: '/shop-drawings-record', icon: 'LayoutList' },
  { title: 'Lighting Drawings', href: '/lighting-drawings', icon: 'Lamp' },
];

const icons: { [key: string]: React.FC<any> } = {
  Building,
  FileText,
  Hammer,
  Wrench,
  Zap,
  LayoutList,
  Lamp,
  DraftingCompass,
  Image
};

export default function DrawingsPage() {
  const [categories, setCategories] = useState(initialDrawingCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const docRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/drawingSchedules/${DRAWING_CATEGORIES_DOC_ID}`);
  }, [user, firestore]);

  useEffect(() => {
    if (!docRef) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists() && docSnap.data().categories) {
          setCategories(docSnap.data().categories);
        } else {
          setCategories(initialDrawingCategories);
        }
      })
      .finally(() => setIsLoading(false));
  }, [docRef]);

  const handleAddCategory = async () => {
    if (!newCategoryTitle) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a title for the new category.' });
      return;
    }
    const newHref = `/${newCategoryTitle.toLowerCase().replace(/\s+/g, '-')}`;
    const newCategory = { title: newCategoryTitle, href: newHref, icon: 'Image' };
    
    const updatedCategories = [...categories, newCategory];
    
    setIsSaving(true);
    if(docRef) {
        await setDoc(docRef, { categories: updatedCategories }, { merge: true });
    }
    
    setCategories(updatedCategories);
    setIsSaving(false);
    setIsDialogOpen(false);
    setNewCategoryTitle('');
    toast({ title: 'Success', description: 'New drawing category added.' });
  };

  if (isLoading) {
    return (
      <main className="p-4 md:p-6 lg:p-8 flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </main>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/bank">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bank Forms
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>List of Drawings</CardTitle>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Drawing
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = icons[category.icon] || Image;
            return (
              <Link href={category.href} key={category.href}>
                <div className="p-6 rounded-lg border hover:bg-accent transition-colors flex items-center gap-4 h-full">
                  <Icon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold">{category.title}</h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Drawing Category</DialogTitle>
            <DialogDescription>
              Enter a title for the new drawing category. A page will be created for it automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-title">Category Title</Label>
              <Input
                id="category-title"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                placeholder="e.g., HVAC Drawings"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
