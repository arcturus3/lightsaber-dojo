
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { Object3D } from 'three';
var droidOBJ = 'models/jedi-training-droid/mesh.obj';
var droidMTL = 'models/jedi-training-droid/texture.mtl';    
const mtlLoader = new MTLLoader();
const objLoader = new OBJLoader();

let droidcache = null;

export function setdroidobject() {
    if(droidcache === null) {
        let droidobject = new Object3D();

        mtlLoader.load(droidMTL, function(materials) {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.load(droidOBJ,  (object) => {
                object.scale.divideScalar(20);
                droidobject.copy( object, true);
                droidcache = object;
            }); 
        });


        return droidobject;

    } else{
        return droidcache.clone();
    }
}

