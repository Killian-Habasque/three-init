class Score {
    private score: number;
    private scoreElement: HTMLElement;
    private wave: number;

    constructor() {
        this.score = 0;
        this.wave = 1;

        this.scoreElement = document.createElement('div');
        this.scoreElement.classList.add('game-score');
        document.body.appendChild(this.scoreElement);

        this.updateDisplay();
    }

    public add(points: number) {
        this.score += points;
        this.updateDisplay();
    }

    public reduce(points: number) {
        this.score -= points;
        this.updateDisplay();
    }

    public addWave() {
        this.wave += 1;
    }
    public updateDisplay() {
        this.scoreElement.innerText = `Score: ${this.score} | Wave: ${this.wave}`;
    }
    
    public increment() {
        this.score += 1; 
        this.updateDisplay();
        console.log(`Score: ${this.score}, Wave: ${this.wave}`); 
    }

    public getScore() {
        return this.score;
    }

    public getWave() {
        return this.wave;
    }
}

export default Score;