import {Clock, WebGLRenderer} from 'three';
import './style.css';
import {TestScene} from './TestScene';


const scene = new TestScene();
const camera = scene.camera;

const renderer = scene.renderer;
// const controls = new OrbitControls(camera, renderer.domElement);

const app = document.getElementById('app')!;
app.appendChild(renderer.domElement);

const clock = new Clock();


const animate = () => {
    requestAnimationFrame(animate);
    // controls.update();
    scene.update(clock.getDelta());
    renderer.render(scene, camera);
};

animate();

const handleResize = () => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};

addEventListener('resize', handleResize);
addEventListener('mousedown', scene.handleMouseDown);