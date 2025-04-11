class HitMarker {
    private hitMarkerElement: HTMLElement;
    private timeoutId: number | null = null;

    constructor() {
        this.hitMarkerElement = document.createElement('div');
        this.hitMarkerElement.style.position = 'absolute';
        this.hitMarkerElement.style.top = '50%';
        this.hitMarkerElement.style.left = '50%';
        this.hitMarkerElement.style.transform = 'translate(-50%, -50%)';
        this.hitMarkerElement.style.color = 'red';
        this.hitMarkerElement.style.fontSize = '30px';
        this.hitMarkerElement.style.fontWeight = 'bold';
        this.hitMarkerElement.style.opacity = '0';
        this.hitMarkerElement.style.transition = 'opacity 0.5s ease-out';
        this.hitMarkerElement.style.userSelect = 'none';
        this.hitMarkerElement.style.pointerEvents = 'none';
        this.hitMarkerElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
        document.body.appendChild(this.hitMarkerElement);
    }

    public show(text: string, duration: number = 1000) {
        if (this.timeoutId !== null) {
            window.clearTimeout(this.timeoutId);
        }

        this.hitMarkerElement.innerText = text;
        this.hitMarkerElement.style.opacity = '1';

        const startY = 50;
        const endY = 40;
        const startTime = performance.now();
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const y = startY - (progress * (startY - endY));
            this.hitMarkerElement.style.top = `${y}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);

        this.timeoutId = window.setTimeout(() => {
            this.hitMarkerElement.style.opacity = '0';
            this.timeoutId = null;
        }, duration);
    }
}

export default HitMarker;