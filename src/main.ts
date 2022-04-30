import {Clock} from 'three';
import {TestScene} from './TestScene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as THREE from 'three';
import 'bootstrap/dist/css/bootstrap.css';
import '@fontsource/oswald';
import './style.css';

const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {};

const params = {
    exposure: 1,
    bloomStrength: 2,
    bloomThreshold: 0,
    bloomRadius: 0
};

const scene = new TestScene();
const camera = scene.camera;


const renderer = scene.renderer;
// const controls = new OrbitControls(camera, renderer.domElement);

const app = document.getElementById('app')!;
app.appendChild(renderer.domElement);

const clock = new Clock();

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );


const finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        defines: {}
    } ), 'baseTexture'
);
finalPass.needsSwap = true;

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );


const render = () => {
    renderBloom();

    // render the entire scene, then render bloom scene on top
    
    finalComposer.render();
}

function renderBloom () {
    scene.traverse( darkenNonBloomed );
    bloomComposer.render();
    scene.traverse( restoreMaterial );
}
const animate = () => {
    requestAnimationFrame(animate);
    // controls.update();
    scene.update(clock.getDelta());
    // renderer.render(scene, camera);
    render();

    // bloomComposer.render();
};


const handleResize = () => {
    renderer.setSize(innerWidth, innerHeight);
    bloomComposer.setSize(innerWidth, innerHeight);
    finalComposer.setSize( innerWidth, innerHeight );
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};

addEventListener('resize', handleResize);
addEventListener('mousedown', scene.handleMouseDown);




function darkenNonBloomed( obj ) {

    if ( obj.name !== "blade" && obj.name !== "bolt" && obj.name !== "deflectedbolt") {

        materials[ obj.uuid ] = obj.material;
        obj.material = darkMaterial;
        
    }
    else {
        // console.log(obj);
    }

}

function restoreMaterial( obj ) {
    
    if ( materials[ obj.uuid ] ) {
        
        obj.material = materials[ obj.uuid ];
        delete materials[ obj.uuid ];
        
    }
    
}

document.getElementById('start-button')!.addEventListener('click', () => {
    document.getElementById('app')!.style.display = 'initial';
    animate();
});