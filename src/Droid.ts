import {CapsuleGeometry, Group, Mesh, MeshBasicMaterial, Object3D, Vector3, Audio, AudioLoader} from 'three';
import {degToRad} from 'three/src/math/MathUtils';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { Interface } from './Interface';
import {setdroidobject} from './global'


export class Droid extends Group {
    difficulty;
    health = 100;
    target;
    lives;
    waitTime;
    waitDuration;
    moveaudio;
    vtdt = 0;
    deadtime = 0;
    axis;

    constructor() {
        super();
        // todo
        // var droidOBJ = 'models/jedi-training-droid/mesh.obj';
        // var droidMTL = 'models/jedi-training-droid/texture.mtl';    
        // const mtlLoader = new MTLLoader();
        // const objLoader = new OBJLoader();
        // var temp = new Object3D();
        // mtlLoader.load(droidMTL, function(materials) {
        //     materials.preload();
        //     objLoader.setMaterials(materials);
        //     objLoader.load(droidOBJ,  (object) => {
        //         object.scale.divideScalar(20);
        //         temp.copy( object, true);
        //     }); 
        // });
        let temp = setdroidobject();
        this.add(temp);
        this.name = "training-droid";
        this.difficulty = 1;
        this.target = new Vector3();
        this.lives = 1;
        this.position.copy(this.randomdroidpos(25,new Vector3(0,4,0)));
        this.waitTime = 0;
        const audioLoader = new AudioLoader();
        this.moveaudio = audioLoader.loadAsync("audio/droid movement.m4a");
        this.axis = new Vector3(Math.random(), 0, Math.random()+1).normalize();
    }

    moveDroid(delta, playerPosition, listener) {
        const distance = playerPosition.clone().sub(this.position).length();
        const targetdistance = playerPosition.clone().sub(this.target).length();
        const shootingdistance = 15;
        if(distance > shootingdistance) {
            this.target.copy(playerPosition);
            this.lookAt(this.target);
            // this.translateZ(10*delta);
            this.translateOnAxis(this.axis, 10*delta);
            this.waitTime = 0;
        }
        else if(targetdistance > 0.5){
            // this.translateZ(7*delta);
            this.translateOnAxis(this.axis, 10*delta);
            this.waitTime = 0;
            this.waitDuration = (Math.random()*6)+4;
        }
        else{
            this.waitTime += delta;
            if(this.waitTime > this.waitDuration){
                this.target.copy(this.randomdroidpos(shootingdistance,playerPosition));
                this.lookAt(this.target);
                // this.translateZ(7*delta);
                this.translateOnAxis(this.axis, 10*delta);
                console.log("moving");
                this.waitTime = 0;
                this.playSound(this.moveaudio, false, 0.2, listener);
                this.axis = new Vector3(Math.random(), 0, Math.random()+1).normalize();
            }
        }
    }


    // uhh goes through the floor sometimes...
    randomdroidpos(shootingdistance:number, playerPosition) {
        const ylower = 4;
        const yupper = 10;
        const ret = new Vector3((Math.random()*2 )- 1,(Math.random()*2 )- 1,(Math.random()*2 )- 1).normalize();
        ret.multiplyScalar(shootingdistance);
        ret.add(playerPosition);
        ret.y = this.clamp(ret.y, ylower, yupper);
        // console.log(ret.y);
        return ret;
    }

    clamp(x, a, b) {
        return Math.min(Math.max(x, a), b);
    }
    handleMouseDown(playerPosition, lightsaberon, bolts) {
        let i = 0;
        let ret = false;
        while (i < bolts.length) {
            const bolt = bolts[i];
            const boltPosition = bolt.getWorldPosition(new Vector3());
            const distance = playerPosition.clone().sub(boltPosition).length();
            const deflectThreshold = 2;
            console.log(lightsaberon);
            if (distance <= deflectThreshold && lightsaberon && distance >= 1 && bolt.name === "bolt") {
                bolt.rotateX(degToRad(180));
                bolt.name = "deflectedbolt";
                console.log("deflected!");
                ret = true;
                
            }
            i++;
        }
        return ret;
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
}