import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { PointerLockControls } from 'https://threejs.org/examples/jsm/controls/PointerLockControls.js';
import * as CANNON from 'https://cdnjs.cloudflare.com/ajax/libs/cannon-es/0.17.1/cannon-es.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
const playerBody = new CANNON.Body({ mass: 80, shape: new CANNON.Sphere(1.2) });
playerBody.position.set(0, 5, 0);
world.addBody(playerBody);

const keyState = {};
document.addEventListener('keydown', (e) => keyState[e.code] = true);
document.addEventListener('keyup', (e) => keyState[e.code] = false);

function updateMovement() {
    const moveSpeed = 2;
    if (keyState['KeyW']) playerBody.velocity.z = -moveSpeed;
    if (keyState['KeyS']) playerBody.velocity.z = moveSpeed;
    if (keyState['KeyA']) playerBody.velocity.x = -moveSpeed;
    if (keyState['KeyD']) playerBody.velocity.x = moveSpeed;
    camera.position.lerp(playerBody.position, 0.1);
}

const bullets = [];
document.addEventListener('mousedown', () => {
    const bulletGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(camera.position);
    scene.add(bullet);
    bullets.push({ mesh: bullet, velocity: camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2) });
});

function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);
    updateMovement();
    bullets.forEach((b, index) => {
        b.mesh.position.add(b.velocity);
        if (b.mesh.position.length() > 50) { scene.remove(b.mesh); bullets.splice(index, 1); }
    });
    renderer.render(scene, camera);
}
animate();