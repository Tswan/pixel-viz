import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import PixelScatterPlot from './components/PixelScatterPlot';
import VisualizationControls from './components/VisualizationControls';
import { extractPixelData, PixelPoint } from './utils/pixelUtils';
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

  // Load default image on app start
  useEffect(() => {
    loadDefaultImage();
  }, []);

  // Re-extract pixels when sample rate changes
  useEffect(() => {
    if (originalImageData) {
      const extractedPixels = extractPixelData(originalImageData, sampleRate);
      setPixels(extractedPixels);
    }
  }, [sampleRate, originalImageData]);

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
      const extractedPixels = extractPixelData(imageData, sampleRate);
      setPixels(extractedPixels);
      setImageLoaded(true);
    };
    img.crossOrigin = 'anonymous';
    img.src = '/pixel-viz/default-image.jpg';
  };

  const handleImageLoad = (imageData: ImageData, imageSrc: string) => {
    setOriginalImageData(imageData);
    const extractedPixels = extractPixelData(imageData, sampleRate);
    setPixels(extractedPixels);
    setOriginalImageSrc(imageSrc);
    setImageLoaded(true);
  };

  const handleSampleRateChange = (newSampleRate: number) => {
    setSampleRate(newSampleRate);
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
          </div>
      </main>
    </div>
  );
}

export default App;
