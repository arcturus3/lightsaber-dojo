import {Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene} from 'three';
import {degToRad} from 'three/src/math/MathUtils';
import {Droid} from './Droid';
import {Lightsaber} from './Lightsaber';

export class TestScene extends Scene {
    camera;
    lightsaber;
    droid;

    constructor() {
        super();

        this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        this.camera.position.y = 5;
        this.add(this.camera);

        const wireframeMaterial = new MeshBasicMaterial({wireframe: true});

        const planeGeometry = new PlaneGeometry(100, 100, 50, 50);
        const plane = new Mesh(planeGeometry, wireframeMaterial);
        plane.rotation.x = degToRad(-90);
        this.add(plane);

        this.droid = new Droid();
        this.add(this.droid);
        this.droid.position.set(-1, 2, -1);
        setInterval(() => {
            this.droid.fire(this.camera.position);
        }, 1000);

        this.lightsaber = new Lightsaber();
        this.lightsaber.position.set(0.1, -0.5, -0.5);
        this.lightsaber.rotation.set(degToRad(10), degToRad(60), degToRad(-20), 'XZY');
        this.camera.add(this.lightsaber);

        this.handleMouseDown = this.handleMouseDown.bind(this);
    }

    update(delta: number) {
        this.lightsaber.update(delta);
        this.droid.update(delta);
    }

    handleMouseDown() {
        this.lightsaber.handleMouseDown();
    }
}