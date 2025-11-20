"use client";
import React, { useState } from "react";
// --------------------------------------------------------
// PDF UPLOAD MODAL (FINAL VERSION: drag + drop + browse)
// --------------------------------------------------------

const PDFUploadModal = ({
  isOpen,
  onClose,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}) => {
  const [file, setFile] = React.useState<File | null>(null);

  if (!isOpen) return null;

  const validateFile = (file?: File) => {
    if (file && file.type === "application/pdf") {
      setFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    validateFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a PDF first.");
      return;
    }
    onUpload(file);
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl w-[420px] shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">Upload PDF</h2>

        {/* Drag & Drop / Browse Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full border-2 border-dashed border-neutral-600 hover:border-neutral-400 transition rounded-lg p-6 text-center cursor-pointer"
        >
          <label className="cursor-pointer block">
            <p className="text-neutral-300 mb-2">Drag & Drop your PDF here</p>
            <p className="text-neutral-500 text-sm mb-4">or click to browse</p>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 p-3 bg-neutral-800 text-neutral-300 rounded-lg text-sm">
            📄 {file.name}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setFile(null);
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            disabled={!file}
            onClick={handleUpload}
            className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFUploadModal;