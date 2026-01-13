import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import PixelScatterPlot from './components/PixelScatterPlot';
import VisualizationControls from './components/VisualizationControls';
import ImageGallery from './components/ImageGallery';
import { extractPixelData, PixelPoint } from './utils/pixelUtils';
import { storeImageData, getImageData } from './utils/imageStore';
import './App.css';

function App() {
  const [pixels, setPixels] = useState<PixelPoint[]>([]);
  const [pointSize, setPointSize] = useState(6);
  const [sampleRate, setSampleRate] = useState(1);
  const [showAxes, setShowAxes] = useState(true);
  const [showTicks, setShowTicks] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check for URL parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const imageId = urlParams.get('img');
    
    if (imageId) {
      loadImageById(imageId);
    } else {
      loadDefaultImage();
    }
  }, []);

  // Re-extract pixels when sample rate changes
  useEffect(() => {
    if (originalImageData) {
      const extractedPixels = extractPixelData(originalImageData, sampleRate);
      setPixels(extractedPixels);
    }
  }, [sampleRate, originalImageData]);

  const loadImageById = async (imageId: string) => {
    try {
      const storedData = await getImageData(imageId);
      if (storedData) {
        setOriginalImageData(storedData.imageData);
        setOriginalImageSrc(storedData.imageSrc);
        setCurrentImageId(imageId);
        const extractedPixels = extractPixelData(storedData.imageData, sampleRate);
        setPixels(extractedPixels);
        setImageLoaded(true);
      } else {
        console.log('Image not found, loading default');
        loadDefaultImage();
      }
    } catch (error) {
      console.error('Failed to load image:', error);
      loadDefaultImage();
    }
  };

  const loadDefaultImage = () => {
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
      
      setOriginalImageData(imageData);
      setOriginalImageSrc('/pixel-viz/default-image.jpg');
      setCurrentImageId(null);
      const extractedPixels = extractPixelData(imageData, sampleRate);
      setPixels(extractedPixels);
      setImageLoaded(true);
    };
    img.crossOrigin = 'anonymous';
    img.src = '/pixel-viz/default-image.jpg';
  };

  const handleImageLoad = async (imageData: ImageData, imageSrc: string) => {
    const imageId = Date.now().toString();
    
    // Store the image data
    await storeImageData(imageId, imageData, imageSrc);
    
    // Update URL without page reload
    const newUrl = `${window.location.origin}${window.location.pathname}?img=${imageId}`;
    window.history.pushState({ imageId }, '', newUrl);
    
    setOriginalImageData(imageData);
    setCurrentImageId(imageId);
    const extractedPixels = extractPixelData(imageData, sampleRate);
    setPixels(extractedPixels);
    setOriginalImageSrc(imageSrc);
    setImageLoaded(true);
    
    // Show toast with share URL
    setToastMessage(`Share URL: ${newUrl}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleSampleRateChange = (newSampleRate: number) => {
    setSampleRate(newSampleRate);
  };

  const handleImageSelect = (imageId: string) => {
    const newUrl = `${window.location.origin}${window.location.pathname}?img=${imageId}`;
    window.history.pushState({ imageId }, '', newUrl);
    loadImageById(imageId);
  };

  const handleNewImage = () => {
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({}, '', newUrl);
    setCurrentImageId(null);
    setImageLoaded(false);
    setOriginalImageSrc(null);
    setOriginalImageData(null);
    setPixels([]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎨 Pixel Visualizer</h1>
        <p>Upload an image to visualize its pixels in 3D RGB color space</p>
      </header>
      
      <main className="App-main">
          <div className="viz-container">
            {imageLoaded ? (
              <PixelScatterPlot
                pixels={pixels}
                pointSize={pointSize}
                showAxes={showAxes}
                showTicks={showTicks}
                showGrid={showGrid}
                autoRotate={autoRotate}
                originalImageSrc={originalImageSrc}
              />
            ) : (
              <div className="placeholder-viz">
                <p>Upload an image to see the 3D RGB visualization</p>
              </div>
            )}
          </div>
          
          <div className="controls-container">
            <div className="upload-section">
              <ImageUpload onImageLoad={handleImageLoad} />
            </div>

            {imageLoaded && (
              <VisualizationControls
                pointSize={pointSize}
                onPointSizeChange={setPointSize}
                showAxes={showAxes}
                onShowAxesChange={setShowAxes}
                showTicks={showTicks}
                onShowTicksChange={setShowTicks}
                showGrid={showGrid}
                onShowGridChange={setShowGrid}
                pixels={pixels}
              />
            )}
            
            {/* <ImageGallery onImageSelect={handleImageSelect} /> */}
          </div>
      </main>
      
      {showToast && (
        <div className="toast">
          <span>{toastMessage}</span>
          <button onClick={() => setShowToast(false)}>×</button>
        </div>
      )}
    </div>
  );
}

export default App;
