import React, { useState } from 'react';
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

  const handleImageLoad = (imageData: ImageData, imageSrc: string) => {
    const extractedPixels = extractPixelData(imageData, sampleRate);
    setPixels(extractedPixels);
    setOriginalImageSrc(imageSrc);
    setImageLoaded(true);
  };

  const handleSampleRateChange = (newSampleRate: number) => {
    setSampleRate(newSampleRate);
    // Re-extract pixels if we have image data
    if (imageLoaded && pixels.length > 0) {
      // Note: In a real app, you'd store the original ImageData and re-extract
      // For now, we'll just update the sample rate for future uploads
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎨 Pixel RGB Visualizer</h1>
        <p>Upload an image to visualize its pixels in 3D RGB color space</p>
      </header>
      
      <main className="App-main">
        {!imageLoaded ? (
          <div className="upload-section">
            <ImageUpload onImageLoad={handleImageLoad} />
          </div>
        ) : (
          <div className="visualization-section">
            <div className="viz-container">
              <PixelScatterPlot
                pixels={pixels}
                pointSize={pointSize}
                showAxes={showAxes}
                showTicks={showTicks}
                showGrid={showGrid}
                autoRotate={autoRotate}
                originalImageSrc={originalImageSrc}
              />
            </div>
            
            <div className="controls-container">
<button 
                className="reset-btn"
                onClick={() => {
                  setPixels([]);
                  setImageLoaded(false);                  setOriginalImageSrc(null);                  setPointSize(6);
                  setSampleRate(1);
                  setShowAxes(true);
                  setShowTicks(true);
                  setShowGrid(true);
                  setAutoRotate(false);
                }}
              >
                Upload New Image
              </button>

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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
