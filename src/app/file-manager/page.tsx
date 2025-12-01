
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UploadCloud, File as FileIcon, MoreVertical, Edit, Trash2, Save, Loader2, PlusCircle, ArrowLeft, Terminal, Download, FileDown } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useUser, useStorage, useAuth, useFirebase } from '@/firebase';
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
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';

interface UploadedFile {
  id?: string;
  fileName: string;
  size: number;
  type: string;
  url: string;
  storagePath: string; // Firebase storage full path
  uploadedBy?: string;
  uploadedByEmail?: string;
  uploadedAt?: any;
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
  const { storage, firestore, auth, googleProvider } = useFirebase();

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: "Sign-in failed" });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const fetchFiles = useCallback(async () => {
    if (!user || !firestore) return;
    setIsLoading(true);
    const q = query(collection(firestore, "files"), where("uploadedBy", "==", user.uid));
    
    try {
        const querySnapshot = await getDocs(q);
        const userFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UploadedFile));
        
        // Sort files on the client side
        userFiles.sort((a, b) => {
            const dateA = a.uploadedAt?.toDate ? a.uploadedAt.toDate() : new Date(0);
            const dateB = b.uploadedAt?.toDate ? b.uploadedAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });

        setFiles(userFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        variant: "destructive",
        title: "Error fetching files",
        description: "Could not load your files from Firestore."
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, firestore, toast]);

  useEffect(() => {
    if (user && firestore) {
        fetchFiles();
    }
  }, [user, firestore, fetchFiles]);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!user || !storage) {
        toast({ variant: "destructive", title: "Upload failed", description: "You must be signed in to upload files."});
        return;
    }

    setUploadProgress(acceptedFiles.map(file => ({ fileName: file.name, progress: 0 })));

    acceptedFiles.forEach(file => {
      const path = `projects/general/uploads/${user.uid}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => prev.map(p => p.fileName === file.name ? { ...p, progress } : p));
        },
        (error: FirebaseStorageError) => {
          console.error("Upload error:", error.code, error.message);
          let description = `Could not upload ${file.name}. Reason: ${error.message}`;
          toast({
              variant: "destructive",
              title: "Upload Error",
              description: description,
          });
          setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
        },
        async () => {
           const url = await getDownloadURL(uploadTask.snapshot.ref);
           
           await addDoc(collection(firestore, "files"), {
                projectId: "general",
                fileName: file.name,
                storagePath: path,
                url,
                size: file.size,
                type: file.type,
                uploadedBy: user.uid,
                uploadedByEmail: user.email || null,
                uploadedAt: serverTimestamp(),
            });
           
           setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
           toast({
               title: 'File Uploaded',
               description: `${file.name} has been successfully saved.`,
           });
           fetchFiles();
        }
      )
    });
  }, [user, storage, firestore, toast, fetchFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = async (file: UploadedFile) => {
    if (!storage || !firestore || !file.id) return;
    const fileRef = ref(storage, file.storagePath);
    try {
        await deleteObject(fileRef);
        await deleteDoc(doc(firestore, "files", file.id));
        setFiles(files.filter(f => f.storagePath !== file.storagePath));
        toast({
            title: "File Deleted",
            description: `${file.fileName} has been permanently deleted.`,
            variant: "destructive"
        })
    } catch(error) {
        console.error("Error deleting file:", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: `Could not delete ${file.fileName}.`
        })
    }
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

  if (isUserLoading) {
    return (
        <div className="flex h-full w-full items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Authenticating...</p>
        </div>
    );
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>File Manager</CardTitle>
          <CardDescription>Upload, view, and manage your project files. Files are stored securely in Firebase Storage.</CardDescription>
            {!user ? (
                <Button onClick={signIn} className="mt-4">Sign in with Google</Button>
            ) : (
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-muted-foreground">Signed in as: {user.email}</p>
                    <Button onClick={logout} variant="outline" size="sm">Sign out</Button>
                </div>
            )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} disabled={!user}/>
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-10 w-10" />
                {isDragActive ? (
                <p>Drop the files here ...</p>
                ) : (
                <p>{user ? "Drag 'n' drop some files here, or click to select files" : "Please sign in to upload files"}</p>
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
                                <TableRow key={uploadedFile.storagePath}>
                                    <TableCell><FileIcon className="h-5 w-5 text-muted-foreground" /></TableCell>
                                    <TableCell className="font-medium">
                                        <button onClick={() => handleFileClick(uploadedFile)} className="hover:underline text-primary text-left">
                                            {uploadedFile.fileName}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{uploadedFile.type}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{formatFileSize(uploadedFile.size)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => window.open(uploadedFile.url, '_blank')}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    <span>Download</span>
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
