

import {CapsuleGeometry, Group, Mesh, MeshBasicMaterial, Object3D, Vector3, Color, Audio, AudioLoader} from 'three';
import {degToRad, lerp, smootherstep} from 'three/src/math/MathUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'


export class Lightsaber extends Group {
    mesh;
    swinging = false;
    swingState = 0;
    swingDuration = 0.3;
    hilt;
    blade;
    on = false;
    toggling = false;
    onaudio;
    offaudio;
    colors;
    index = 0;
    colorswapwait = 0;
    sith =false;

    constructor() {
        super();
        // const geometry = new CylinderGeometry(0.025, 0.025, 1.5, 16);
        const geometry = new CapsuleGeometry(0.025, 1.5);

        this.colors = [0x2E67F8, 0xEB212E, 0x7851a9, 0x2FF923, 0xffc0cb, 0x808000, 0xD2B48C];
        // const material = new MeshBasicMaterial({wireframe: true});
        const material = new MeshBasicMaterial( {

            color: 0x2E67F8,
        
        } );
        // this.mesh = new Mesh(geometry, material);
        const loader = new GLTFLoader();

        this.mesh = new Group();
        this.name = 'LightSaber';
        loader.load('models/obi-wan_kenobi_lightsaber/scene.gltf', (gltf) => {
            gltf.scene.scale.divideScalar(50);
            // gltf.scene.scale.y *= 30;
            gltf.scene.rotateY(degToRad(60));
            gltf.scene.rotateZ(degToRad(10));

            gltf.scene.rotation.x = degToRad(6.5);
            gltf.scene.position.z -= 0.005;
            gltf.scene.position.y -= 0.1;

            // console.log(gltf.scene.worldToLocal(new Vector3(1,0,0)));
            // console.log(gltf.scene.rotation);
            this.hilt = gltf.scene.clone();
            this.mesh.add(this.hilt);
        
        });
        

        this.blade = new Mesh(geometry, material);
        this.blade.position.y -= 0.5;
        this.blade.position.z += 0.01;
        this.blade.name = "blade";
        this.blade.visible = false;
        // on position  y = 1
        // off position y = -0.5;
        console.log(this.blade.position);

        this.mesh.add(this.blade);
        this.add(this.mesh);
        const audioLoader = new AudioLoader();
        this.onaudio = audioLoader.loadAsync("audio/lightsabwr on.m4a");
        this.offaudio = audioLoader.loadAsync("audio/lightsabwr off.m4a");
        
    }

    update(delta: number) {
        if (this.swinging) {
            this.swingState += delta / this.swingDuration;
            this.swingState = Math.min(this.swingState, 1);
            let s;
            if (this.swingState <= 0.5) {
                s = 2 * this.swingState;
            } else {
                s = 2 * (1 - this.swingState);
            }
            const t = smootherstep(s, 0, 1);
            // lowerbound is hardcoded value to make saber and hilt aligned
            const rotationX = lerp(degToRad(0), degToRad(-120), t);
            this.mesh.rotation.x = rotationX;
            if (this.swingState === 1) {
                this.swinging = false;
                this.swingState = 0;
            }
        }
        if (this.toggling) {
            let sign = 1.5;
            if(this.on===false)
                sign = -1.5;
            this.blade.translateY(delta*sign);
            if(this.on===false && this.blade.position.y <= -0.5)
                this.toggling = false;
            if(this.on===true && this.blade.position.y >= 1)
                this.toggling = false;

        }
        if(this.blade.position.y<=-0.5) this.blade.visible = false;
        else this.blade.visible=true;
        let saberhue = {};
        this.blade.material.color.getHSL(saberhue);
        if((saberhue.h >= 0 && saberhue.h <= 20/360) || (saberhue.h >= 330/360 && saberhue.h <=1)) {
            console.log("welcome to the darkside");
            this.sith = true;
            // console.log(saberhue);
        }
        else {
            this.sith = false;
        }
    }

    toggleLightsaber(listener){
        if(!this.toggling) {
            this.toggling = true;
            this.on = !this.on;
            if(this.on) {
                this.playSound(this.onaudio, false, 0.2, listener);
            }
            else {
                this.playSound(this.offaudio, false, 0.1, listener);
            }
        }
    }

    playSound(sound, loop, volume, listener) {
        sound.then((buffer) => {
            const player = new Audio(listener);
            player.setBuffer(buffer);
            player.setLoop(loop);
            player.setVolume(volume);
            player.play();
        })
    }

    handleMouseDown() {
        if (!this.swinging) {
            this.swinging = true;
        }
    }

    swapColor() {
        // this.blade.material.color = new Color(this.colors[++this.index]);
        // if(this.index > this.colors.length - 1)
        //     this.index = 0;
        let offset = 1/256/2;
        this.blade.material.color.offsetHSL(offset,0,0);
    }
}