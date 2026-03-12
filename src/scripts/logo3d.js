import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { getTheme } from "./theme"

export function initializeLogo3D() {
  const container = document.getElementById("logo3d")
  if (!container) return

  // renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, 420)
  container.appendChild(renderer.domElement)

  // scene
  const scene = new THREE.Scene()

  // camera
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / 420, 0.1, 100)
  camera.position.set(0, 0, 4)

  // lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2)
  keyLight.position.set(3, 3, 3)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.8)
  rimLight.position.set(-3, 2, -3)
  scene.add(rimLight)

  // model
  let model
  const loader = new GLTFLoader()
  const textureLoader = new THREE.TextureLoader()

  // Load reflection texture
  const reflectionTexture = textureLoader.load("/models/reflection.jpg")
  reflectionTexture.mapping = THREE.EquirectangularReflectionMapping

  loader.load("/models/logo.glb", (gltf) => {
    model = gltf.scene

    // Apply reflection to all materials
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.envMap = reflectionTexture
        child.material.envMapIntensity = 0.8
        child.material.needsUpdate = true
      }
    })

    // Apply theme colors to materials
    updateMaterialsForTheme(getTheme())

    // auto center
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(center)

    // auto scale
    const size = box.getSize(new THREE.Vector3()).length()
    const scale = 4 / size
    model.scale.setScalar(scale)

    // Ensure rotation is around the center
    model.updateMatrixWorld(true)

    scene.add(model)
  })

  // Theme change handling
  function updateLightsForTheme(theme) {
    const isDark = theme === 'dark'
    const ambientIntensity = isDark ? 0.5 : 0.7
    const keyIntensity = isDark ? 1.4 : 1.2
    const rimIntensity = isDark ? 1.0 : 0.8

    ambient.intensity = ambientIntensity
    keyLight.intensity = keyIntensity
    rimLight.intensity = rimIntensity
  }

  function updateMaterialsForTheme(theme) {
    if (!model) return

    const isDark = theme === 'dark'
    
    // Light theme: dark materials (0x333333)
    // Dark theme: light materials (0xcccccc)
    const materialColor = isDark ? 0xf9c4f0 : 0x333333
    const metalness = isDark ? 0.9 : 0.7
    const roughness = isDark ? 0.3 : 0.4

    model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.color) {
          child.material.color.setHex(materialColor)
        }
        if (child.material.metalness !== undefined) {
          child.material.metalness = metalness
        }
        if (child.material.roughness !== undefined) {
          child.material.roughness = roughness
        }
        child.material.needsUpdate = true
      }
    })
  }

  // Initialize lights for current theme
  updateLightsForTheme(getTheme())

  // Listen for theme changes
  window.addEventListener('theme-change', (e) => {
    updateLightsForTheme(e.detail.theme)
    updateMaterialsForTheme(e.detail.theme)
  })

  // animation
  const clock = new THREE.Clock()
  let scrollRotation = 0
  let isScrolling = false
  let scrollTimeout

  function animate() {
    requestAnimationFrame(animate)

    const t = clock.getElapsedTime()

    if (model) {
      // Auto rotation
      if (!isScrolling) {
        model.rotation.y = t * 0.5
      } else {
        // Scroll-based rotation
        model.rotation.y += scrollRotation
        scrollRotation *= 0.95 // damping effect
      }
      
      model.rotation.x = Math.sin(t * 0.8) * 0.08
    }

    renderer.render(scene, camera)
  }

  animate()

  // scroll event
  window.addEventListener("wheel", (e) => {
    isScrolling = true
    
    // scroll up = negative (links draaien), scroll down = positive (rechts draaien)
    scrollRotation = -(e.deltaY * 0.001)
    
    // Clear existing timeout
    clearTimeout(scrollTimeout)
    
    // Back to auto-rotate after scroll stop
    scrollTimeout = setTimeout(() => {
      isScrolling = false
      scrollRotation = 0
    }, 1000)
  })

  // responsive
  window.addEventListener("resize", () => {
    const w = container.clientWidth
    const h = 420

    renderer.setSize(w, h)

    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
}