class WaveNotification {
    private notificationElement: HTMLElement;
    private timeoutId: number | null = null;

    constructor() {
        this.notificationElement = document.createElement('div');
        this.notificationElement.classList.add('game-notification');
        document.body.appendChild(this.notificationElement);
    }

    public show(text: string, duration: number = 3000) {
        if (this.timeoutId !== null) {
            window.clearTimeout(this.timeoutId);
        }

        this.notificationElement.innerText = text;
        this.notificationElement.style.opacity = '1';

        const startY = 20;
        const endY = 15;
        const startTime = performance.now();
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const y = startY - (progress * (startY - endY));
            this.notificationElement.style.top = `${y}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);

        this.timeoutId = window.setTimeout(() => {
            this.notificationElement.style.opacity = '0';
            this.timeoutId = null;
        }, duration);
    }
}

export default WaveNotification;