import React, { useState, useEffect } from 'react';
import { getAllStoredImages } from '../utils/imageStore';

interface ImageGalleryProps {
  onImageSelect: (imageId: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onImageSelect }) => {
  const [savedImages, setSavedImages] = useState<Array<{ id: string; imageSrc: string; timestamp: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const images = await getAllStoredImages();
      setSavedImages(images);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="image-gallery">
        <h3>Recent Visualizations</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (savedImages.length === 0) {
    return (
      <div className="image-gallery">
        <h3>Recent Visualizations</h3>
        <p>No saved visualizations yet.</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <h3>Recent Visualizations</h3>
      <div className="gallery-grid">
        {savedImages.slice(0, 6).map((image) => (
          <div
            key={image.id}
            className="gallery-item"
            onClick={() => onImageSelect(image.id)}
          >
            <img src={image.imageSrc} alt="Saved visualization" />
            <div className="gallery-item-overlay">
              <span className="gallery-date">
                {new Date(image.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;