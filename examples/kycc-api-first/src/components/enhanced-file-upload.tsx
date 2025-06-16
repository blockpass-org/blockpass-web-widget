"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Camera, X, FileImage } from "lucide-react";

interface EnhancedFileUploadProps {
  label: string;
  description?: string;
  onFileUpload: (file: File) => void;
  uploadedFile?: { value_base64: string; mime_type: string };
  accept?: string;
  id: string;
  onRemoveFile: () => void;
}

export function EnhancedFileUpload({
  label,
  description,
  onFileUpload,
  uploadedFile,
  accept = "image/jpeg,image/png",
  id,
  onRemoveFile,
}: EnhancedFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        alert("Please upload only JPEG or PNG images");
        return;
      }
      onFileUpload(file);
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const startCamera = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera if available
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
      setIsCapturing(false);
    }
  };

  const capturePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `${id}-capture.jpg`, {
                type: "image/jpeg",
              });
              handleFileSelect(file);
              stopCamera();
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.preventDefault();
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemoveFile();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {!isCapturing ? (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : uploadedFile
              ? "border-green-500 bg-green-50"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            {uploadedFile ? (
              <div className="space-y-2">
                <img
                  src={`data:${uploadedFile.mime_type};base64,${uploadedFile.value_base64}`}
                  alt="Uploaded file thumbnail"
                  className="h-24 w-24 object-cover rounded-md mx-auto"
                />
                <p className="text-sm font-medium text-green-600">
                  ✓ File uploaded successfully
                </p>
                <p className="text-xs text-muted-foreground">
                  Type: {uploadedFile.mime_type}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPEG and PNG files
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                  <Button type="button" variant="outline" onClick={startCamera}>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-2 justify-center">
                <Button type="button" onClick={capturePhoto}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
                <Button type="button" variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
}
