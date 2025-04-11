
class Score {
    private score: number;
    private scoreElement: HTMLElement;

    constructor() {
        this.score = 0;

        this.scoreElement = document.createElement('div');
        this.scoreElement.style.position = 'absolute';
        this.scoreElement.style.top = '10px';
        this.scoreElement.style.left = '10px';
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.fontSize = '24px';
        document.body.appendChild(this.scoreElement);

        this.updateDisplay();
    }

    public add(points: number) {
        this.score += points;
        this.updateDisplay();
    }

    private updateDisplay() {
        this.scoreElement.innerText = `Score: ${this.score}`;
    }
}

export default Score;