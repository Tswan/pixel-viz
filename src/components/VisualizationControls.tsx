import React from 'react';
import { getColorStats, PixelPoint } from '../utils/pixelUtils';

interface VisualizationControlsProps {
  pointSize: number;
  onPointSizeChange: (size: number) => void;
  sampleRate: number;
  onSampleRateChange: (rate: number) => void;
  showAxes: boolean;
  onShowAxesChange: (show: boolean) => void;
  autoRotate: boolean;
  onAutoRotateChange: (rotate: boolean) => void;
  pixels: PixelPoint[];
}

const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  pointSize,
  onPointSizeChange,
  sampleRate,
  onSampleRateChange,
  showAxes,
  onShowAxesChange,
  autoRotate,
  onAutoRotateChange,
  pixels,
}) => {
  const stats = getColorStats(pixels);

  return (
    <div className="controls-panel">
      <h3>Visualization Controls</h3>
      
      <div className="control-group">
        <label htmlFor="point-size">Point Size: {pointSize}</label>
        <input
          id="point-size"
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={pointSize}
          onChange={(e) => onPointSizeChange(parseFloat(e.target.value))}
        />
      </div>

      {/* <div className="control-group">
        <label htmlFor="sample-rate">Sample Rate: {sampleRate}</label>
        <input
          id="sample-rate"
          type="range"
          min="1"
          max="5"
          step="1"
          value={sampleRate}
          onChange={(e) => onSampleRateChange(parseInt(e.target.value))}
        />
        <small>Higher values = fewer points, better performance</small>
      </div> */}

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={showAxes}
            onChange={(e) => onShowAxesChange(e.target.checked)}
          />
          Show RGB Axes
        </label>
      </div>

      {/* <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => onAutoRotateChange(e.target.checked)}
          />
          Auto Rotate
        </label>
      </div> */}

      {stats && (
        <div className="stats-panel">
          <h4>Color Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Total Points:</strong> {stats.count.toLocaleString()}
            </div>
            
            <div className="stat-item red">
              <strong>Red Channel:</strong>
              <div>Min: {stats.red.min}</div>
              <div>Max: {stats.red.max}</div>
              <div>Avg: {Math.round(stats.red.avg)}</div>
            </div>
            
            <div className="stat-item green">
              <strong>Green Channel:</strong>
              <div>Min: {stats.green.min}</div>
              <div>Max: {stats.green.max}</div>
              <div>Avg: {Math.round(stats.green.avg)}</div>
            </div>
            
            <div className="stat-item blue">
              <strong>Blue Channel:</strong>
              <div>Min: {stats.blue.min}</div>
              <div>Max: {stats.blue.max}</div>
              <div>Avg: {Math.round(stats.blue.avg)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="info-panel">
        <h4>How to Use</h4>
        <ul>
          <li>Upload an image to see its pixels plotted in RGB space</li>
          <li>Each point represents one pixel with RGB coordinates</li>
          <li>Red axis (X) = Red channel (0-255)</li>
          <li>Green axis (Y) = Green channel (0-255)</li>
          <li>Blue axis (Z) = Blue channel (0-255)</li>
          <li>Point color matches the actual pixel color</li>
          <li>Use mouse to rotate, zoom, and pan the view</li>
        </ul>
      </div>
    </div>
  );
};

export default VisualizationControls;