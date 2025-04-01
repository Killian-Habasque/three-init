import * as THREE from 'three';

export function enableShadowForModel(object: THREE.Object3D) {
    object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

export function enableShadowForLight(light: THREE.DirectionalLight) {
    light.castShadow = true;
    light.shadow.mapSize.width = 4096; 
    light.shadow.mapSize.height = 4096; 
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 100; 
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 100;
    light.shadow.camera.top = 100; 
    light.shadow.camera.bottom = -100;
}


