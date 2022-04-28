import {CapsuleGeometry, Group, Mesh, MeshBasicMaterial, Object3D, Vector3, Box3} from 'three';
import {degToRad} from 'three/src/math/MathUtils';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

export class Droid extends Group {
    bolts: Object3D[] = [];
    hitbox;
    index: number;
    hearts;

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
    }

    update(delta: number) {
        let i = 0;
        while (i < this.bolts.length) {
            const bolt = this.bolts[i];
            const distance = bolt.position.length();
            const worldBound = 100;
            if (distance <= worldBound) {
                const speed = 5;
                bolt.translateZ(speed * delta);
                // check if it gets hit
                const bbox = new Box3().setFromObject(this.hitbox);
                if(bbox.containsPoint(bolt.position)) {
                    // if hits hearts decrease kill object
                    const darkMaterial = new MeshBasicMaterial( { color: 'grey' } );
                    if(this.index>=this.hearts.length)
                        break;
                    console.log("hit");
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
        this.add(bolt);
        bolt.lookAt(target);
        this.bolts.push(bolt);
    }

    handleMouseDown(playerPosition) {
        let i = 0;
        while (i < this.bolts.length) {
            const bolt = this.bolts[i];
            const boltPosition = bolt.getWorldPosition(new Vector3());
            const distance = playerPosition.clone().sub(boltPosition).length();
            const deflectThreshold = 0.5;
            if (distance <= deflectThreshold) {
                bolt.rotateX(degToRad(180));
            }
            i++;
        }
    }
}