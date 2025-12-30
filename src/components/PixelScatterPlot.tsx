import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  const redTextRef = useRef<THREE.Group>(null);
  const greenTextRef = useRef<THREE.Group>(null);
  const blueTextRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (redTextRef.current) {
      redTextRef.current.lookAt(camera.position);
    }
    if (greenTextRef.current) {
      greenTextRef.current.lookAt(camera.position);
      greenTextRef.current.rotation.z += Math.PI/2; // Correct upside-down orientation
    }
    if (blueTextRef.current) {
      blueTextRef.current.lookAt(camera.position);
    }
  });

  return (
    <>
      <Text
        ref={redTextRef}
        position={[130, 15, 0]}
        fontSize={10}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Red (0-255)
      </Text>
      <Text
        ref={greenTextRef}
        position={[-15, 130, 0]}
        // rotation={[Math.PI/2,0,0]}
        fontSize={10}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Green (0-255)
      </Text>
      <Text
        ref={blueTextRef}
        position={[0, 15, 130]}        
        fontSize={10}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Blue (0-255)
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
        <lineBasicMaterial color="cyan" />
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

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 32;
    canvas.height = 32;

    // Clear canvas to transparent
    context.clearRect(0, 0, 32, 32);
    
    // Draw circle with semi-transparent fill and solid stroke
    context.beginPath();
    context.arc(16, 16, 14, 0, 2 * Math.PI);
    
    // Semi-transparent white fill
    context.fillStyle = 'rgba(255, 255, 255, 0.7)';
    context.fill();
    
    // Solid white stroke
    context.strokeStyle = 'rgba(255, 255, 255, 1)';
    context.lineWidth = 2;
    context.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

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
        map={circleTexture}
        transparent={true}
        alphaTest={0.1}
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
        style={{ background: '#111a1a' }}
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