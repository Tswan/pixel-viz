import React, { useState } from 'react';

interface ImageUploadProps {
  onImageLoad: (imageData: ImageData) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageLoad }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    }
  };

  const processImage = (file: File) => {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Limit image size to prevent performance issues
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        onImageLoad(imageData);
        setLoading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
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

  return (
    <div className="upload-container">
      <div
        className={`drop-zone ${dragActive ? 'active' : ''} ${loading ? 'loading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="loading-text">Processing image...</div>
        ) : (
          <>
            <div className="upload-text">
              Drop an image here or{' '}
              <label htmlFor="file-input" className="file-label">
                browse
              </label>
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              style={{ display: 'none' }}
            />
            <div className="upload-note">
              Image will be resized to max 100x100 pixels for performance
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;