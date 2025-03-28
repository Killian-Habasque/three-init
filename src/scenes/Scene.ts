import * as THREE from 'three';
import Cube from '../components/Cube';
import Plane from '../components/Plane';
import ModelLoader from '../components/ModelLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';
import { DirectionalLightHelper } from 'three';

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
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMappingExposure = 1;
        document.body.appendChild(this.renderer.domElement);
    }

    addDirectionalLight() {
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
        directionalLight.position.set(2, 12, 2);
        directionalLight.castShadow = true;
        
        directionalLight.shadow.mapSize.width = 4096; 
        directionalLight.shadow.mapSize.height = 4096; 
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100; 
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100; 
        directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(directionalLight);
        
        const lightHelper = new DirectionalLightHelper(directionalLight, 5);
        this.scene.add(lightHelper);
        
        // const gui = new GUI();
        // const lightFolder = gui.addFolder('Directional Light');
        // lightFolder.add(directionalLight.position, 'x', -100, 100).name('Position X');
        // lightFolder.add(directionalLight.position, 'y', 12, 100).name('Position Y');
        // lightFolder.add(directionalLight.position, 'z', -100, 100).name('Position Z');
        // lightFolder.add(directionalLight, 'intensity', 0, 2).name('Intensity');
        // lightFolder.addColor({ color: directionalLight.color.getHex() }, 'color').onChange((value) => {
        //     directionalLight.color.set(value);
        // }).name('Color');

        // const rotationFolder = gui.addFolder('Light Rotation');
        // rotationFolder.add(directionalLight.rotation, 'x', -Math.PI, Math.PI).name('Rotation X');
        // rotationFolder.add(directionalLight.rotation, 'y', -Math.PI, Math.PI).name('Rotation Y');
        // rotationFolder.add(directionalLight.rotation, 'z', -Math.PI, Math.PI).name('Rotation Z');
        // rotationFolder.open();

        // lightFolder.open();
        
        directionalLight.target.position.set(0, 0, 0); // Ajustez la cible si nécessaire
        this.scene.add(directionalLight.target); // Ajoutez la cible à la scène
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
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