import {CapsuleGeometry, Group, Mesh, MeshBasicMaterial, Object3D, Vector3, Audio} from 'three';
import {degToRad} from 'three/src/math/MathUtils';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

export class Droid extends Group {
    bolts: Object3D[] = [];
    hitbox;
    index: number;
    hearts;
    difficulty;

    constructor(playerhitbox:Mesh, hearts) {
        super();
        var droidOBJ = 'models/jedi-training-droid/mesh.obj';
        var droidMTL = 'models/jedi-training-droid/texture.mtl';    
        const mtlLoader = new MTLLoader();
        const objLoader = new OBJLoader();
        var temp = new Object3D();
        mtlLoader.load(droidMTL, function(materials) {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load(droidOBJ,  (object) => {
                object.scale.divideScalar(20);
                temp.copy( object, true);
            }); 
        });
        this.add(temp);
        this.hitbox = playerhitbox;
        this.name = "training-droid";
        this.index = 0;
        this.hearts = hearts;
        this.difficulty = 1;
    }

    update(delta: number, playerPosition: Vector3, elapsedtime: number) {
        let i = 0;
        while (i < this.bolts.length) {
            const bolt = this.bolts[i];
            const distance = bolt.position.length();
            const worldBound = 100;
            if (distance <= worldBound) {
                const speed = 10;
                bolt.translateZ(speed * delta);
                // check if it gets hit
                // const bbox = new Box3().setFromObject(this.hitbox);
                const boltPosition = bolt.getWorldPosition(new Vector3());
                const distance = playerPosition.clone().sub(boltPosition).length();
                if(distance < 0.75) {
                    // console.log(bbox);
                    console.log("hit");
                    // if hits hearts decrease kill object
                    const darkMaterial = new MeshBasicMaterial( { color: 'grey' } );
                    if(this.index>=this.hearts.length)
                        break;
                    this.hearts[this.index++].material = darkMaterial;
                    this.remove(bolt);
                    this.bolts.splice(i, 1);
                }
                i++; 
            } else {
                // dispose of geometry and material or share these among all bolts?
                this.remove(bolt);
                this.bolts.splice(i, 1);
            }
        }
    }

    fire(target: Vector3) {
        const geometry = new CapsuleGeometry(0.05, 0.8);
        geometry.rotateX(degToRad(90));
        const material = new MeshBasicMaterial({color: 'red'});
        const bolt = new Mesh(geometry, material);
        bolt.name = "bolt";
        this.add(bolt);
        bolt.lookAt(target);
        this.bolts.push(bolt);
        
    }

    moveDroid(delta, playerPosition) {
        // const distance = playerPosition.clone().sub(this.position).length();
        // if(distance > 15) {
        //     this.lookAt(playerPosition);
        //     this.translateZ(7*delta);
        // }
        // else {
        //     // const direction = new Vector3(Math.cos(delta), Math.sin(delta), 0).normalize();
        //     // this.translateOnAxis(direction, 15*delta);
        // }
        // if(this.position.y<1) {
        //     const direction = new Vector3(0,1, 0).normalize();
        //     this.translateOnAxis(direction, 10*delta);
        // }
    }

    handleMouseDown(playerPosition, lightsaberon) {
        let i = 0;
        while (i < this.bolts.length) {
            const bolt = this.bolts[i];
            const boltPosition = bolt.getWorldPosition(new Vector3());
            const distance = playerPosition.clone().sub(boltPosition).length();
            const deflectThreshold = 2;
            console.log(lightsaberon);
            if (distance <= deflectThreshold && lightsaberon) {
                bolt.rotateX(degToRad(180));
                console.log("deflected!");
            }
            i++;
        }
    }
}