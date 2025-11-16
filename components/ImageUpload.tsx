"use client";

import { IKImage, ImageKitProvider, IKUpload } from "imagekitio-next";
import { useRef } from "react";
import { toast } from "sonner";

// Only use public environment variables on the client side
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

interface ImageUploadProps {
  onChange?: (value: string) => void;
  onBlur?: () => void;
  value?: string;
  name?: string;
}

const ImageUpload = ({ onChange, onBlur, value, name }: ImageUploadProps) => {
  const ikUploadRef = useRef<any>(null);

  const onError = (error: any) => {
    console.log(error);
    toast.error("Failed to upload image");
  };

  const onSuccess = (res: any) => {
    const filePath = res.filePath;
    if (onChange) {
      onChange(filePath);
    }
    toast.success("Image uploaded successfully");
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
        onError={onError}
        onSuccess={onSuccess}
        fileName={`${name || "upload"}-${Date.now()}.png`}
      />

      <button
        type="button"
        className="upload-btn"
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

        <p className="text-base text-light-100">Upload a File</p>

        {value && <p className="upload-filename">{value}</p>}
      </button>

      {value && <IKImage alt={value} path={value} width={500} height={500} />}
    </ImageKitProvider>
  );
};

export default ImageUpload;
