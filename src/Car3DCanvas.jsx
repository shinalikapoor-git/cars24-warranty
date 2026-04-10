import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, Float, Html } from '@react-three/drei'
import * as THREE from 'three'

// Open source realistic 3D model 
const MODEL_URL = '/ferrari.glb'

function RealCarModel({ scrollYProgress }) {
  const { scene, materials } = useGLTF(MODEL_URL)
  const carRef = useRef()

  const clonedMaterials = useMemo(() => {
    const fresh = {}
    Object.entries(materials).forEach(([key, mat]) => {
      fresh[key] = mat.clone()
      // We do NOT set transparent = true immediately so it renders exactly as the original solid model.
    })
    return fresh
  }, [materials])

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = clonedMaterials[child.material.name]
      }
    })
  }, [scene, clonedMaterials])

  useFrame(() => {
    const scroll = scrollYProgress.get()
    
    // Transition to X-Ray glass when scrolling past hero
    let targetOpacity = 1;

    if (scroll > 0.05) {
      // Fade out to 0.15 by scroll 0.2
      const progress = Math.min((scroll - 0.05) / 0.15, 1)
      targetOpacity = 1 - (progress * 0.85)
    }

    Object.values(clonedMaterials).forEach(mat => {
      let matTargetOpacity = targetOpacity;
      // Preserve some opacity on the underbody/glass so the car doesn't completely vanish
      if (!mat.name.includes('paint') && !mat.name.includes('metal')) {
         matTargetOpacity = Math.max(0.1, targetOpacity);
      }
      
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, matTargetOpacity, 0.08)

      // Toggle depth sorting based on opacity threshold
      const shouldBeTransparent = mat.opacity < 0.99;
      if (mat.transparent !== shouldBeTransparent) {
        mat.transparent = shouldBeTransparent;
        mat.depthWrite = !shouldBeTransparent;
        mat.needsUpdate = true;
      }
    })

    // Cinematic base rotate
    if (carRef.current) {
       carRef.current.rotation.y = scroll * Math.PI * 0.6 
    }
  })

  return <primitive object={scene} ref={carRef} scale={1.2} position={[0, -0.6, 0]} rotation={[0, -Math.PI / 4, 0]} />
}

function InternalNodes({ scrollYProgress, activePart }) {
  // Glow coordinates relative to the 3D car center
  const nodes = [
    { name: 'Engine', pos: [0, 0.2, 1.2], color: '#ff2d55' },
    { name: 'Transmission', pos: [0, -0.2, 0.4], color: '#5e5ce6' },
    { name: 'Electronics', pos: [-0.4, 0.5, 0.5], color: '#32ade6' },
    { name: 'Braking', pos: [-0.8, -0.4, 1.2], color: '#ff9f0a' },
    { name: 'Air Con', pos: [0, 0.4, 1.5], color: '#30d158' },
    { name: 'Steering', pos: [-0.3, 0.5, 0.7], color: '#ffd60a' },
    { name: 'Drivetrain', pos: [0, -0.3, -1.0], color: '#ff375f' }
  ]

  const groupRef = useRef()

  useFrame(() => {
    const scroll = scrollYProgress.get()
    let targetScale = scroll > 0.08 ? 1 : 0
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    groupRef.current.rotation.y = scroll * Math.PI * 0.6 
  })

  return (
    <group ref={groupRef} position={[0, -0.6, 0]} rotation={[0, -Math.PI / 4, 0]}>
      {nodes.map((node, idx) => (
        <mesh key={idx} position={node.pos}>
          <sphereGeometry args={[0.08 + (activePart === idx ? 0.06 : 0), 32, 32]} />
          <meshBasicMaterial color={node.color} />
          <mesh>
            <sphereGeometry args={[0.16 + (activePart === idx ? 0.1 : 0), 32, 32]} />
            <meshBasicMaterial color={node.color} transparent opacity={activePart === idx ? 0.6 : 0.15} />
          </mesh>
          {activePart === idx && (
            <Html center position={[0, 0.4, 0]}>
              <div style={{ color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '10px', backdropFilter: 'blur(4px)' }}>
                {node.name}
              </div>
            </Html>
          )}
        </mesh>
      ))}
    </group>
  )
}

function CameraRig({ scrollYProgress, activePart }) {
  useFrame((state) => {
    const scroll = scrollYProgress.get()
    
    // Default cinematic view
    let cx = 4, cy = 1.2, cz = 5
    let tx = 0, ty = 0, tz = 0

    if (scroll > 0.08) {
      if (activePart === 0) { // Engine (Front zoom)
        cx = 2.5; cy = 0.8; cz = 3.5;
        tx = 0; ty = 0.2; tz = 1.2;
      } else if (activePart === 1) { // Transmission (Middle under)
        cx = 3.5; cy = -0.5; cz = 1.5;
        tx = 0; ty = -0.2; tz = 0.4;
      } else if (activePart === 6) { // Drivetrain (Rear)
        cx = -3; cy = -0.2; cz = -2.5;
        tx = 0; ty = -0.3; tz = -1.0;
      } else {
         cx = 4; cy = 1; cz = 4;
      }
    }

    state.camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.05)
    
    if (!state.camera.userData.target) state.camera.userData.target = new THREE.Vector3(0, 0, 0)
    state.camera.userData.target.lerp(new THREE.Vector3(tx, ty, tz), 0.05)
    state.camera.lookAt(state.camera.userData.target)
  })
  return null
}

export default function Car3DCanvas({ scrollYProgress, activePart }) {
  return (
    <div className="canvas-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
       <Canvas camera={{ position: [4, 1.2, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 15, 10]} intensity={1.5} penumbra={1} castShadow />
          <spotLight position={[-10, 5, -10]} intensity={2} color="#4db8ff" penumbra={1} />
          
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
             <RealCarModel scrollYProgress={scrollYProgress} />
             <InternalNodes scrollYProgress={scrollYProgress} activePart={activePart} />
          </Float>

          <ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
          <Environment preset="city" />
          
          <CameraRig scrollYProgress={scrollYProgress} activePart={activePart} />
       </Canvas>
    </div>
  )
}
