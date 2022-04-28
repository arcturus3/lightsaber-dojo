

import {CapsuleGeometry, Group, Mesh, MeshBasicMaterial, Object3D, Vector3, MeshStandardMaterial} from 'three';
import {degToRad, lerp, smootherstep} from 'three/src/math/MathUtils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

export class Lightsaber extends Group {
    mesh;
    swinging = false;
    swingState = 0;
    swingDuration = 0.5;

    constructor() {
        super();
        // const geometry = new CylinderGeometry(0.025, 0.025, 1.5, 16);
        const geometry = new CapsuleGeometry(0.025, 1.5);

        // const material = new MeshBasicMaterial({wireframe: true});
        const material = new MeshBasicMaterial( {

            color: 0x2E67F8,
        
        } );
        // this.mesh = new Mesh(geometry, material);
        const loader = new GLTFLoader();

        this.mesh = new Group();
        this.name = 'LightSaber';
        loader.load('/models/obi-wan_kenobi_lightsaber/scene.gltf', (gltf) => {
            gltf.scene.scale.divideScalar(50);
            // gltf.scene.scale.y *= 30;
            gltf.scene.rotateY(degToRad(60));
            gltf.scene.rotateZ(degToRad(10));

            gltf.scene.rotation.x = degToRad(6.5);
            gltf.scene.position.z -= 0.005;
            gltf.scene.position.y -= 0.1;

            // console.log(gltf.scene.worldToLocal(new Vector3(1,0,0)));
            // console.log(gltf.scene.rotation);
            this.mesh.add(gltf.scene);
        
        });
        

        const blade = new Mesh(geometry, material);
        blade.position.y += 1;
        blade.position.z += 0.01;
        blade.name = "blade";

        this.mesh.add(blade);
        this.add(this.mesh);
        
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
    }

    handleMouseDown() {
        if (!this.swinging) {
            this.swinging = true;
        }
    }
}