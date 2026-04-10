import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, ContactShadows, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Procedural sleek Apple-like Car model with parts highlighting
const CarModel = ({ activePartIndex }) => {
  const group = useRef()
  
  // Materials
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#1e293b',
    metalness: 0.8,
    roughness: 0.2,
    transmission: 0.9,
    thickness: 1,
    envMapIntensity: 2,
    clearcoat: 1,
    clearcoatRoughness: 0.1
  }), [])

  const wheelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f172a',
    metalness: 0.5,
    roughness: 0.5,
  }), [])
  
  const rimMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    metalness: 0.9,
    roughness: 0.1,
  }), [])

  const glowMaterial = (isActive) => new THREE.MeshBasicMaterial({
    color: isActive ? '#38bdf8' : '#334155',
    toneMapped: false,
  })

  // Part definitions with positions
  // 0: Engine (front top)
  // 1: Transmission (middle bottom)
  // 2: Electronics (dashboard/cabin)
  // 3: Braking System (wheels)
  // 4: Air Conditioning (front grill)
  // 5: Steering (front cabin)
  // 6: Drivetrain (rear bottom)
  
  return (
    <group ref={group}>
      {/* Main Body (Glassmorphism style) */}
      <mesh position={[0, 0.8, 0]} material={glassMaterial}>
        <boxGeometry args={[4.5, 1.2, 2.2]} />
      </mesh>
      {/* Cabin/Roof */}
      <mesh position={[-0.2, 1.8, 0]} material={glassMaterial}>
        <boxGeometry args={[2.5, 0.8, 1.8]} />
      </mesh>
      
      {/* Wheels */}
      {[-1.4, 1.4].map((x, i) => 
        [-1.1, 1.1].map((z, j) => (
          <group key={`${i}-${j}`} position={[x, 0.4, z]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={wheelMaterial}>
              <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={rimMaterial}>
              <cylinderGeometry args={[0.3, 0.3, 0.32, 16]} />
            </mesh>
            {/* Brake Calipers (Part 3) */}
            <mesh position={[0.2, 0, 0]} material={glowMaterial(activePartIndex === 3)}>
              <boxGeometry args={[0.2, 0.4, 0.35]} />
            </mesh>
          </group>
        ))
      )}

      {/* Internal Magical Systems */}
      
      {/* Engine (Part 0) */}
      <mesh position={[1.5, 0.8, 0]} material={glowMaterial(activePartIndex === 0)}>
        <boxGeometry args={[0.8, 0.6, 1.2]} />
      </mesh>
      
      {/* Transmission (Part 1) */}
      <mesh position={[0.5, 0.5, 0]} material={glowMaterial(activePartIndex === 1)}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
      </mesh>

      {/* Electronics (Part 2) */}
      <mesh position={[0, 1.2, 0]} material={glowMaterial(activePartIndex === 2)}>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
      </mesh>

      {/* Air Conditioning (Part 4) */}
      <mesh position={[2.1, 0.7, 0]} material={glowMaterial(activePartIndex === 4)}>
        <boxGeometry args={[0.2, 0.8, 1.4]} />
      </mesh>

      {/* Steering System (Part 5) */}
      <mesh position={[0.8, 1.2, 0.5]} rotation={[0, 0, 0.3]} material={glowMaterial(activePartIndex === 5)}>
        <torusGeometry args={[0.25, 0.05, 16, 32]} />
      </mesh>
      
      {/* Drivetrain (Part 6) */}
      <mesh position={[-0.5, 0.4, 0]} material={glowMaterial(activePartIndex === 6)}>
        <cylinderGeometry args={[0.1, 0.1, 3]} />
        <mesh rotation={[0, 0, Math.PI / 2]} />
      </mesh>
    </group>
  )
}

// Camera controller that smooth-scrolls between views
const CameraRig = ({ activePartIndex }) => {
  useFrame((state) => {
    // Determine target position and lookAt based on active part
    // Default view
    let targetPos = new THREE.Vector3(-4, 3, 6)
    let targetLook = new THREE.Vector3(0, 1, 0)
    
    switch (activePartIndex) {
      case 0: // Engine - Zoom front
        targetPos.set(4, 2, 4)
        targetLook.set(1.5, 0.8, 0)
        break
      case 1: // Transmission - Zoom underside
        targetPos.set(1.5, -1, 3)
        targetLook.set(0.5, 0.5, 0)
        break
      case 2: // Electronics - Top down slightly
        targetPos.set(0, 5, 2)
        targetLook.set(0, 1.2, 0)
        break
      case 3: // Braking - Close to wheel
        targetPos.set(-2, 1, 3)
        targetLook.set(-1.4, 0.4, 1.1)
        break
      case 4: // Air Con - Extreme front
        targetPos.set(5, 1, 0)
        targetLook.set(2.1, 0.7, 0)
        break
      case 5: // Steering - Side view
        targetPos.set(2, 2, 4)
        targetLook.set(0.8, 1.2, 0.5)
        break
      case 6: // Drivetrain - Rear under
        targetPos.set(-5, 0, 2)
        targetLook.set(-0.5, 0.4, 0)
        break
      default:
        targetPos.set(-5, 3, 6)
        targetLook.set(0, 1, 0)
        break
    }

    // Smooth lerp camera position
    state.camera.position.lerp(targetPos, 0.05)
    
    // Smooth lerp camera rotation/lookAt
    // We achieve this by lerping a dummy Vector3 and making the camera look at it
    if (!state.camera.userData.lookTarget) {
      state.camera.userData.lookTarget = new THREE.Vector3(0, 1, 0)
    }
    state.camera.userData.lookTarget.lerp(targetLook, 0.05)
    state.camera.lookAt(state.camera.userData.lookTarget)
  })
  
  return null
}

const Starfield = () => {
    const ref = useRef()
    const sphere = useMemo(() => {
      const positions = new Float32Array(500 * 3)
      for (let i = 0; i < 500; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50
        positions[i * 3 + 1] = (Math.random() - 0.5) * 50
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      }
      return positions
    }, [])
  
    useFrame((state, delta) => {
      if (ref.current) {
        ref.current.rotation.x -= delta / 10
        ref.current.rotation.y -= delta / 15
      }
    })
  
    return (
      <group rotation={[0, 0, Math.PI / 4]}>
        <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
          <PointMaterial transparent color="#38bdf8" size={0.05} sizeAttenuation={true} depthWrite={false} />
        </Points>
      </group>
    )
}

export default function Car3D({ activePartIndex }) {
  return (
    <div className="car-3d-container">
      <Canvas camera={{ position: [-5, 3, 6], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <spotLight position={[-10, 10, -10]} intensity={2} color="#38bdf8" />
        
        <Starfield />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <CarModel activePartIndex={activePartIndex} />
        </Float>
        
        <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        <Environment preset="city" />
        
        <CameraRig activePartIndex={activePartIndex} />
      </Canvas>
    </div>
  )
}
