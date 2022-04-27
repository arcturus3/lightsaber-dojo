import {CapsuleGeometry, Group, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3} from 'three';
import {degToRad} from 'three/src/math/MathUtils';

export class Droid extends Group {
    mesh;
    bolts: Object3D[] = [];

    constructor() {
        super();
        const geometry = new SphereGeometry(0.1, 16, 8);
        const material = new MeshBasicMaterial({wireframe: true});
        this.mesh = new Mesh(geometry, material);
        this.add(this.mesh);
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
                i++;
            } else {
                // dispose of geometry and material or share these among all bolts?
                this.remove(bolt);
                this.bolts.splice(i, 1);
            }
        }
    }

    fire(target: Vector3) {
        const geometry = new CapsuleGeometry(0.01, 0.1);
        geometry.rotateX(degToRad(90));
        const material = new MeshBasicMaterial({wireframe: true, color: 'red'});
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