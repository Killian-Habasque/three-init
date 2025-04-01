class KeyboardControls {
    private keys: { [key: string]: boolean } = {};

    constructor() {
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    private onKeyDown(event: KeyboardEvent) {
        this.keys[event.key] = true;
    }

    private onKeyUp(event: KeyboardEvent) {
        this.keys[event.key] = false;
    }

    public isKeyPressed(key: string): boolean {
        return this.keys[key] || false;
    }
}

export default KeyboardControls;
