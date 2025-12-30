import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { PixelPoint } from '../utils/pixelUtils';
import * as THREE from 'three';

interface PixelScatterPlotProps {
  pixels: PixelPoint[];
  pointSize?: number;
  showAxes?: boolean;
  autoRotate?: boolean;
}

const AxisLabels: React.FC = () => {
  return (
    <>
      <Text
        position={[130, 0, 0]}
        fontSize={8}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        Red (255)
      </Text>
      <Text
        position={[0, 130, 0]}
        fontSize={8}
        color="green"
        anchorX="center"
        anchorY="middle"
      >
        Green (255)
      </Text>
      <Text
        position={[0, 0, 130]}
        fontSize={8}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        Blue (255)
      </Text>
    </>
  );
};

const Axes: React.FC = () => {
  const xAxisPoints = new Float32Array([0, 0, 0, 255, 0, 0]);
  const yAxisPoints = new Float32Array([0, 0, 0, 0, 255, 0]);
  const zAxisPoints = new Float32Array([0, 0, 0, 0, 0, 255]);

  return (
    <>
      {/* X-axis (Red) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            args={[xAxisPoints, 3]}
            attach="attributes-position"
          />
        </bufferGeometry>
        <lineBasicMaterial color="red" />
      </line>
      
      {/* Y-axis (Green) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            args={[yAxisPoints, 3]}
            attach="attributes-position"
          />
        </bufferGeometry>
        <lineBasicMaterial color="green" />
      </line>
      
      {/* Z-axis (Blue) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            args={[zAxisPoints, 3]}
            attach="attributes-position"
          />
        </bufferGeometry>
        <lineBasicMaterial color="blue" />
      </line>
    </>
  );
};

const PixelPoints: React.FC<{
  pixels: PixelPoint[];
  pointSize: number;
  autoRotate: boolean;
}> = ({ pixels, pointSize, autoRotate }) => {
  const meshRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(pixels.length * 3);
    const colors = new Float32Array(pixels.length * 3);

    pixels.forEach((pixel, index) => {
      // Use RGB values directly as coordinates (0-255 range)
      positions[index * 3] = pixel.r;
      positions[index * 3 + 1] = pixel.g;
      positions[index * 3 + 2] = pixel.b;

      // Use normalized RGB as color
      colors[index * 3] = pixel.normalizedR;
      colors[index * 3 + 1] = pixel.normalizedG;
      colors[index * 3 + 2] = pixel.normalizedB;
    });

    return { positions, colors };
  }, [pixels]);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
        />
        <bufferAttribute
          args={[colors, 3]}
          attach="attributes-color"
        />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        vertexColors
        sizeAttenuation={false}
      />
    </points>
  );
};

const PixelScatterPlot: React.FC<PixelScatterPlotProps> = ({
  pixels,
  pointSize = 2,
  showAxes = true,
  autoRotate = false,
}) => {
  // Center of RGB color space (127.5 for each axis)
  const rgbCenter = [127.5, 127.5, 127.5] as [number, number, number];
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Canvas
        camera={{
          position: [400, 400, 400],
          fov: 50,
        }}
        style={{ background: '#f0f0f0' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[255, 255, 255]} />
        
        {showAxes && <Axes />}
        {showAxes && <AxisLabels />}
        
        <PixelPoints 
          pixels={pixels} 
          pointSize={pointSize} 
          autoRotate={autoRotate}
        />
        
        <OrbitControls 
          enableDamping 
          target={rgbCenter}
        />
      </Canvas>
    </div>
  );
};

export default PixelScatterPlot;