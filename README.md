# 🎨 Pixel RGB Visualizer

A React web application that visualizes image pixels as a 3D scatter plot in RGB color space. Each pixel from an uploaded image is plotted as a point in 3D space where:

- **X-axis**: Red channel (0-255)
- **Y-axis**: Green channel (0-255)  
- **Z-axis**: Blue channel (0-255)

Visit https://tswan.github.io/pixel-viz/ to make your own scatter plot your images.

## Features

- **Image Upload**: Drag & drop or browse to upload images
- **3D Visualization**: Interactive 3D scatter plot using React Three Fiber
- **Real-time Controls**: 
  - Adjust point size
  - Control sampling rate for performance
  - Toggle RGB axes visibility
  - Auto-rotation option
- **Color Statistics**: View min/max/average values for each RGB channel
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. Upload an image (automatically resized to max 100×100 pixels for performance)
2. The app extracts RGB values from each pixel
3. Each pixel is plotted as a point in 3D space with coordinates (R, G, B)
4. Points are colored with their actual RGB values
5. Use mouse controls to rotate, zoom, and pan the visualization

## Technology Stack

- **React** with TypeScript
- **React Three Fiber** for 3D graphics
- **Three.js** for WebGL rendering
- **HTML5 Canvas** for image processing

## Getting Started

### Installation

Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

## Usage Tips

- **Performance**: Use the sampling rate control to reduce the number of points for better performance with large images
- **Navigation**: 
  - Left click + drag to rotate
  - Right click + drag to pan
  - Scroll wheel to zoom
- **Best Images**: Images with varied colors will create more interesting 3D patterns
- **Color Clusters**: Similar colors in your image will appear as clusters in the 3D space

## Examples

- Upload a gradient image to see a smooth distribution across RGB space
- Try a landscape photo to see how natural colors cluster
- Upload artwork or logos to explore their color palette in 3D
