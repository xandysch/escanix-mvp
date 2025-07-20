import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, Image } from "lucide-react";

interface FileUploadProps {
  accept: string;
  onUpload: (url: string) => void;
  uploadUrl: string;
  currentFile?: string;
  className?: string;
}

export function FileUpload({ accept, onUpload, uploadUrl, currentFile, className }: FileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append(uploadUrl.includes('logo') ? 'logo' : 'menu', file);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      onUpload(data.url);
      toast({
        title: "Upload realizado",
        description: "Arquivo enviado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar arquivo. Verifique se está logado e tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      uploadMutation.mutate(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage = accept.includes('image');
  const isPdf = accept.includes('pdf');

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {currentFile ? (
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isImage && currentFile ? (
                <img 
                  src={currentFile} 
                  alt="Uploaded file" 
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {isPdf ? (
                    <File className="w-6 h-6 text-red-500" />
                  ) : (
                    <Image className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Arquivo carregado
                </p>
                <p className="text-xs text-gray-500">
                  Clique em "Alterar" para substituir
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                Alterar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeFile}
                disabled={uploadMutation.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadMutation.isPending ? (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-purple-600 animate-pulse" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enviando arquivo...</p>
                <Progress value={50} className="w-32 mx-auto mt-2" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Arraste seu arquivo ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isImage && "Imagens até 5MB"}
                  {isPdf && "PDF até 5MB"}
                  {accept.includes('image') && accept.includes('pdf') && "Imagens ou PDF até 5MB"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
