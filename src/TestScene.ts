import {Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene} from 'three';
import * as THREE from 'three';
import {degToRad} from 'three/src/math/MathUtils';
import {Droid} from './Droid';
import {Lightsaber} from './Lightsaber';
import {Player} from './Player';

export class TestScene extends Scene {
    camera;
    lightsaber;
    droid;
    player;
    renderer; 

    constructor() {
        super();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(innerWidth, innerHeight);

        this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 0);
        this.add(this.camera);

        const resolution = "1K";
        const material = this.loadMaterial_("Rock035_"+resolution+"-PNG/Rock035_"+resolution+"_",2);

        const planeGeometry = new PlaneGeometry(100, 100, 50, 50);
        const plane = new Mesh(planeGeometry, material);
        plane.rotation.x = degToRad(-90);
        this.add(plane);

        this.droid = new Droid();
        this.add(this.droid);
        this.droid.position.set(0, 6, 0);
        setInterval(() => {
            this.droid.fire(this.camera.position);
        }, 3000);
        this.droid.fire(this.camera.position);

        this.lightsaber = new Lightsaber();
        this.lightsaber.position.set(0.1, -0.5, -0.5);
        this.lightsaber.rotation.set(degToRad(10), degToRad(60), degToRad(-20), 'XZY');
        this.camera.add(this.lightsaber);

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.initializeLights_();
        this.player = new Player(this.camera, [this.lightsaber, plane, this.droid]);
    }


loadMaterial_(name:String, tiling:number) {
    const mapLoader = new THREE.TextureLoader();
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const color =  mapLoader.load('textures/' + name + 'Color.png');
    color.anisotropy = maxAnisotropy;
    color.wrapS = THREE.RepeatWrapping;
    color.wrapT = THREE.RepeatWrapping;
    color.repeat.set(tiling, tiling);
    color.encoding = THREE.sRGBEncoding;

    const normalMap =  mapLoader.load('textures/' + name + 'NormalGL.png');
    normalMap.anisotropy = maxAnisotropy;
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(tiling, tiling);

    const roughnessMap =  mapLoader.load('textures/' + name + 'Roughness.png');
    roughnessMap.anisotropy = maxAnisotropy;
    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(tiling, tiling);

    const aoMap =  mapLoader.load('textures/' + name + 'AmbientOcclusion.png');
    aoMap.anisotropy = maxAnisotropy;
    aoMap.wrapS = THREE.RepeatWrapping;
    aoMap.wrapT = THREE.RepeatWrapping;
    aoMap.repeat.set(tiling, tiling);
    
    const displacementMap =  mapLoader.load('textures/' + name + 'Displacement.png');
    displacementMap.anisotropy = maxAnisotropy;
    displacementMap.wrapS = THREE.RepeatWrapping;
    displacementMap.wrapT = THREE.RepeatWrapping;
    displacementMap.repeat.set(tiling, tiling);


    const material = new THREE.MeshStandardMaterial({
        map: color,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        aoMap: aoMap,
        displacementMap: displacementMap,
    });

    return material;
    }

  initializeLights_() {
    const distance = 50.0;
    const angle = Math.PI / 4.0;
    const penumbra = 0.5;
    const decay = 1.0;

    let light = new THREE.SpotLight(0xffffff, 15.0, distance, angle, penumbra, decay);
    light.castShadow = true;
    light.shadow.bias = -0.00001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 100;

    light.position.set(0, 40, 0);
    light.lookAt(0, 0, 0);
    this.add(light);

    const upColour = 0xFFFF80;
    const downColour = 0x808080;
    let light2 = new THREE.HemisphereLight(upColour, downColour, 0.5);
    // light2.color.setHSL( 0.6, 1, 0.6 );
    // light2.groundColor.setHSL( 0.095, 1, 0.75 );
    light2.position.set(0, 4, 0);
    this.add(light2);

    }

    update(delta: number) {
        this.lightsaber.update(delta);
        this.droid.update(delta);
        this.player.update(delta);
    }

    handleMouseDown() {
        this.lightsaber.handleMouseDown();
        this.droid.handleMouseDown(this.camera.position);
    }
}