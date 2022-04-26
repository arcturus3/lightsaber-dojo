import {PerspectiveCamera, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, SphereGeometry} from 'three';
import {Lightsaber} from './Lightsaber';

export class TestScene extends Scene {
    camera;
    lightsaber;

    constructor() {
        super();

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 5;
        this.add(this.camera);

        const wireframeMaterial = new MeshBasicMaterial({wireframe: true});

        const planeGeometry = new PlaneGeometry(100, 100, 50, 50);
        const plane = new Mesh(planeGeometry, wireframeMaterial);
        plane.rotation.x = -Math.PI / 2;
        this.add(plane);

        const sphereGeometry = new SphereGeometry();
        const sphere = new Mesh(sphereGeometry, wireframeMaterial);
        sphere.position.x = -5;
        sphere.position.y = 10;
        sphere.position.z = -20;
        this.add(sphere);

        this.lightsaber = new Lightsaber();
        this.lightsaber.position.set(0.4, -0.2, -0.5);
        this.lightsaber.rotation.set(-0.3, -0.3, 0.1);
        this.camera.add(this.lightsaber);
    }

    update(delta: number) {
        this.lightsaber.update(delta);
    }

    handleMouseDown() {
        this.lightsaber.handleMouseDown();
    }
}