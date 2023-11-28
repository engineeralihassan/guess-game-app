// app.component.ts
import { Component, OnDestroy } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'guess-game-app';
  guess!: any;
  status:string='';
  showResult:boolean=false;
  difficulty: string='easy';
  error: string = '';
  range: number = 20;
  deviation!: number;
  noOfTries!: number;
  original!: number;
  initialized: boolean = false;
  maxTries: number = 10;
  remainingTime = 60;
  timer$: Observable<number> = new Observable<number>();
  timerSubscription: Subscription | undefined;
  score: number = 0;
  highScores: { difficulty: string, score: number }[] = [];

  ngOnInit() {
    this.loadHighScores();
  }

  verifyGuess() {
    if (this.guess > this.range || this.guess < 1) {
      this.error = `Please select correct number between 0 and ${this.range}`;
      this.status='error';
      this.showResult=true;
    } else if (this.maxTries < 1) {
      alert("You lost the game");
      this.initializeGame();
    } else if (this.remainingTime > 1 && this.original === this.guess) {
      this.error = "Exact number 🎉🎉💃";
      this.status='success';
      this.showResult=true;
      this.calculateScore();
      alert("Hurray you win the Game");
    } else {
      this.deviation = this.original - this.guess;
      this.error = 'Try again🙄😕 Your gues is '+`${this.deviation<0? "higher": " Lower"}`;
      this.status='try';
      this.noOfTries = this.noOfTries + 1;
      this.maxTries -= 1;
      this.showResult=true;
      this.calculatePenalties();
      this.calculateScore();
    }
  }

  initializeGame() {
    this.noOfTries = 0;
    this.original = Math.floor(Math.random() * this.range) + 1;
    this.guess = 0;
    this.deviation = 0;
    this.initialized = true;
    this.range = 20;
    this.maxTries = 10;
    this.score = 0;
    this.resetTimer();
    this.showResult=false;
  }

  resetTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.remainingTime = 60;
    this.timer$ = interval(1000).pipe(
      map(() => --this.remainingTime),
      take(this.remainingTime + 1)
    );

    this.timerSubscription = this.timer$.subscribe(
      () => {
        if (this.remainingTime <= 0) {
          this.initializeGame();
        }
      },
      () => {},
      () => this.initializeGame()
    );
  }

  calculatePenalties() {
    this.remainingTime -= 5;
  }

  calculateScore() {
    this.score = this.noOfTries * 10 + (10 - this.maxTries) * 5 + (60 - this.remainingTime);
  }

  saveHighScore() {
    const existingHighScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    existingHighScores.push({ difficulty: this.difficulty, score: this.score });
    localStorage.setItem('highScores', JSON.stringify(existingHighScores));
    this.loadHighScores();
  }

  loadHighScores() {
    this.highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
  }

  onDifficultyChange() {
    switch (this.difficulty) {
      case 'easy':
        this.range = 10;
        this.maxTries = 10;
        break;
      case 'medium':
        this.range = 50;
        this.maxTries = 6;
        break;
      case 'hard':
        this.range = 100;
        this.maxTries = 3;
        break;
      default:
        break;
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
  getColor() {
    switch (this.status) {
      case 'success':
        return 'lightgreen';
      case 'error':
        return 'lightcoral';
      case 'try':
        return 'lightblue';
      default:
        return ''; // Default color
    }
  }
}
