import * as THREE from 'three';
import Cube from '../components/Cube';
import Plane from '../components/Plane';
import ModelLoader from '../components/ModelLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

class SceneSetup {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
    }

    addDirectionalLight() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2, 5, 2);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        return directionalLight;
    }

    addCube() {
        const cube = new Cube();
        this.scene.add(cube.mesh);
        return cube.mesh;
    }

    addPlane() {
        const plane = new Plane();
        this.scene.add(plane.mesh);
        return plane.mesh;
    }

    addModel(url: string, onLoad?: (gltf: GLTF) => void) {
        const model = new ModelLoader();
        model.loadModel(url).then((gltf: GLTF) => {
            if (onLoad) {
                onLoad(gltf);
            }
        });
        return model;
    }

    getRenderer() {
        return this.renderer;
    }

    getCamera() {
        return this.camera;
    }

    getScene() {
        return this.scene;
    }
}

export default SceneSetup; 