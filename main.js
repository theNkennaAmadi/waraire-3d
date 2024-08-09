import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Canvas
const canvas = document.querySelector(".webgl1");

// Scene
const scene = new THREE.Scene();

// Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(
    "https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/libs/draco/"
);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Models
let mixer = null;
let mixer2 = null;
let mixer3 = null;
let butterfly1 = null;
let butterfly2 = null;

// Function to convert 2D screen coordinates to 3D world coordinates
function screenToWorld(x, y, camera) {
    const vec = new THREE.Vector3(); // create once and reuse
    const pos = new THREE.Vector3(); // create once and reuse

    vec.set(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
        0.5
    );

    vec.unproject(camera);
    vec.sub(camera.position).normalize();

    const distance = -camera.position.z / vec.z;

    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    return pos;
}


const getElementTopPosition = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.top + window.pageYOffset;
};

function updateButterfliesPosition() {

    if (butterfly1) {
        const pos1 = screenToWorld(window.innerWidth * 0.95, window.innerHeight * 0.45, camera);
        butterfly1.position.set(pos1.x, pos1.y, pos1.z);
        butterfly1.rotation.z = Math.PI / 4; // 45 degrees
    }

    if (butterfly2) {
        let y = getElementTopPosition(document.querySelector('.signature'))/window.innerHeight;
        const x = document.querySelector('#er').getBoundingClientRect().left/window.innerWidth;
        const pos2 = screenToWorld(window.innerWidth*x, window.innerHeight * (y+0.028), camera);
        butterfly2.position.set(pos2.x, pos2.y, pos2.z);
        butterfly2.rotation.z = -Math.PI / 3; // -45 degrees
    }
}

gltfLoader.load(
    "https://cdn.jsdelivr.net/gh/theNkennaAmadi/emil-about@main/dist/models/butterfly1/bfly1.glb",
    (gltf) => {
        gltf.scene.children[0].removeFromParent();

        butterfly1 = gltf.scene;
        butterfly1.scale.set(0.025, 0.025, 0.025);
        butterfly1.visible = false;
        updateButterfliesPosition();
        scene.add(butterfly1);


        gsap.from(butterfly1.position, { x: -2, y: 0.1, duration: 5, delay: 2 });
        if(window.innerWidth > 768){
            gsap.to(butterfly1, {visible: true, delay: 2})
        }
        // Animation
        mixer3 = new THREE.AnimationMixer(butterfly1);
        const action = mixer3.clipAction(gltf.animations[1]);
        action.play();
    }
);

gltfLoader.load(
    "https://cdn.jsdelivr.net/gh/theNkennaAmadi/emil-about@main/dist/models/butterfly1/bfly1.glb",
    (gltf) => {
        gltf.scene.children[0].removeFromParent();
        butterfly2 = gltf.scene;
        butterfly2.scale.set(0.03, 0.03, 0.03);
        updateButterfliesPosition();
        scene.add(butterfly2);

        gsap.from(butterfly2.position, { x: -1.2, duration: 1 });

        // Animation
        mixer2 = new THREE.AnimationMixer(butterfly2);
        const action = mixer2.clipAction(gltf.animations[2]);
        action.play();
    }
);

// Lights
const ambientLight = new THREE.AmbientLight("white", 1);
scene.add(ambientLight);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update butterflies position
    updateButterfliesPosition();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.set(0, 0.55, 0.75);

scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animate
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Model animation
    if (mixer) mixer.update(deltaTime);
    if (mixer2) mixer2.update(deltaTime);
    if (mixer3) mixer3.update(deltaTime);

    if (butterfly1) {
        window.setTimeout(() => {
            gsap.to(butterfly1.position, { x: Math.sin(elapsedTime / 2) * 0.75, duration: 2 });
            gsap.to(butterfly1.position, { z: Math.cos(elapsedTime / 2) * 0.5, duration: 2 });
        }, 8000);
    }

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
