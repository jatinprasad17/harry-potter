import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const CASTLE_WINDOWS = [
  [-1.25, 0.25, 0.37], [-0.8, 0.25, 0.37], [-0.35, 0.25, 0.37],
  [0.35, 0.25, 0.37], [0.8, 0.25, 0.37], [1.25, 0.25, 0.37],
  [-1.25, 0.65, 0.37], [-0.8, 0.65, 0.37], [-0.35, 0.65, 0.37],
  [0.35, 0.65, 0.37], [0.8, 0.65, 0.37], [1.25, 0.65, 0.37],
  [-1.42, 1.15, 0.28], [-1.42, 1.55, 0.28], [-1.42, 1.95, 0.28],
  [-0.65, 1.35, 0.33], [-0.65, 1.75, 0.33], [-0.65, 2.15, 0.33],
  [0, 1.3, 0.32], [0, 1.72, 0.32], [0, 2.14, 0.32],
  [0.65, 1.35, 0.33], [0.65, 1.75, 0.33], [0.65, 2.15, 0.33],
  [1.42, 1.15, 0.28], [1.42, 1.55, 0.28], [1.42, 1.95, 0.28],
]

function createStarPositions(count) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12
    positions[i * 3 + 2] = -2 - Math.random() * 14
  }
  return positions
}

function StarField({ mobile }) {
  const geometry = useMemo(() => {
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(createStarPositions(mobile ? 150 : 420), 3))
    return starGeometry
  }, [mobile])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#dce8f8" size={mobile ? 0.025 : 0.032} sizeAttenuation transparent opacity={0.88} />
    </points>
  )
}

function Tower({ position, radius = 0.28, height = 2.8 }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 1.1, height, 8]} />
        <meshStandardMaterial color="#20283a" roughness={0.92} />
      </mesh>
      <mesh position={[0, height + 0.22, 0]}>
        <coneGeometry args={[radius * 1.55, 0.52, 8]} />
        <meshStandardMaterial color="#111827" roughness={0.84} />
      </mesh>
      <mesh position={[0, height + 0.52, 0]}>
        <sphereGeometry args={[0.045, 8, 6]} />
        <meshBasicMaterial color="#c7a361" />
      </mesh>
    </group>
  )
}

function CastleWindows() {
  const windowsRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    if (!windowsRef.current) return
    CASTLE_WINDOWS.forEach(([x, y, z], index) => {
      dummy.position.set(x, y, z)
      dummy.scale.set(1, index % 4 === 0 ? 1.3 : 1, 1)
      dummy.updateMatrix()
      windowsRef.current.setMatrixAt(index, dummy.matrix)
    })
    windowsRef.current.instanceMatrix.needsUpdate = true
  }, [dummy])

  return (
    <instancedMesh ref={windowsRef} args={[undefined, undefined, CASTLE_WINDOWS.length]}>
      <boxGeometry args={[0.11, 0.19, 0.045]} />
      <meshBasicMaterial color="#ffc86a" toneMapped={false} />
    </instancedMesh>
  )
}

function Hogwarts({ mobile }) {
  const castleRef = useRef()

  useFrame((state, delta) => {
    if (!castleRef.current) return
    const sway = Math.sin(state.clock.elapsedTime * 0.18) * 0.006
    castleRef.current.position.x = (mobile ? 0 : 1.45) + sway
  })

  return (
    <group ref={castleRef} position={[mobile ? 0 : 1.45, mobile ? -3.2 : -2.35, -4.5]} scale={mobile ? 0.78 : 1}>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[3.5, 1.45, 0.78]} />
        <meshStandardMaterial color="#20283a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.52, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.8, 0.62, 4]} />
        <meshStandardMaterial color="#151d2b" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.2, 0.42]}>
        <boxGeometry args={[0.78, 1.8, 0.28]} />
        <meshStandardMaterial color="#252e40" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.28, 0.42]}>
        <coneGeometry args={[0.52, 0.72, 8]} />
        <meshStandardMaterial color="#121a29" roughness={0.85} />
      </mesh>
      <Tower position={[-1.42, 0, 0.08]} height={2.55} radius={0.29} />
      <Tower position={[-0.65, 0, 0.08]} height={3.25} radius={0.25} />
      <Tower position={[0.65, 0, 0.08]} height={3.15} radius={0.26} />
      <Tower position={[1.42, 0, 0.08]} height={2.6} radius={0.29} />
      <Tower position={[0, 0.72, -0.48]} height={3.55} radius={0.3} />
      <CastleWindows />
      <mesh position={[0, -0.12, -0.45]}>
        <boxGeometry args={[5.2, 0.28, 1.3]} />
        <meshStandardMaterial color="#172032" roughness={1} />
      </mesh>
    </group>
  )
}

function Moon({ mobile }) {
  return (
    <group position={mobile ? [-1.25, 2.8, -6.5] : [-3.4, 2.35, -6.5]}>
      <mesh>
        <sphereGeometry args={[0.48, 24, 20]} />
        <meshBasicMaterial color="#f4e8c7" />
      </mesh>
      <mesh scale={1.42}>
        <sphereGeometry args={[0.48, 20, 16]} />
        <meshBasicMaterial color="#ddca9a" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <pointLight color="#d5d9e8" intensity={1.35} distance={13} />
    </group>
  )
}

function Candle({ position, reducedMotion, index }) {
  const candleRef = useRef()

  useFrame((state) => {
    if (!candleRef.current || reducedMotion) return
    candleRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.55 + index * 1.7) * 0.07
  })

  return (
    <group ref={candleRef} position={position}>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.055, 0.065, 0.34, 8]} />
        <meshStandardMaterial color="#e5d7b8" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.052, 8, 8]} />
        <meshBasicMaterial color="#ffb951" toneMapped={false} />
      </mesh>
      {index < 3 && <pointLight position={[0, 0.12, 0]} color="#ffb85c" intensity={0.65} distance={3.2} decay={2} />}
    </group>
  )
}

function FloatingCandles({ mobile, reducedMotion }) {
  const candlePositions = mobile
    ? [[-1.6, 1.55, 0.4], [1.55, 1.1, -0.4], [-1.45, -0.45, -0.6], [1.6, -1.25, 0.2]]
    : [[-4.25, 1.7, 0.2], [-2.7, -0.2, -0.8], [-1.05, 2.4, -0.3], [0.1, -1.25, 0.35], [3.3, 1.9, -0.5], [4.1, -0.85, 0.1], [1.1, 2.7, -0.9]]

  return candlePositions.map((position, index) => (
    <Candle key={index} position={position} index={index} reducedMotion={reducedMotion} />
  ))
}

function ShootingStar({ reducedMotion }) {
  const streakRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    if (reducedMotion || !streakRef.current) return
    const phase = (state.clock.elapsedTime + 5) % 14
    const active = phase < 0.75
    streakRef.current.visible = active
    if (glowRef.current) glowRef.current.visible = active
    if (active) {
      streakRef.current.position.set(4.5 - phase * 7.5, 2.9 - phase * 3.8, -2.4)
      if (glowRef.current) glowRef.current.position.copy(streakRef.current.position)
    }
  })

  return (
    <>
      <mesh ref={streakRef} rotation={[0, 0, -0.48]} visible={false}>
        <boxGeometry args={[0.85, 0.012, 0.008]} />
        <meshBasicMaterial color="#f6e5bb" transparent opacity={0.78} />
      </mesh>
      <mesh ref={glowRef} visible={false}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#fff4d2" toneMapped={false} />
      </mesh>
    </>
  )
}

function Owl({ reducedMotion }) {
  const owlRef = useRef()
  const leftWingRef = useRef()
  const rightWingRef = useRef()

  useFrame((state) => {
    if (reducedMotion || !owlRef.current) return
    const phase = (state.clock.elapsedTime + 17) % 27
    const active = phase < 5.8
    owlRef.current.visible = active
    if (!active) return
    owlRef.current.position.set(-5.4 + (phase / 5.8) * 10.8, 1.05 + Math.sin(phase * 1.15) * 0.3, -1.1)
    owlRef.current.rotation.y = phase < 2.9 ? 0 : Math.PI
    if (leftWingRef.current) leftWingRef.current.rotation.z = Math.sin(phase * 11) * 0.42
    if (rightWingRef.current) rightWingRef.current.rotation.z = -Math.sin(phase * 11) * 0.42
  })

  return (
    <group ref={owlRef} visible={false} scale={0.3}>
      <mesh>
        <sphereGeometry args={[0.42, 12, 10]} />
        <meshStandardMaterial color="#9d8064" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.05, 0.34]} scale={[0.85, 0.78, 0.5]}>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color="#eadbb9" roughness={0.95} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} ref={side < 0 ? leftWingRef : rightWingRef} position={[side * 0.32, 0, 0]}>
          <mesh position={[side * 0.28, 0, 0]} rotation={[0, 0, side * 0.18]} scale={[1.25, 0.38, 0.3]}>
            <sphereGeometry args={[0.34, 10, 8]} />
            <meshStandardMaterial color="#80654e" roughness={0.95} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.12, 0.13, 0.51]}>
          <mesh>
            <sphereGeometry args={[0.105, 10, 8]} />
            <meshBasicMaterial color="#f1e7d2" />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#15121a" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.06, 0.58]} rotation={[0.16, 0, 0]}>
        <coneGeometry args={[0.07, 0.16, 5]} />
        <meshStandardMaterial color="#c9904d" roughness={0.7} />
      </mesh>
    </group>
  )
}

function ParallaxRig({ children, mobile, reducedMotion }) {
  const rigRef = useRef()
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (mobile || reducedMotion) return undefined
    const updatePointer = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', updatePointer, { passive: true })
    return () => window.removeEventListener('pointermove', updatePointer)
  }, [mobile, reducedMotion])

  useFrame((_, delta) => {
    if (!rigRef.current || reducedMotion) return
    const ease = Math.min(delta, 0.05) * 0.7
    rigRef.current.position.x += (pointer.current.x * -0.16 - rigRef.current.position.x) * ease
    rigRef.current.position.y += (pointer.current.y * -0.1 - rigRef.current.position.y) * ease
  })

  return <group ref={rigRef}>{children}</group>
}

function Scene({ mobile, reducedMotion }) {
  return (
    <>
      <color attach="background" args={['#080d1b']} />
      <fog attach="fog" args={['#10182a', 8, 19]} />
      <ambientLight intensity={0.48} />
      <directionalLight position={[2, 5, 4]} color="#d7d9e8" intensity={0.8} />
      <pointLight position={[0, -1, 2]} color="#a56b3d" intensity={0.5} distance={9} />
      <StarField mobile={mobile} />
      <Moon mobile={mobile} />
      <ParallaxRig mobile={mobile} reducedMotion={reducedMotion}>
        <Hogwarts mobile={mobile} />
        <FloatingCandles mobile={mobile} reducedMotion={reducedMotion} />
        <ShootingStar reducedMotion={reducedMotion} />
        <Owl reducedMotion={reducedMotion} />
      </ParallaxRig>
    </>
  )
}

function FrameLimiter({ active, fps }) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    if (!active) return undefined

    let frameId
    let lastFrameTime = 0
    const frameInterval = 1000 / fps
    const requestFrame = (time) => {
      if (time - lastFrameTime >= frameInterval) {
        invalidate()
        lastFrameTime = time
      }
      frameId = window.requestAnimationFrame(requestFrame)
    }

    frameId = window.requestAnimationFrame(requestFrame)
    return () => window.cancelAnimationFrame(frameId)
  }, [active, fps, invalidate])

  return null
}

function useDisplaySettings() {
  const [settings, setSettings] = useState(() => getDisplaySettings())

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 700px)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateSettings = () => setSettings(getDisplaySettings())
    mobileQuery.addEventListener('change', updateSettings)
    motionQuery.addEventListener('change', updateSettings)
    return () => {
      mobileQuery.removeEventListener('change', updateSettings)
      motionQuery.removeEventListener('change', updateSettings)
    }
  }, [])

  return settings
}

function getDisplaySettings() {
  const mobile = window.matchMedia('(max-width: 700px)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const memory = navigator.deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4
  const saveData = navigator.connection?.saveData ?? false
  const quality = saveData || memory <= 2 || cores <= 2
    ? 'low'
    : !mobile && memory >= 8 && cores >= 8
      ? 'high'
      : 'balanced'

  return { mobile, reducedMotion, quality }
}

export default function MagicScene() {
  const { mobile, reducedMotion, quality } = useDisplaySettings()
  const [inView, setInView] = useState(false)
  const sceneRef = useRef(null)

  useEffect(() => {
    const sceneElement = sceneRef.current
    if (!sceneElement) return undefined
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.01 })
    observer.observe(sceneElement)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sceneRef} className="magic-scene" role="img" aria-label="Hogwarts castle beneath a full moon, surrounded by floating candles, stars, and an occasional flying owl">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 42, near: 0.1, far: 40 }}
        dpr={quality === 'low' ? 0.85 : quality === 'balanced' ? 1 : [1, 1.15]}
        frameloop="demand"
        gl={{ alpha: false, antialias: !mobile, powerPreference: 'low-power' }}
      >
        <FrameLimiter
          active={inView && !reducedMotion}
          fps={quality === 'high' ? 60 : quality === 'balanced' ? 30 : 20}
        />
        <Scene mobile={mobile} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
