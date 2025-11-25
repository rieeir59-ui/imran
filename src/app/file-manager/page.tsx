
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, File as FileIcon, MoreVertical, Edit, Trash2, Save, Loader2, PlusCircle, ArrowLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from '@/components/ui/textarea';

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  content?: string; // For text files
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeFile, setActiveFile] = useState<UploadedFile | null>(null);
  const [editorContent, setEditorContent] = useState('');


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);

    toast({
      title: 'Files Uploaded',
      description: `${newFiles.length} file(s) have been added.`,
    });
  }, [toast]);
  
  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
        files.forEach(file => {
          if (file.url.startsWith('blob:')) {
            URL.revokeObjectURL(file.url)
          }
        });
    }
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (fileUrl: string) => {
    const fileToRemove = files.find(f => f.url === fileUrl);
    if(fileToRemove) {
        if (fileToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(fileUrl);
        }
        setFiles(files.filter(f => f.url !== fileUrl));
        toast({
            title: "File Removed",
            description: `${fileToRemove.name} has been removed from the list.`,
            variant: "destructive"
        })
    }
  }
  
  const handleEdit = (file: UploadedFile) => {
    setEditingFile(file.url);
    setNewFileName(file.name);
  }

  const handleSaveRename = (fileUrl: string) => {
    setFiles(files.map(f => f.url === fileUrl ? { ...f, name: newFileName } : f));
    setEditingFile(null);
    toast({
      title: "File Renamed",
      description: `The file has been renamed to ${newFileName}.`,
    });
  }

  const handleSaveAll = () => {
    setIsSaving(true);
    // Simulate a save operation
    setTimeout(() => {
        setIsSaving(false);
        toast({
            title: "Files Saved",
            description: "Your files have been successfully saved."
        });
    }, 1500);
  }
  
  const handleFileClick = (file: UploadedFile) => {
    if (file.type === 'text/plain') {
        setActiveFile(file);
        setEditorContent(file.content || '');
    } else {
        window.open(file.url, '_blank');
    }
  }
  
  const handleSaveTextFile = () => {
    if (!activeFile) return;
    const updatedFile = { ...activeFile, content: editorContent, size: new Blob([editorContent]).size };
    setFiles(files.map(f => f.url === activeFile.url ? updatedFile : f));
    setActiveFile(null);
    toast({
        title: "Text File Saved",
        description: `${activeFile.name} has been updated.`,
    });
  }

  const createNewTextFile = () => {
    const fileNumber = files.filter(f => f.name.startsWith('new-text-file')).length + 1;
    const newFile: UploadedFile = {
        name: `new-text-file-${fileNumber}.txt`,
        type: 'text/plain',
        content: '',
        size: 0,
        url: `text-file-${Date.now()}`,
        file: new File([''], `new-text-file-${fileNumber}.txt`, {type: 'text/plain'})
    };
    setFiles(prev => [newFile, ...prev]);
    setActiveFile(newFile);
    setEditorContent('');
    toast({ title: 'New Text File Created' });
  }

  if (activeFile) {
    return (
        <main className="p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Editing: {activeFile.name}</CardTitle>
                        <div className="flex gap-2">
                           <Button variant="outline" onClick={() => setActiveFile(null)}><ArrowLeft className="mr-2"/> Back to Files</Button>
                           <Button onClick={handleSaveTextFile}><Save className="mr-2"/> Save and Close</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        className="h-[60vh] font-mono"
                        placeholder="Start writing your text file here..."
                    />
                </CardContent>
            </Card>
        </main>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>File Manager</CardTitle>
          <CardDescription>Upload, view, and manage your project files.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-10 w-10" />
                {isDragActive ? (
                <p>Drop the files here ...</p>
                ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
                )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={createNewTextFile}><PlusCircle className="mr-2"/> Create New Text File</Button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Size</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No files uploaded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            files.map((uploadedFile) => (
                                <TableRow key={uploadedFile.url}>
                                    <TableCell><FileIcon className="h-5 w-5 text-muted-foreground" /></TableCell>
                                    <TableCell className="font-medium">
                                        {editingFile === uploadedFile.url ? (
                                            <div className="flex items-center gap-2">
                                                <Input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(uploadedFile.url)} className="h-8"/>
                                                <Button size="icon" className="h-8 w-8" onClick={() => handleSaveRename(uploadedFile.url)}><Save className="h-4 w-4"/></Button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleFileClick(uploadedFile)} className="hover:underline text-primary text-left">
                                                {uploadedFile.name}
                                            </button>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{uploadedFile.type}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{formatFileSize(uploadedFile.size)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={editingFile !== null}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleEdit(uploadedFile)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Rename</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => removeFile(uploadedFile.url)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
             <div className="flex justify-end mt-4">
                <Button onClick={handleSaveAll} disabled={files.length === 0 || isSaving}>
                    {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <Save className="mr-2"/>}
                    {isSaving ? 'Saving...' : 'Save All Files'}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
