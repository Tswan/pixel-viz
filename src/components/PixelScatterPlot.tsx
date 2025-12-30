import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { PixelPoint } from '../utils/pixelUtils';
import * as THREE from 'three';

interface PixelScatterPlotProps {
  pixels: PixelPoint[];
  pointSize?: number;
  showAxes?: boolean;
  showGrid?: boolean;
  showTicks?: boolean;
  autoRotate?: boolean;
}

const AxisTickLabels: React.FC = () => {
  const { camera } = useThree();
  const tickRefs = useRef<THREE.Group[]>([]);

  useFrame(() => {
    tickRefs.current.forEach((ref) => {
      if (ref) ref.lookAt(camera.position);
    });
  });

  const ticks = [0, 50, 100, 150, 200, 250];
  const ticksWithoutZero = [50, 100, 150, 200, 250];

  return (
    <>
      {/* Single origin label at (0, 0, 0) */}
      <Text
        ref={(ref) => {
          if (ref) tickRefs.current[0] = ref;
        }}
        position={[-6, -8, -6]}
        fontSize={6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        0
      </Text>

      {/* X-axis (Red) tick labels */}
      {ticksWithoutZero.map((tick, index) => (
        <Text
          key={`x-${tick}`}
          ref={(ref) => {
            if (ref) tickRefs.current[index + 1] = ref;
          }}
          position={[tick, -8, -8]}
          fontSize={6}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {tick}
        </Text>
      ))}
      
      {/* Y-axis (Green) tick labels */}
      {ticksWithoutZero.map((tick, index) => (
        <Text
          key={`y-${tick}`}
          ref={(ref) => {
            if (ref) tickRefs.current[index + 1 + ticksWithoutZero.length] = ref;
          }}
          position={[-8, tick, -8]}
          fontSize={6}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {tick}
        </Text>
      ))}
      
      {/* Z-axis (Blue) tick labels */}
      {ticksWithoutZero.map((tick, index) => (
        <Text
          key={`z-${tick}`}
          ref={(ref) => {
            if (ref) tickRefs.current[index + 1 + (2 * ticksWithoutZero.length)] = ref;
          }}
          position={[-8, -8, tick]}
          fontSize={6}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {tick}
        </Text>
      ))}
    </>
  );
};

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
      greenTextRef.current.rotation.z -= Math.PI/2; // Correct upside-down orientation
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
        position={[15, 130, 0]}
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

const GridLines: React.FC = () => {
  const gridValues = [50, 100, 150, 200, 250];
  
  return (
    <>
      {/* Outer face grid lines - Bottom face (z=0) */}
      <group key="bottom-face">
        {gridValues.map((x) => (
          <line key={`bottom-v-${x}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([x, 0, 0, x, 255, 0]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
        {gridValues.map((y) => (
          <line key={`bottom-h-${y}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([0, y, 0, 255, y, 0]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
      </group>

      {/* Outer face grid lines - Top face (z=255) */}
      <group key="top-face">
        {gridValues.map((x) => (
          <line key={`top-v-${x}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([x, 0, 255, x, 255, 255]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
        {gridValues.map((y) => (
          <line key={`top-h-${y}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([0, y, 255, 255, y, 255]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
      </group>

      {/* Outer face grid lines - Front face (y=0) */}
      <group key="front-face">
        {gridValues.map((x) => (
          <line key={`front-v-${x}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([x, 0, 0, x, 0, 255]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
        {gridValues.map((z) => (
          <line key={`front-h-${z}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([0, 0, z, 255, 0, z]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
      </group>

      {/* Outer face grid lines - Back face (y=255) */}
      <group key="back-face">
        {gridValues.map((x) => (
          <line key={`back-v-${x}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([x, 255, 0, x, 255, 255]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
        {gridValues.map((z) => (
          <line key={`back-h-${z}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([0, 255, z, 255, 255, z]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
      </group>

      {/* Outer face grid lines - Left face (x=0) */}
      <group key="left-face">
        {gridValues.map((y) => (
          <line key={`left-v-${y}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([0, y, 0, 0, y, 255]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
        {gridValues.map((z) => (
          <line key={`left-h-${z}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([0, 0, z, 0, 255, z]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
      </group>

      {/* Outer face grid lines - Right face (x=255) */}
      <group key="right-face">
        {gridValues.map((y) => (
          <line key={`right-v-${y}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([255, y, 0, 255, y, 255]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
        {gridValues.map((z) => (
          <line key={`right-h-${z}`}>
            <bufferGeometry>
              <bufferAttribute
                args={[new Float32Array([255, 0, z, 255, 255, z]), 3]}
                attach="attributes-position"
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </line>
        ))}
      </group>
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
  showGrid = true,
  showTicks = true,
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
        {showGrid && <GridLines />}
        {showAxes && <AxisLabels />}
        {showTicks && <AxisTickLabels />}
        
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