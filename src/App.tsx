import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import PixelScatterPlot from './components/PixelScatterPlot';
import VisualizationControls from './components/VisualizationControls';
import ImageGallery from './components/ImageGallery';
import { extractPixelData, PixelPoint } from './utils/pixelUtils';
import { storeImageData, getImageData } from './utils/imageStore';
import './App.css';

// Hook to detect mobile device
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 910 || 'ontouchstart' in window);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

function App() {
  const isMobile = useIsMobile();
  const [pixels, setPixels] = useState<PixelPoint[]>([]);
  const [pointSize, setPointSize] = useState(isMobile ? 4 : 6);
  const [sampleRate, setSampleRate] = useState(1);
  const [showAxes, setShowAxes] = useState(true);
  const [showTicks, setShowTicks] = useState(!isMobile); // Hide ticks by default on mobile for performance
  const [showGrid, setShowGrid] = useState(!isMobile); // Hide grid by default on mobile for performance
  const [autoRotate, setAutoRotate] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isControlsOpen, setIsControlsOpen] = useState(!isMobile); // Collapsed by default on mobile

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
      
      // Generate a smaller image URL from the resized canvas
      const resizedImageSrc = canvas.toDataURL('image/jpeg', 0.8);
      
      setOriginalImageData(imageData);
      setOriginalImageSrc(resizedImageSrc);
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
    <div className={`App ${isMobile ? 'mobile' : 'desktop'}`}>
      <header className="App-header">
        <h1>🎨 Pixel Visualizer</h1>
        <p>Upload an image to visualize its pixels in 3D RGB color space</p>
      </header>
      
      {isMobile && imageLoaded && (
        <button 
          className="mobile-controls-toggle"
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          aria-label={isControlsOpen ? 'Hide controls' : 'Show controls'}
        >
          {isControlsOpen ? <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.52734 8.47852C9.83203 8.75977 9.83203 9.25195 9.52734 9.5332C9.38672 9.67383 9.19922 9.74414 9.01172 9.74414C8.80078 9.74414 8.61328 9.67383 8.47266 9.5332L6.01172 7.07227L3.52734 9.5332C3.38672 9.67383 3.19922 9.74414 3.01172 9.74414C2.80078 9.74414 2.61328 9.67383 2.47266 9.5332C2.16797 9.25195 2.16797 8.75977 2.47266 8.47852L4.93359 5.99414L2.47266 3.5332C2.16797 3.25195 2.16797 2.75977 2.47266 2.47852C2.75391 2.17383 3.24609 2.17383 3.52734 2.47852L6.01172 4.93945L8.47266 2.47852C8.75391 2.17383 9.24609 2.17383 9.52734 2.47852C9.83203 2.75977 9.83203 3.25195 9.52734 3.5332L7.06641 6.01758L9.52734 8.47852Z" fill="white"/>
</svg>
 : <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.75 2.25C0.75 1.85156 1.07812 1.5 1.5 1.5H10.5C10.8984 1.5 11.25 1.85156 11.25 2.25C11.25 2.67188 10.8984 3 10.5 3H1.5C1.07812 3 0.75 2.67188 0.75 2.25ZM0.75 6C0.75 5.60156 1.07812 5.25 1.5 5.25H10.5C10.8984 5.25 11.25 5.60156 11.25 6C11.25 6.42188 10.8984 6.75 10.5 6.75H1.5C1.07812 6.75 0.75 6.42188 0.75 6ZM10.5 10.5H1.5C1.07812 10.5 0.75 10.1719 0.75 9.75C0.75 9.35156 1.07812 9 1.5 9H10.5C10.8984 9 11.25 9.35156 11.25 9.75C11.25 10.1719 10.8984 10.5 10.5 10.5Z" fill="white"/>
</svg>
}
        </button>
      )}
      
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
                isMobile={isMobile}
              />
            ) : (
              <div className="placeholder-viz">
                <p>Upload an image to see the 3D RGB visualization</p>
              </div>
            )}
          </div>
          
          <div className={`controls-container ${isControlsOpen ? 'open' : 'closed'}`}>
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
                isMobile={isMobile}
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
