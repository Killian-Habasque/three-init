import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

class App {
    constructor() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        camera.position.set(0, 2, 5);
        controls.update();

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2, 5, 2);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // directionalLight.shadow.mapSize.set(1024, 1024);
        // directionalLight.shadow.camera.near = 0.5;
        // directionalLight.shadow.camera.far = 10;
        // directionalLight.shadow.camera.left = -5;
        // directionalLight.shadow.camera.right = 5;
        // directionalLight.shadow.camera.top = 5;
        // directionalLight.shadow.camera.bottom = -5;

        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 1, 0);
        cube.castShadow = true;
        scene.add(cube);

        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        scene.add(plane);

        const gui = new GUI();

        const cubeFolder = gui.addFolder('Cube');
        cubeFolder.add(cube.position, 'x', -5, 5).name('Position X');
        cubeFolder.add(cube.position, 'y', 0, 5).name('Position Y');
        cubeFolder.add(cube.position, 'z', -5, 5).name('Position Z');
        cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2).name('Rotation X');
        cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2).name('Rotation Y');
        cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2).name('Rotation Z');
        cubeFolder.add(cube.scale, 'x', 0.1, 3).name('Taille X');
        cubeFolder.add(cube.scale, 'y', 0.1, 3).name('Taille Y');
        cubeFolder.add(cube.scale, 'z', 0.1, 3).name('Taille Z');
        cubeFolder.open();

        const lightFolder = gui.addFolder('Lumière Directionnelle');
        lightFolder.add(directionalLight.position, 'x', -10, 10).name('Position X');
        lightFolder.add(directionalLight.position, 'y', 0, 10).name('Position Y');
        lightFolder.add(directionalLight.position, 'z', -10, 10).name('Position Z');
        lightFolder.add(directionalLight, 'intensity', 0, 5).name('Intensité');
        lightFolder.addColor({ color: directionalLight.color.getHex() }, 'color')
            .name('Couleur')
            .onChange((value) => directionalLight.color.set(value));
        lightFolder.open();

        function animate() {
            controls.update();
            renderer.render(scene, camera);
        }

        renderer.setAnimationLoop(animate);
    }
}

export { App };
