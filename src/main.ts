import {TestScene} from './TestScene';
import './style.css';
import {Clock, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new TestScene();
const camera = scene.camera;

const controls = new OrbitControls(camera, renderer.domElement);

const app = document.getElementById('app')!;
app.appendChild(renderer.domElement);

const clock = new Clock();

const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    controls.update();
    scene.update();
    renderer.render(scene, camera);
};

animate();