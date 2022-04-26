import {Mesh, CylinderGeometry, MeshBasicMaterial, Group} from 'three';
import {lerp} from 'three/src/math/MathUtils';

export class Lightsaber extends Group {
    mesh;
    swinging = false;
    swingCompletion = 0;

    constructor() {
        super();
        const geometry = new CylinderGeometry(0.025, 0.025, 1, 16);
        const material = new MeshBasicMaterial({wireframe: true});
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.y = 0.5;
        this.add(this.mesh);
    }

    update(delta: number) {
        if (this.swinging) {
            this.swingCompletion += 2 * delta;
            if (this.swingCompletion > 1) {
                this.swingCompletion = 1;
            }
            let frac;
            if (this.swingCompletion <= 0.5) {
                frac = 2 * this.swingCompletion;
            } else {
                frac = 2 * (1 - this.swingCompletion);
            }
            const rotationX = lerp(0, -Math.PI / 2, frac);
            this.rotation.x = rotationX;
            if (this.swingCompletion === 1) {
                this.swinging = false;
                this.swingCompletion = 0;
            }
        }
    }

    handleMouseDown() {
        if (!this.swinging) {
            this.swinging = true;
        }
    }
}