
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, File as FileIcon, MoreVertical, Edit, Trash2, Save, Loader2, PlusCircle, ArrowLeft, Terminal, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useUser, useStorage, useAuth } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata, deleteObject, UploadTaskSnapshot, FirebaseStorageError } from 'firebase/storage';
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  fullPath: string; // Firebase storage full path
  content?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
}

export default function FileManagerPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeFile, setActiveFile] = useState<UploadedFile | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const { user, isUserLoading } = useUser();
  const storage = useStorage();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const fetchFiles = useCallback(async () => {
    if (!user || !storage) return;
    setIsLoading(true);
    const userFilesRef = ref(storage, `users/${user.uid}/uploads`);
    try {
      const res = await listAll(userFilesRef);
      const filePromises = res.items.map(async (itemRef) => {
        const metadata = await getMetadata(itemRef);
        const url = await getDownloadURL(itemRef);
        return {
          name: metadata.name,
          size: metadata.size,
          type: metadata.contentType || 'unknown',
          url: url,
          fullPath: itemRef.fullPath,
        };
      });
      const userFiles = await Promise.all(filePromises);
      setFiles(userFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        variant: "destructive",
        title: "Error fetching files",
        description: "Could not load your files from storage."
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, storage, toast]);

  useEffect(() => {
    if (user && storage) {
        fetchFiles();
    }
  }, [user, storage, fetchFiles]);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!user || !storage) {
        toast({ variant: "destructive", title: "Upload failed", description: "You must be logged in to upload files."});
        return;
    }

    setUploadProgress(acceptedFiles.map(file => ({ fileName: file.name, progress: 0 })));

    acceptedFiles.forEach(file => {
      const fileRef = ref(storage, `users/${user.uid}/uploads/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on('state_changed', 
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => prev.map(p => p.fileName === file.name ? { ...p, progress } : p));
        },
        (error: FirebaseStorageError) => {
          console.error("Upload error:", error.code, error.message);
          let description = `Could not upload ${file.name}. Reason: ${error.message}`;
          if (error.code === 'storage/unauthorized') {
            description = "You do not have permission to upload files. Please check your storage rules and ensure you are logged in."
          } else if (error.code === 'storage/retry-limit-exceeded') {
            description = "Network connection is unstable or the file is too large. Please check your connection and try again.";
          }
          toast({
              variant: "destructive",
              title: "Upload Error",
              description: description,
          });
          setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
        },
        async () => {
           const url = await getDownloadURL(uploadTask.snapshot.ref);
           const metadata = await getMetadata(uploadTask.snapshot.ref);
           const newFile: UploadedFile = {
             name: metadata.name,
             size: metadata.size,
             type: metadata.contentType || 'unknown',
             url: url,
             fullPath: uploadTask.snapshot.ref.fullPath,
           };
           
           setFiles((prevFiles) => [...prevFiles, newFile]);
           setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
           toast({
               title: 'File Uploaded',
               description: `${file.name} has been successfully saved.`,
           });
        }
      )
    });
  }, [user, storage, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = async (file: UploadedFile) => {
    if (!storage) return;
    const fileRef = ref(storage, file.fullPath);
    try {
        await deleteObject(fileRef);
        setFiles(files.filter(f => f.fullPath !== file.fullPath));
        toast({
            title: "File Deleted",
            description: `${file.name} has been permanently deleted.`,
            variant: "destructive"
        })
    } catch(error) {
        console.error("Error deleting file:", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: `Could not delete ${file.name}.`
        })
    }
  }
  
  const handleEdit = (file: UploadedFile) => {
    setEditingFile(file.fullPath);
    setNewFileName(file.name);
  }

  const handleSaveRename = (fileUrl: string) => {
    setFiles(files.map(f => f.fullPath === fileUrl ? { ...f, name: newFileName } : f));
    setEditingFile(null);
    toast({
      title: "File Renamed (Locally)",
      description: `The file has been renamed to ${newFileName}. This is a local change.`,
    });
  }
  
  const handleFileClick = async (file: UploadedFile) => {
    if (file.type.startsWith('text/')) {
        try {
            const response = await fetch(file.url);
            const textContent = await response.text();
            setActiveFile(file);
            setEditorContent(textContent);
        } catch (error) {
            console.error("Error fetching text file content:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not open text file."});
        }
    } else {
        window.open(file.url, '_blank');
    }
  }
  
  const handleSaveTextFile = async () => {
    if (!activeFile || !storage || !user) return;
    setIsSaving(true);
    const fileRef = ref(storage, activeFile.fullPath);
    const newContentBlob = new Blob([editorContent], { type: 'text/plain' });

    try {
        await uploadBytesResumable(fileRef, newContentBlob);
        await fetchFiles(); // Re-fetch to update URL and metadata
        setActiveFile(null);
        toast({
            title: "Text File Saved",
            description: `${activeFile.name} has been updated in Firebase Storage.`,
        });
    } catch (error) {
        console.error("Error saving text file:", error);
        toast({ variant: 'destructive', title: "Save failed", description: "Could not save changes to the file."})
    } finally {
        setIsSaving(false);
    }
  }

  const createNewTextFile = async () => {
    if (!user || !storage) return;

    const fileNumber = files.filter(f => f.name.startsWith('new-text-file')).length + 1;
    const fileName = `new-text-file-${fileNumber}.txt`;
    const fileRef = ref(storage, `users/${user.uid}/uploads/${fileName}`);
    const newContentBlob = new Blob([''], { type: 'text/plain' });

    try {
        const uploadTask = await uploadBytesResumable(fileRef, newContentBlob);
        const url = await getDownloadURL(uploadTask.ref);
        const metadata = await getMetadata(uploadTask.ref);
        const newFile: UploadedFile = {
          name: metadata.name,
          size: metadata.size,
          type: metadata.contentType || 'unknown',
          url: url,
          fullPath: uploadTask.ref.fullPath,
        };
        setFiles(prev => [...prev, newFile]);
        toast({ title: 'New Text File Created', description: `${fileName} has been saved.` });
    } catch (error) {
        console.error("Error creating new text file:", error);
        toast({ variant: 'destructive', title: "Creation Failed", description: "Could not create new text file."});
    }
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
                           <Button onClick={() => window.open(activeFile.url, '_blank')} variant="secondary"><Download className="mr-2"/> Download</Button>
                           <Button onClick={handleSaveTextFile} disabled={isSaving}>
                             {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>}
                             Save and Close
                           </Button>
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

  if (isUserLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Authenticating...</p>
        </div>
    );
  }

  if (!user && !isUserLoading) {
      return (
        <main className="p-4 md:p-6 lg:p-8">
         <Card>
           <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
           <CardContent>
             <Alert variant="destructive">
               <Terminal className="h-4 w-4" />
               <AlertTitle>Unable to Authenticate</AlertTitle>
               <AlertDescription>We could not sign you in. Please refresh the page to try again.</AlertDescription>
             </Alert>
           </CardContent>
         </Card>
       </main>
     )
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>File Manager</CardTitle>
          <CardDescription>Upload, view, and manage your project files. Files are stored securely in Firebase Storage.</CardDescription>
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
          
          {uploadProgress.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploads</h4>
              {uploadProgress.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{item.fileName}</span>
                    <span>{Math.round(item.progress)}%</span>
                  </div>
                  <Progress value={item.progress} />
                </div>
              ))}
            </div>
          )}

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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    <Loader2 className="mx-auto animate-spin" />
                                    <p>Loading files from storage...</p>
                                </TableCell>
                            </TableRow>
                        ) : files.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No files uploaded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            files.map((uploadedFile) => (
                                <TableRow key={uploadedFile.fullPath}>
                                    <TableCell><FileIcon className="h-5 w-5 text-muted-foreground" /></TableCell>
                                    <TableCell className="font-medium">
                                        {editingFile === uploadedFile.fullPath ? (
                                            <div className="flex items-center gap-2">
                                                <Input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(uploadedFile.fullPath)} className="h-8"/>
                                                <Button size="icon" className="h-8 w-8" onClick={() => handleSaveRename(uploadedFile.fullPath)}><Save className="h-4 w-4"/></Button>
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
                                                <DropdownMenuItem onClick={() => handleEdit(uploadedFile)} disabled>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Rename (coming soon)</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => removeFile(uploadedFile)} className="text-destructive">
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
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
