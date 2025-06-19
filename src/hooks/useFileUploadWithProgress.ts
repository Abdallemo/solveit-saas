
import { useState } from "react";

type ProgressMap = Record<string, number>;

export function useFileUploadWithProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});

  async function uploadFile(file: File,presignedUrl: string): Promise<void> 
  {

    return new Promise((resolve, reject) => {
        
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgress((prev) => ({
            ...prev,
            [file.name]: percent,
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(new Error("Upload failed"));
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(file);
    });
  }

  return { uploadFile, progress };
}
