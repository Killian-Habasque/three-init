import GUI from 'lil-gui';
import * as THREE from 'three';

class AppGUI {
    gui: GUI;

    constructor(cube: THREE.Mesh, directionalLight: THREE.DirectionalLight) {
        this.gui = new GUI();
        this.setupCubeFolder(cube);
        this.setupLightFolder(directionalLight);
    }

    setupCubeFolder(cube: THREE.Mesh) {
        const cubeFolder = this.gui.addFolder('Cube');
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
    }

    setupLightFolder(directionalLight: THREE.DirectionalLight) {
        const lightFolder = this.gui.addFolder('Lumière Directionnelle');
        lightFolder.add(directionalLight.position, 'x', -10, 10).name('Position X');
        lightFolder.add(directionalLight.position, 'y', 0, 10).name('Position Y');
        lightFolder.add(directionalLight.position, 'z', -10, 10).name('Position Z');
        lightFolder.add(directionalLight, 'intensity', 0, 5).name('Intensité');
        lightFolder.addColor({ color: directionalLight.color.getHex() }, 'color')
            .name('Couleur')
            .onChange((value) => directionalLight.color.set(value));
        lightFolder.open();
    }
}

export default AppGUI; 