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
    hearts;
    listener;
    audioloader;
    audio;
    clock;

    constructor() {
        super();

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
        const audio = new THREE.Audio( this.listener );
        const firesound = this.audioloader.loadAsync('/audio/blaster audio.mp3');
        

        const resolution = "1K";
        const material = this.loadMaterial_("Rock035_"+resolution+"-PNG/Rock035_"+resolution+"_",2);
        

        const planeGeometry = new PlaneGeometry(400, 400, 50, 50);
        const plane = new Mesh(planeGeometry, material);
        // console.log(plane.position);
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
        
        for(let i = 0;i<3;i++) {
            const heart = this.createHeart();
            heart.scale.divideScalar(600);
            heart.rotateZ(degToRad(180));
            heart.position.set(-0.35 - i*(0.05), 0.35, -0.5)
            this.hearts.push(heart);
            this.camera.add(heart);
        }

        this.droid = new Droid(hitbox, this.hearts);
        this.add(this.droid);
        this.droid.position.set(0, 6, 0);

        setInterval(() => {
            const target = this.camera.position.clone();
            target.y -= 0.25;
            // this.playSound(firesound,false,0.2);
            this.audioloader.load('/audio/blaster audio.mp3', function( buffer ) {
                audio.pause();
                audio.setBuffer( buffer );
                audio.setLoop( false );
                audio.setVolume( 0.5 );
                audio.play();
            });
            // console.log("fired");
            this.droid.fire(target);
        }, 3000);

        this.lightsaber = new Lightsaber();
        this.lightsaber.position.set(0.1, -0.5, -0.5);
        // this.lightsaber.position.set(0, 2, 0);

        const axesHelper = new THREE.AxesHelper( 5 );
        this.add( axesHelper );
        // this.lightsaber.rotation.set(degToRad(10), degToRad(60), degToRad(-20), 'XZY');
        this.lightsaber.rotation.set(degToRad(10), degToRad(60), degToRad(-20), 'XZY');

        this.camera.add(this.lightsaber);

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.initializeLights_();
        this.player = new Player(this.camera, [this.lightsaber, plane, this.droid], this.lightsaber);
        this.clock = new THREE.Clock();
        this.clock.start();
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
    // const distance = 50.0;
    // const angle = Math.PI / 4.0;
    // const penumbra = 0.5;
    // const decay = 1.0;

    // let light = new THREE.SpotLight(0xffffff, 40.0, distance, angle, penumbra, decay);
    // // let light = new THREE.SpotLight(0xffffff, 15.0, distance, angle, penumbra, decay);
    // light.castShadow = true;
    // light.shadow.bias = -0.00001;
    // light.shadow.mapSize.width = 4096;
    // light.shadow.mapSize.height = 4096;
    // light.shadow.camera.near = 1;
    // light.shadow.camera.far = 100;

    // light.position.set(0, 40, 0);
    // light.lookAt(0, 0, 0);
    // this.add(light);

    // const upColour = 0xFFFF80;
    // const downColour = 0x808080;
    // let light2 = new THREE.HemisphereLight(upColour, downColour, 0.5);
    // // light2.color.setHSL( 0.6, 1, 0.6 );
    // // light2.groundColor.setHSL( 0.095, 1, 0.75 );
    // light2.position.set(0, 4, 0);
    // this.add(light2);
        const light = new THREE.PointLight( 0xffffff, 20, 90 );
        light.position.set( 0, 50, 0 );
        this.add( light );

        // const light2 = new THREE.PointLight( 0xffffff, 20, 100 );
        // light2.position.set( 50, -50, 50 );
        // this.add( light2 );
        // const light3 = new THREE.PointLight( 0xffffff, 20, 100 );
        // light3.position.set( 50, -50, -50 );
        // this.add( light3 );

        // const light4 = new THREE.PointLight( 0xffffff, 20, 100 );
        // light4.position.set( 50, 50, -50 );
        // this.add( light4 );

        const ambient = new THREE.AmbientLight( 0xffffff ); 
        this.add( ambient ); 

    }

    
    // playSound(sound, loop, volume) {
    //     sound.then((buffer) => {
    //         console.log("loggg");
    //         this.audio.setBuffer(buffer);
    //         this.audio.setLoop(loop);
    //         this.audio.setVolume(volume);
    //         this.audio.pause();
    //         this.audio.play();
    //     })
    // }

    // playSound(soundpath, loop, volume) {

    // }

    update(delta: number) {
        this.lightsaber.update(delta);
        this.droid.update(delta, this.camera.position, this.clock.getElapsedTime());
        this.droid.moveDroid(delta, this.camera.position);
        this.player.update(delta);
    }

    handleMouseDown() {
        this.lightsaber.handleMouseDown();
        this.droid.handleMouseDown(this.camera.position, this.lightsaber.on);
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