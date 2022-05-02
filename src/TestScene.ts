import {Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Audio, PositionalAudio} from 'three';
import * as THREE from 'three';
import {degToRad} from 'three/src/math/MathUtils';
import {Droid} from './Droid';
import {Lightsaber} from './Lightsaber';
import {Player} from './Player';
import {Interface} from './Interface';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import {PositionalAudioHelper} from 'three/examples/jsm/helpers/PositionalAudioHelper';
import {stopAnimation} from './main';
export class TestScene extends Scene {
    camera;
    lightsaber;
    droids;
    deaddroids;
    droidToIntervals;
    wave;
    player;
    renderer; 
    
    listener;
    audioloader;
    audio;
    clock;
    bolts = [];

    // for healthbar
    hearts;
    index;
    sounds;
    lightsaberambient;
    walksound;

    health = 100;


    constructor() {
        super();
        // renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(innerWidth, innerHeight);

        // cameraP
        this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 0);
        this.add(this.camera);

        // audio
        
        this.audioloader = new THREE.AudioLoader();
        this.listener = new THREE.AudioListener();
        this.audio = new THREE.Audio( this.listener );

        this.sounds = this.loadAVSounds(this.audioloader);

        this.lightsaberambient = this.generateAudio(this.sounds.AMBIENT, true, 0.2);
        this.walksound = this.generateAudio(this.sounds.MOVE, true, 1);
        // this.playSound(this.sounds.MOVE,true,0.2);
        this.lightsaberambient.play();
        this.walksound.play();
        // console.log(this.lightsaberambient.isPlaying);

        console.log(this.lightsaberambient.isPlaying);

        this.playSound(this.sounds.COPYRIGHTBACKGROUND, true,0.1);

        // this.lightsaberambient.stop();
        // this.lightsaberambient.play();
        // this.playSound(this.sounds.AMBIENT, true, 0.2);
        // console.log(this.lightsaberambient);
        // this.lightsaberambient.play();
        

        const resolution = "4K";
        console.log(resolution);
        const material = this.loadMaterial_("Rock035_"+resolution+"-PNG/Rock035_"+resolution+"_",2);
        

        const planeGeometry = new PlaneGeometry(400, 400, 50, 50);
        const plane = new Mesh(planeGeometry, material);
        plane.position.set(0,-1, 0);
        plane.rotation.x = degToRad(-90);
        this.add(plane);


         // add hitbox and healthbar
        //  not being used rip
        const geometry = new THREE.BoxGeometry( 3, 18, 0.05 );
        const hitboxmat = new THREE.MeshBasicMaterial();
        const hitbox = new THREE.Mesh( geometry, hitboxmat );
        hitbox.position.set(0,0,1);
        hitbox.visible = false;
        hitbox.position.z = -4;
        this.camera.add(hitbox);

        this.hearts = [];
        this.index = 0;
        
        for(let i = 0;i<3;i++) {
            const heart = this.createHeart();
            heart.scale.divideScalar(600);
            heart.rotateZ(degToRad(180));
            heart.position.set(-0.35 - i*(0.05), 0.35, -0.5)
            this.hearts.push(heart);
            // this.camera.add(heart);
        }

        this.droids = new Set();
        this.deaddroids = new Set();
        this.droidToIntervals = {};
        this.wave = 0;

        this.lightsaber = new Lightsaber();
        this.lightsaber.position.set(0.1, -0.5, -0.5);

        // const axesHelper = new THREE.AxesHelper( 5 );
        // this.add( axesHelper );
        this.lightsaber.rotation.set(degToRad(10), degToRad(60), degToRad(-20), 'XZY');

        this.camera.add(this.lightsaber);

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.initializeLights_();
        this.player = new Player(this.camera, [this.lightsaber, plane], this.lightsaber);
        this.clock = new THREE.Clock();
        this.clock.start();
    }


// https://stackoverflow.com/questions/6962658/randomize-setinterval-how-to-rewrite-same-random-after-random-interval
   setRandomInterval = (intervalFunction, minDelay, maxDelay) => {
        let timeout;
      
        const runInterval = () => {
          const timeoutFunction = () => {
            intervalFunction();
            runInterval();
          };
      
          const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      
          timeout = setTimeout(timeoutFunction, delay);
        };
      
        runInterval();
      
        return {
          clear() { clearTimeout(timeout) },
        };
    };
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
        const light = new THREE.PointLight( 0xffffff, 10, 90 );
        light.position.set( 0, 50, 0 );
        this.add( light );

        const ambient = new THREE.AmbientLight( 0xffffff ); 
        this.add( ambient ); 

    }

    

    updateDroids(delta, listener) {
        if(this.droids.size==0) {
            this.wave++;
            document.getElementById('wave-count')!.innerHTML = this.wave.toString();
            for(let i = 0;i<this.wave;i++) {
                const newdroid = new Droid(this.hearts);
                this.droids.add(newdroid);
                this.player.addObject(newdroid);
                this.add(newdroid);
                
                this.droidToIntervals[newdroid.uuid] = this.setRandomInterval(() => {
                const target = this.camera.position.clone();
                target.y -= 0.25;
                this.droidfire(newdroid, target);}, 2000, 10000);
            }
        }
        else {
            for(let droid of this.droids) {
                if(droid.lives < 1){
                    // this.remove(droid);
                    this.droidToIntervals[droid.uuid].clear();
                    this.deaddroids.add(droid);
                    this.droids.delete(droid);
                    this.playSound(this.sounds.EXPLOSION,false, 0.3);
                    this.playSound(this.sounds.DROIDHIT,false, 0.15);
                }
                else {
                    // droid.moveDroid(delta, this.camera.position, listener);
                }
            }
        }
    }

    droidfire(droid, target) {
        const geometry = new THREE.CapsuleGeometry(0.05, 0.8);
        geometry.rotateX(degToRad(90));
        const material = new MeshBasicMaterial({color: 'red'});
        const bolt = new Mesh(geometry, material);
        bolt.name = "bolt";
        bolt.position.copy(droid.position);
        console.log("running");
        this.add(bolt);
        bolt.lookAt(target);
        this.bolts.push(bolt);
        
        this.playSound(this.sounds.BLASTER,false,0.2);
        
    }

    playSound(sound, loop, volume) {
        sound.then((buffer) => {
            const player = new Audio(this.listener);
            player.setBuffer(buffer);
            player.setLoop(loop);
            player.setVolume(volume);
            player.play();
        })
    }

    update(delta: number) {
        if(!this.lightsaber.on) {
            this.lightsaberambient.pause();
        }
        else {
            this.lightsaberambient.play();
        }
        this.lightsaber.update(delta);
        this.updateBolts(delta, this.camera.position, this.clock.getElapsedTime(), this.bolts);
        this.player.update(delta, this.sounds, this.listener,this.walksound);
        
        this.updateDroids(delta, this.listener);
        this.updateDeadDroids(delta);
    }

    updateBolts(delta: number, playerPosition: THREE.Vector3, elapsedtime: number, bolts) {
        let i = 0;
        while (i < bolts.length) {
            const bolt = bolts[i];
            const distance = bolt.position.length();
            const worldBound = 100;
            if (distance <= worldBound) {
                const speed = 15;
                bolt.translateZ(speed * delta);
                // check if it gets hit
                // const bbox = new Box3().setFromObject(this.hitbox);
                const boltPosition = bolt.getWorldPosition(new THREE.Vector3());
                const distance = playerPosition.clone().sub(boltPosition).length();
                
                if(distance < 0.75) {
                    // console.log(bbox);
                    console.log("hit");
                    // if hits hearts decrease kill object
                    this.health -= 25;
                    if (this.health <= 0) {
                        stopAnimation();
                        document.getElementById('app')!.style.display = 'none';
                        document.getElementById('start-screen')!.style.display = 'none';
                        document.getElementById('end-screen')!.style.display = 'initial';
                        document.getElementById('score')!.innerHTML = `${this.wave - 1} waves defeated`;
                        this.lightsaber.on = false;
                        this.lightsaberambient.pause();
                        for (const droid of this.droids) {
                            this.droidToIntervals[droid.uuid].clear();
                        }
                        document.exitPointerLock();
                        return;
                    }
                    const overlay = new Interface();
                    overlay.renderHealthbar(this.health / 100);
                    const darkMaterial = new MeshBasicMaterial( { color: 'grey' } );
                    if(this.index>=this.hearts.length)
                        break;
                    this.hearts[this.index++].material = darkMaterial;
                    this.remove(bolt);
                    const coin = Math.random();
                    if(coin<0.5)
                        this.playSound(this.sounds.HITARTI,false,0.15);
                    else    
                        this.playSound(this.sounds.HITVIC,false,0.15);
                    bolts.splice(i, 1);
                }

                for(let droid of this.droids) {
                    const droiddist = droid.position.clone().sub(boltPosition).length();
                    if(bolt.name==="deflectedbolt" && droiddist<0.25){
                        droid.lives--;
                        this.remove(bolt);
                        bolts.splice(i, 1);
                        // droid.material.color = new THREE.Color(1,0,0);
                        // const mat = droid.material.clone();
                        // mat.color = new THREE.Color(1,0,0);
                        // droid.material = mat;
                    }
                }
                
                i++; 
            } else {
                // dispose of geometry and material or share these among all bolts?
                this.remove(bolt);
                bolts.splice(i, 1);
            }
        }
    }

    updateDeadDroids(timeElapsedS) {
        // console.log(this.deaddroids);
        const EPS = 0.5;
        const GRAVITY = new THREE.Vector3(0,-1,0).multiplyScalar(9.8 * 90);
        const DAMPING = 0.03;
        const TIMESTEP = 2 / 1000;
        const scalar = 3.5;
        for(let droid of this.deaddroids) {
            const pos = droid.position;
            droid.deadtime += timeElapsedS;
            if(droid.deadtime > 5) {
                this.remove(droid);
                this.deaddroids.delete(droid);
            }
            if(pos.y < 0 + EPS) {
                pos.y = 0 + EPS;
            }
            else if (pos.y > 0 + EPS) {
                let at = GRAVITY
                let vtdt = new THREE.Vector3(0,1,0).multiplyScalar(droid.vtdt);
                let contribution = vtdt.clone().multiplyScalar(1-DAMPING).add(at.multiplyScalar(TIMESTEP*TIMESTEP));
                contribution.add(new THREE.Vector3(0,-1,0).multiplyScalar(Math.sin(droid.deadtime/5)/4));
                contribution.add(new THREE.Vector3(1,0,0).multiplyScalar(Math.sin(droid.deadtime/5)/4));
                droid.position.add(contribution);
                droid.vtdt -=  9.8 * TIMESTEP/scalar;
            }
        }
    }

    handleMouseDown() {
        this.lightsaber.handleMouseDown();
        let bool = false;
        for(let droid of this.droids) {
            bool = bool || droid.handleMouseDown(this.camera.position, this.lightsaber.on, this.bolts);
        }
        if(this.lightsaber.on) {
            if(bool){
                this.playSound(this.sounds.DEFLECT, false, 0.2);
            }
            this.playSound(this.sounds.SWING, false, 0.3);
         }
    }

    createHeart() {
        const x = 0, y = 0;

        const heartShape = new THREE.Shape();

        heartShape.moveTo( x + 5, y + 5 );
        heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
        heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
        heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
        heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
        heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
        heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

        const geometry = new THREE.ShapeGeometry( heartShape );
        const material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
        const mesh = new THREE.Mesh( geometry, material ) ;
        return mesh;
    }

    generateAudio(sound, loop, volume){
        const player = new Audio(this.listener);
        sound.then((buffer) => {
            
            player.setBuffer(buffer);
            player.setLoop(loop);
            player.setVolume(volume);
            player.play();
        })
        return player;
    }
    
    loadAVSounds(audioLoader){
        let ret =  {
        DEFLECT: audioLoader.loadAsync("audio/deflect.m4a"),
        DROIDMOV: audioLoader.loadAsync("audio/droid movement.m4a"),
        EXPLOSION: audioLoader.loadAsync("audio/explosion.m4a"),
        DROIDHIT: audioLoader.loadAsync("audio/droidhitgood.m4a"),
        HITARTI: audioLoader.loadAsync("audio/hitarti.m4a"),
        HITVIC: audioLoader.loadAsync("audio/hitvictor.m4a"),
        JUMP: audioLoader.loadAsync("audio/jump.m4a"),
        SWING: audioLoader.loadAsync("audio/lightsaberswing.mp3"),
        AMBIENT: audioLoader.loadAsync("audio/lightsabwr ambient.m4a"),
        ON: audioLoader.loadAsync("audio/lightsabwr on.m4a"),
        OFF: audioLoader.loadAsync("audio/lightsabwr off.m4a"),
        MOVE: audioLoader.loadAsync("audio/walk2.m4a"),
        BLASTER: audioLoader.loadAsync("audio/blaster audio.mp3"),
        BACKGROUND: audioLoader.loadAsync("audio/duelofthefates.mp3"),
        COPYRIGHTBACKGROUND:  audioLoader.loadAsync("audio/realduelofthefates.mp3")
        }
        return ret;
    }
}
