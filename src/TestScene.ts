import {Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Audio} from 'three';
import * as THREE from 'three';
import {degToRad} from 'three/src/math/MathUtils';
import {Droid} from './Droid';
import {Lightsaber} from './Lightsaber';
import {Player} from './Player';
import {Interface} from './Interface';

export class TestScene extends Scene {
    camera;
    lightsaber;
    droids;
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
    firesound;

    health = 100;


    constructor() {
        super();
        // this.bolts = [];
        // renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(innerWidth, innerHeight);

        // camera
        this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 0);
        this.add(this.camera);

        // audio
        
        this.audioloader = new THREE.AudioLoader();
        this.listener = new THREE.AudioListener();
        this.audio = new THREE.Audio( this.listener );
        this.firesound = this.audioloader.loadAsync('/audio/blaster audio.mp3');
        

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
        this.wave = 0;

        this.lightsaber = new Lightsaber();
        this.lightsaber.position.set(0.1, -0.5, -0.5);

        const axesHelper = new THREE.AxesHelper( 5 );
        this.add( axesHelper );
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

    

    updateDroids(delta) {
        if(this.droids.size==0) {
            this.wave++;
            document.getElementById('wave-count')!.innerHTML = this.wave.toString();
            for(let i = 0;i<this.wave;i++) {
                const newdroid = new Droid(this.hearts);
                this.droids.add(newdroid);
                this.player.addObject(newdroid);
                this.add(newdroid);
                
                this.setRandomInterval(() => {
                const target = this.camera.position.clone();
                target.y -= 0.25;
                this.droidfire(newdroid, target);}, 2000, 10000);
            }
        }
        else {
            for(let droid of this.droids) {
                if(droid.lives < 1){
                    this.remove(droid);
                    this.droids.delete(droid);
                }
                else {
                    droid.moveDroid(delta, this.camera.position);
                }
            }
        }
    }
    // fire(target) {
    //     const geometry = new THREE.CapsuleGeometry(0.05, 0.8);
    //     geometry.rotateX(degToRad(90));
    //     const material = new MeshBasicMaterial({color: 'red'});
    //     console.log(this.droids);
    //     for(let droid of this.droids) {
    //         const bolt = new Mesh(geometry, material);
    //         bolt.name = "bolt";
    //         bolt.position.copy(droid.position);
    //         console.log("running");
    //         this.add(bolt);
    //         console.log(bolt);
    //         bolt.lookAt(target);
    //         this.bolts.push(bolt);
    //         this.playSound(this.firesound,false,0.2);
    //     }
    // }

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
        this.playSound(this.firesound,false,0.2);
        
    }

    playSound(sound, loop, volume) {
        sound.then((buffer) => {
            const player = new Audio(this.listener);
            console.log("loggg");
            player.setBuffer(buffer);
            player.setLoop(loop);
            player.setVolume(volume);
            player.play();
        })
    }

    update(delta: number) {
        this.lightsaber.update(delta);
        this.updateBolts(delta, this.camera.position, this.clock.getElapsedTime(), this.bolts);
        this.player.update(delta);
        this.updateDroids(delta);
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
                    const overlay = new Interface();
                    overlay.renderHealthbar(this.health / 100);
                    const darkMaterial = new MeshBasicMaterial( { color: 'grey' } );
                    if(this.index>=this.hearts.length)
                        break;
                    this.hearts[this.index++].material = darkMaterial;
                    this.remove(bolt);
                    bolts.splice(i, 1);
                }

                for(let droid of this.droids) {
                    const droiddist = droid.position.clone().sub(boltPosition).length();
                    if(bolt.name==="deflectedbolt" && droiddist<0.25){
                        droid.lives--;
                        this.remove(bolt);
                        bolts.splice(i, 1);
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

    handleMouseDown() {
        this.lightsaber.handleMouseDown();
        for(let droid of this.droids) {
            droid.handleMouseDown(this.camera.position, this.lightsaber.on, this.bolts);
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
}