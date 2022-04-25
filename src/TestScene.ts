import {PerspectiveCamera, Mesh, MeshBasicMaterial, PlaneGeometry, Scene, SphereGeometry, CylinderGeometry} from 'three';

export class TestScene extends Scene {
    camera;
    saber;

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

        const saberGeometry = new CylinderGeometry(0.025, 0.025, 1, 16);
        this.saber = new Mesh(saberGeometry, wireframeMaterial);
        this.saber.position.set(0.4, -0.2, -0.5);
        this.saber.rotation.set(-0.3, 0, 0.1);
        this.camera.add(this.saber);
    }

    update() {

    }
}