"use client";

import { useRef, useState } from "react";
import { IKUpload, ImageKitProvider, IKImage, IKVideo } from "imagekitio-next";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;

const authenticator = async () => {
  try {
    const response = await fetch("/api/auth/imagekit");

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return { token, expire, signature };
  } catch (error: any) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

interface Props {
  type?: "image" | "video";
  accept?: string;
  placeholder?: string;
  folder?: string;
  variant?: "dark" | "light";
  onFileChange?: (filePath: string) => void;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  value?: string;
  name?: string;
}

const FileUpload = ({
  type = "image",
  accept,
  placeholder = "",
  folder = "uploads",
  variant = "light",
  onFileChange,
  onChange,
  onBlur,
  value,
}: Props) => {
  const ikUploadRef = useRef<any>(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const [progress, setProgress] = useState(0);

  const styles = {
    button:
      variant === "dark"
        ? "bg-dark-300 text-light-100"
        : "bg-light-600 border border-gray-100 text-dark-400",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };

  const defaultAccept = type === "image" ? "image/*" : "video/*";

  const onError = (error: any) => {
    console.error(error);
    toast.error(`${type} upload failed`, {
      description:
        error?.message ||
        `Unable to complete the ${type} upload. Please try again.`,
    });
    setProgress(0);
  };

  const onValidate = (file: File) => {
    if (type === "image") {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Please upload a file that is less than 20 MB in size");
        return false;
      }
    } else if (type === "video") {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Please upload a file that is less than 50 MB in size");
        return false;
      }
    }

    return true;
  };

  const handleSuccess = (res: any) => {
    const filePath = res.filePath;

    setFile({ filePath });
    setProgress(100);

    if (onChange) {
      onChange(filePath);
    }

    if (onFileChange) {
      onFileChange(filePath);
    }

    toast.success(
      `${type === "image" ? "Image" : "Video"} uploaded successfully`
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const isValid = onValidate(selectedFile);
    if (!isValid) {
      if (ikUploadRef.current) {
        ikUploadRef.current.value = "";
      }
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    setProgress(0);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (ikUploadRef.current) {
      ikUploadRef.current.click();
    }
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        className="hidden"
        ref={ikUploadRef}
        folder={folder}
        useUniqueFileName={true}
        onError={onError}
        onSuccess={handleSuccess}
        onUploadStart={() => setProgress(0)}
        onUploadProgress={({ loaded, total }) => {
          if (!total) return;
          const percent = Math.round((loaded / total) * 100);
          setProgress(percent);
        }}
        accept={accept ?? defaultAccept}
        validateFile={onValidate}
        onChange={handleFileChange}
      />

      <button
        type="button"
        className={cn("upload-btn", styles.button)}
        onClick={handleButtonClick}
        onBlur={onBlur}
      >
        <img
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />

        <div className="flex flex-col">
          <p className={cn("text-base", styles.placeholder)}>{placeholder}</p>
          {file && (
            <p className={cn("upload-filename", styles.text)}>
              {file.filePath}
            </p>
          )}
          {progress > 0 && progress < 100 && (
            <span className="text-sm text-dark-100">{progress}%</span>
          )}
        </div>
      </button>

      {progress > 0 && progress != 100 && (
        <div className="mt-3 w-full rounded-full bg-green-200">
          <div
            className="progress rounded-full bg-green-500 py-1 text-center text-xs font-semibold text-white"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}

      {file &&
        (type === "image" ? (
          <IKImage
            alt={file.filePath}
            path={file.filePath}
            width={500}
            height={300}
            className="mt-4 rounded-lg object-cover"
          />
        ) : type === "video" ? (
          <IKVideo
            path={file.filePath}
            controls
            className="mt-4 h-96 w-full rounded-xl object-cover"
          />
        ) : null)}
    </ImageKitProvider>
  );
};

export default FileUpload;
