import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const HeroScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    particles: THREE.Points;
    venueMaterial: THREE.MeshStandardMaterial;
    dispose: () => void;
  } | null>(null);

  const [darkMode, setDarkMode] = useState(false); // Toggle state

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    camera.position.set(0, 0, 50);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Particle background
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const positionArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positionArray[i] = (Math.random() - 0.5) * 2000;
      colorArray[i] = 0.6 + Math.random() * 0.4; // Light color
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 3,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Globe / Venue Mesh
    const venueGeometry = new THREE.SphereGeometry(20, 64, 64);
    const venueMaterial: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Initially white
      metalness: 0.3,
      roughness: 0.4,
      wireframe: true,
    });
    const venueMesh = new THREE.Mesh(venueGeometry, venueMaterial);
    scene.add(venueMesh);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.x += 0.0001;
      particles.rotation.y += 0.0002;
      venueMesh.rotation.x += 0.001;
      venueMesh.rotation.y += 0.002;
      controls.update();
      renderer.render(scene, camera);
    };

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      particles,
      venueMaterial,
      dispose: () => {
        window.removeEventListener('resize', handleResize);
        containerRef.current?.removeChild(renderer.domElement);
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        venueGeometry.dispose();
        venueMaterial.dispose();
      }
    };

    return () => {
      sceneRef.current?.dispose();
    };
  }, []);

  // ✅ Toggle dark/light mode on globe click
  const handleToggle = () => {
    if (!sceneRef.current) return;

    setDarkMode((prev) => {
      const newMode = !prev;
      const venueMaterial = sceneRef.current?.venueMaterial;
      if (venueMaterial) {
        venueMaterial.color.set(newMode ? 0x000000 : 0xffffff); // globe color
      }
      containerRef.current!.style.backgroundColor = newMode ? "black" : "white";
      return newMode;
    });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full transition-colors duration-700"
      onClick={handleToggle} // ✅ Click anywhere on the scene to toggle
    />
  );
};

export default HeroScene;
