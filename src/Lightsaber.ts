import {Mesh, CylinderGeometry, MeshBasicMaterial, Group} from 'three';
import {lerp, smootherstep, degToRad} from 'three/src/math/MathUtils';

export class Lightsaber extends Group {
    mesh;
    swinging = false;
    swingState = 0;
    swingDuration = 0.5;

    constructor() {
        super();
        const geometry = new CylinderGeometry(0.025, 0.025, 1, 16);
        const material = new MeshBasicMaterial({wireframe: true});
        this.mesh = new Mesh(geometry, material);
        geometry.translate(0, 0.5, 0);
        this.add(this.mesh);
    }

    update(delta: number) {
        if (this.swinging) {
            this.swingState += delta / this.swingDuration;
            this.swingState = Math.min(this.swingState, 1);
            let s;
            if (this.swingState <= 0.5) {
                s = 2 * this.swingState;
            } else {
                s = 2 * (1 - this.swingState);
            }
            const t = smootherstep(s, 0, 1);
            const rotationX = lerp(0, degToRad(-120), t);
            this.mesh.rotation.x = rotationX;
            if (this.swingState === 1) {
                this.swinging = false;
                this.swingState = 0;
            }
        }
    }

    handleMouseDown() {
        if (!this.swinging) {
            this.swinging = true;
        }
    }
}