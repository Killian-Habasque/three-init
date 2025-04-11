class HitMarker {
    private hitMarkerElement: HTMLElement;
    private timeoutId: number | null = null;

    constructor() {
        this.hitMarkerElement = document.createElement('div');
        this.hitMarkerElement.classList.add('hit-marker');
        document.body.appendChild(this.hitMarkerElement);
    }

    public show(text: string, duration: number = 1000) {
        if (this.timeoutId !== null) {
            window.clearTimeout(this.timeoutId);
        }

        this.hitMarkerElement.innerText = text + "💥";
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