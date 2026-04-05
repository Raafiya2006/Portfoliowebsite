import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById('bat-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  premultipliedAlpha: false
});
renderer.setSize(500, 500);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.background = null;
scene.environment = null;

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(0, 0, 12);

const ambient = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambient);

const purple = new THREE.DirectionalLight(0xc084fc, 5);
purple.position.set(5, 5, 5);
scene.add(purple);

const blue = new THREE.DirectionalLight(0x818cf8, 3);
blue.position.set(-5, -2, 3);
scene.add(blue);

const white = new THREE.DirectionalLight(0xffffff, 2);
white.position.set(0, 0, 10);
scene.add(white);

let bat, mixer;
const loader = new GLTFLoader();

loader.load(
  'bat.glb',
  (gltf) => {
    bat = gltf.scene;

    // Strip ALL backgrounds and environment maps
    bat.traverse((child) => {
      if (child.isMesh) {
        child.material.envMap = null;
        child.material.needsUpdate = true;
      }
    });

    // Auto fit bat to screen
    const box = new THREE.Box3().setFromObject(bat);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;
    bat.scale.set(scale, scale, scale);

    // Center it perfectly
    const center = box.getCenter(new THREE.Vector3());
    bat.position.x = -center.x * scale;
    bat.position.y = -center.y * scale;
    bat.position.z = -center.z * scale;

    scene.add(bat);

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(bat);
      mixer.clipAction(gltf.animations[0]).play();
    }

    console.log('🦇 Bat loaded!');
  },
  undefined,
  (error) => console.error('Error:', error)
);

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  if (bat) {
    bat.position.y += (Math.sin(elapsed * 1.2) * 0.3 - bat.position.y) * 0.05;
    bat.rotation.y += 0.008;
    bat.rotation.x += (mouseY * 0.2 - bat.rotation.x) * 0.05;
  }

  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}

animate();