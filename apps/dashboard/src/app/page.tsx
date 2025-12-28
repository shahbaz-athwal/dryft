"use client";

import { useUploadFiles } from "@better-upload/client";
import { toast } from "sonner";

import { UploadDropzone } from "@/components/upload-dropzone";

export default function Home() {
  const { control, uploadedFiles, isPending, averageProgress, error } =
    useUploadFiles({
      route: "images",
      api: "http://localhost:4000/upload",
      onUploadBegin: ({ files }) => {
        toast.info(`Uploading ${files.length} file(s)...`);
      },
      onUploadComplete: ({ files }) => {
        toast.success(`Successfully uploaded ${files.length} file(s)!`);
      },
      onError: (err) => {
        toast.error(`Upload failed: ${err.message}`);
      },
    });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-bold text-2xl">Upload Test</h1>

      <UploadDropzone
        accept="image/*"
        control={control}
        description={{
          maxFiles: 4,
          maxFileSize: "2MB",
          fileTypes: "JPEG, PNG, GIF",
        }}
      />

      {isPending && (
        <div className="flex items-center gap-2">
          <span>Uploading... {Math.round(averageProgress * 100)}%</span>
        </div>
      )}

      {error && <p className="text-destructive">Error: {error.message}</p>}

      {uploadedFiles.length > 0 && (
        <div className="w-full max-w-md space-y-2">
          <h2 className="font-semibold">Uploaded Files:</h2>
          <ul className="space-y-1 text-sm">
            {uploadedFiles.map((file) => (
              <li className="truncate" key={file.objectInfo.key}>
                ✓ {file.name} → {file.objectInfo.key}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
