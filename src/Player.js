import * as THREE from 'three';

const KEYS = {
'a': 65,
's': 83,
'w': 87,
'd': 68,
'space' : 32,
'shift' : 16,
};

function clamp(x, a, b) {
return Math.min(Math.max(x, a), b);
}

class InputController {
    constructor(target) {
        this.target_ = target || document;
        this.initialize_();    
    }

    initialize_() {
        this.current_ = {
        leftButton: false,
        rightButton: false,
        mouseXDelta: 0,
        mouseYDelta: 0,
        mouseX: 0,
        mouseY: 0,
        };
        this.previous_ = null;
        this.keys_ = {};
        this.previousKeys_ = {};
        this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
        this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
        this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
        this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
        this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
    }

    onMouseMove_(e) {
        this.current_.mouseX = e.pageX - window.innerWidth / 2;
        this.current_.mouseY = e.pageY - window.innerHeight / 2;

        if (this.previous_ === null) {
        this.previous_ = {...this.current_};
        }

        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
    }

    onMouseDown_(e) {
        this.onMouseMove_(e);

        switch (e.button) {
        case 0: {
            this.current_.leftButton = true;
            break;
        }
        case 2: {
            this.current_.rightButton = true;
            break;
        }
        }
    }

    onMouseUp_(e) {
        this.onMouseMove_(e);

        switch (e.button) {
        case 0: {
            this.current_.leftButton = false;
            break;
        }
        case 2: {
            this.current_.rightButton = false;
            break;
        }
        }
    }

    onKeyDown_(e) {
        this.keys_[e.keyCode] = true;
    }

    onKeyUp_(e) {
        this.keys_[e.keyCode] = false;
    }

    key(keyCode) {
        return !!this.keys_[keyCode];
    }

    isReady() {
        return this.previous_ !== null;
    }

    update(_) {
        if (this.previous_ !== null) {
        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

        this.previous_ = {...this.current_};
        }
    }
};


export class Player {
    constructor(camera, objects) {
        this.camera_ = camera;
        this.input_ = new InputController();
        this.rotation_ = new THREE.Quaternion();
        this.translation_ = new THREE.Vector3(0, 2, 0);
        this.phi_ = 0;
        this.phiSpeed_ = 8;
        this.theta_ = 0;
        this.thetaSpeed_ = 5;
        this.headBobActive_ = false;

        this.jumpcount = 2;
        this.timer = 0;
        this.lastJump = 0;
        this.previous = this.translation_.clone();
        this.vtdt;

        this.headBobTimer_ = 0;
        this.objects_ = [];

        for (let i = 0; i < objects.length; ++i) {
            const b = new THREE.Box3();
            b.setFromObject(objects[i]);
            this.objects_.push(b);
        }
    }

    update(timeElapsedS) {
        this.updateRotation_(timeElapsedS);
        this.updateCamera_(timeElapsedS);
        this.updateTranslation_(timeElapsedS);
        this.updateHeadBob_(timeElapsedS);
        this.updateGravity_();
        this.previous.copy(this.translation_);
        this.input_.update(timeElapsedS);
        this.timer+= timeElapsedS;
    }

    updateCamera_(_) {
        this.camera_.quaternion.copy(this.rotation_);
        this.camera_.position.copy(this.translation_);
        this.camera_.position.y += Math.sin(this.headBobTimer_ * 10) * 0.1;

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.rotation_);

        const dir = forward.clone();

        forward.multiplyScalar(100);
        forward.add(this.translation_);

        let closest = forward;
        const result = new THREE.Vector3();
        const ray = new THREE.Ray(this.translation_, dir);
        for (let i = 0; i < this.objects_.length; ++i) {
        if (ray.intersectBox(this.objects_[i], result)) {
            if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
            closest = result.clone();
            }
        }
        }

        this.camera_.lookAt(closest);
    }

    updateHeadBob_(timeElapsedS) {
        if (this.headBobActive_) {
        const wavelength = Math.PI;
        const nextStep = 1 + Math.floor(((this.headBobTimer_ + 0.000001) * 10) / wavelength);
        const nextStepTime = nextStep * wavelength / 10;
        this.headBobTimer_ = Math.min(this.headBobTimer_ + timeElapsedS, nextStepTime);

        if (this.headBobTimer_ == nextStepTime) {
            this.headBobActive_ = false;
        }
        }
    }

    updateTranslation_(timeElapsedS) {
        const forwardVelocity = (this.input_.key(KEYS.w) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0)
        const strafeVelocity = (this.input_.key(KEYS.a) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0)
        const jump = (this.input_.key(KEYS.space) && this.jumpcount > 0 ? 1 : 0);
        const sprint = (this.input_.key(KEYS.shift) ? 2.5 : 1)
        if(sprint>1)
            console.log("sonic speed");

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(forwardVelocity * timeElapsedS * 10 * sprint);

        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity * timeElapsedS * 10 * sprint);

        const up = new THREE.Vector3(0,1,0);
        up.multiplyScalar(jump*2);
        const EPS = 2.5;
        if(jump==1 && (this.lastJump==0||this.timer - this.lastJump > 0.25) && this.jumpcount > 0) {
        this.translation_.add(up);
        this.jumpcount--;
        this.lastJump = this.timer;
        this.vtdt = 1.5;

        
        }
        if(this.jumpcount==0 && this.translation_.y<=2+EPS) {
        this.jumpcount=2;
        
        }

        
        this.translation_.add(forward);
        this.translation_.add(left);

        if (forwardVelocity != 0 || strafeVelocity != 0) {
        this.headBobActive_ = true;
        }
    }

    // 1.5 vtdt, 3.5 scalar
    // when above ground, use verlet to do the gravity on the translation as in assignment five
    updateGravity_(timeElapsedS) {
        const EPS = 2;
        const GRAVITY = new THREE.Vector3(0,-1,0).multiplyScalar(9.8 * 90);
        const DAMPING = 0.03;
        const TIMESTEP = 18 / 1000;
        const scalar = 3.5;
        if(this.translation_.y < 2 + EPS) {
        this.translation_.y = 2 + EPS;
        }
        else if (this.translation_.y > 2 + EPS) {
        let at = GRAVITY
        let vtdt = new THREE.Vector3(0,1,0).multiplyScalar(this.vtdt);
        let contribution = vtdt.clone().multiplyScalar(1-DAMPING).add(at.multiplyScalar(TIMESTEP*TIMESTEP));
        this.translation_.add(contribution);
        this.vtdt = this.vtdt-  9.8 * TIMESTEP/scalar;
        }
    }

    updateRotation_(timeElapsedS) {
        const xh = this.input_.current_.mouseXDelta / window.innerWidth;
        const yh = this.input_.current_.mouseYDelta / window.innerHeight;

        this.phi_ += -xh * this.phiSpeed_;
        this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation_.copy(q);
    }
}