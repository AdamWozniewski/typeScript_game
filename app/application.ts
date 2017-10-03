class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    add(point: Point) {
        this.x += point.x;
        this.y += point.y;
    }
}

class Vector extends Point {
    flipX() {
       this.x *= -1
    }
    flipY() {
        this.y *= -1;
    }
}

class Rect {
    topLeft: Point;
    bottomRight: Point;

    constructor(left: number, top: number, right: number, bottom: number) {
        this.topLeft = new Point(left, top);
        this.bottomRight = new Point(right, bottom);
    }

    add(point: Point) {
        this.topLeft.add(point);
        this.bottomRight.add(point);
    }

    clone(): Rect {
        return new Rect(this.topLeft.x, this.topLeft.y, this.bottomRight.x, this.bottomRight.y);
    }

    moveTo(rect: Rect) {
        this.topLeft.x = rect.topLeft.x;
        this.topLeft.y = rect.topLeft.y;
        this.bottomRight.x = rect.bottomRight.x;
        this.bottomRight.y = rect.bottomRight.y;
    }

    with() {
        return this.bottomRight.x - this.topLeft.x; // długośc obszaru gry
    }

    height() {
        return this.bottomRight.y - this.topLeft.y; // Wysokośc Obszaru gry
    }

    centerX() {
        return (this.topLeft.x + this.bottomRight.x) / 2;
    }

    centerY() {
        return (this.topLeft.y + this.bottomRight.y) / 2;
    }

    moveLeft(step) {
        this.topLeft.x -= step;
        this.bottomRight.x -= step;
    }

    moveRight(step: number) {
        this.topLeft.x += step;
        this.bottomRight.x += step;
    }

    moveCenterXTo(centerX: number) {
        var left = centerX - this.with() / 2;
        var right = left + this.with();
        this.topLeft.x = left;
        this.bottomRight.x = right;
    }

    moveBottomTo(bottom: number){
        // var top = bottom - this.height();
        this.topLeft.y = bottom - this.height();
        this.bottomRight.y = bottom
    }
}

enum Side {
    None, Left, Top, Right, Bottom // Typ wyliczeniowy ścian, NONE to 0 czyli fałsz
}

class Obstacle extends Rect {
    // isVisible: boolean = true;

    checkCollision(anotherRect: Rect): Side {
        var w = 0.5 * (this.with() + anotherRect.with());
        var h = 0.5 * (this.height() + anotherRect.height());
        var dx = this.centerX() - anotherRect.centerX();
        var dy = this.centerY() - anotherRect.centerY();

        if(Math.abs(dx) <= w && Math.abs(dy) <= h) {
            let wy = w * dy;
            let hx = h * dx;
            if (wy > hx) {
                return wy > - hx ? Side.Top : Side.Left;
            } else {
                return wy > - hx ? Side.Right : Side.Bottom;
            }
        } else {
            return Side.None;
        }
    }
}

class Sprite extends Obstacle {
    sprite: HTMLElement;
    isVisible: boolean;
    constructor(sprite: HTMLElement, left?: number, top?: number, right?: number, bottom?: number) {
        bottom = bottom || sprite.offsetTop + sprite.offsetHeight;
        right = right || sprite.offsetTop + sprite.offsetWidth;
        top = top || sprite.offsetTop;
        left = left || sprite.offsetLeft;
        super(left, top, right, bottom);
        this.sprite = sprite;
        this.isVisible = true;
    }

    moveTo(rect: Rect) {
        super.moveTo(rect);
        let {x: posX, y: posY} = this.topLeft;
        this.sprite.style.left = `${posX}px`;
        this.sprite.style.top = `${posY}px`;
    }

    hide() {
        this.isVisible = false;
        this.sprite.style.display = 'none';
    }
    show() {
        this.isVisible = true;
        this.sprite.style.display = 'block';
    }
// TO TEZ
//     checkCollision(anotherRect: Rect): Side {
//
//         if(this.isVisible) {
//             return Side.None;
//         }
//         return super.checkCollision(anotherRect);
//     }
}

class Paddle extends Sprite {
    constructor(sprite: HTMLElement, public maxRight: number) {
        super(sprite);
    }

    moveLeft(step?: number) {
        let newPosition = this.clone();
        newPosition.moveLeft(step);
        if(newPosition.topLeft.x >=0) {
            this.moveTo(newPosition);
        }
    }

    moveRight(step?: number) {
        let newPosition = this.clone();
        newPosition.moveRight(step);
        if(newPosition.bottomRight.x <= this.maxRight + (2 * this.sprite.offsetWidth)) {
            this.moveTo(newPosition);
        }
    }

    calculateHitAngle(ballX: number, ballRadius: number): number {
        var hitPoint = ballX - this.topLeft.x;
        var maxPaddle = this.with() + ballRadius;
        var minPaddle = -ballRadius;
        var paddleRange = maxPaddle - minPaddle;

        var minAngle = 160;
        var maxAngle = 20;
        var angleRange = maxAngle - minAngle;

        return ((hitPoint * angleRange) / paddleRange) + minAngle;
    }

}

class Ball extends Sprite{
    radius: number;
    dir: Vector;
    sprite: HTMLElement;
    velocity: number

    constructor(sprite: HTMLElement,  direction: Vector) {
        var radius = 16;
        super(sprite, sprite.offsetLeft, sprite.offsetTop, sprite.offsetLeft + 2 * radius, sprite.offsetTop + 2 * radius);
        this.sprite = sprite;
        this.radius = radius;
        this.dir = direction;
        this.velocity = 5;
    }

    calculateNewPosition() {
        let newPosition = this.clone();
        newPosition.add(this.dir);
        return newPosition;
    }

    bounceHorizontal() {
        this.dir.flipY();
    }

    bounceVertical() {
        this.dir.flipX()
    }

    moveTo(rect: Rect) {
        super.moveTo(rect);
        let {x: posX, y: posY} = this.topLeft;
        this.sprite.style.left = `${posX}px`;
        this.sprite.style.top = `${posY}px`;
    }

    bounceWithAngle(angle: number) {
        angle = angle * (Math.PI / 180);
        this.dir.x = Math.cos(angle) * this.velocity;
        this.dir.y = -Math.sin(angle) * this.velocity;
    }
}

enum GameState {
    Running, GameOver
}

enum KeyCodes {
    LEFT = 37,
    RIGHT = 39
}

class Brick extends Sprite {
}

class Game {
    loopInterval: number = 20;
    ballElement: HTMLElement;
    ball: Ball;
    paddle: Paddle;
    gameState: GameState;

    bricks: Brick[];
    keyMap: {};
    wallLeft: Obstacle;
    wallTop: Obstacle;
    wallRight: Obstacle;
    wallBottom: Obstacle;

    livesLeft: number;
    scoreNumber: number;

    constructor(ballElement: HTMLElement, paddle: HTMLElement, boardElement: HTMLElement, bricks: HTMLCollection, public lives: HTMLElement, public score: HTMLElement,  public newGameButton: HTMLElement) {
        this.paddle = new Paddle(paddle, boardElement.offsetWidth);
        this.gameState = GameState.Running
        this.ballElement = ballElement;
        this.ball = new Ball(ballElement,  new Vector(-2, -2));
        this.bricks = [];
        for(let i = 0; i < bricks.length; i++) {
            this.bricks.push(new Brick(<HTMLElement>bricks[i]));
        }
        this.createWalls(this.ball.radius, boardElement.offsetWidth, boardElement.offsetHeight);

        this.newGame();
        this.newGameButton.addEventListener('click', ()=> this.newGame());
    }

    newGame() {
        this.gameState = GameState.Running;
        this.newGameButton.style.display = 'none';
        this.livesLeft = 3;
        this.lives.innerText = ''+ this.livesLeft;
        this.scoreNumber = 0;

        this.ball.bounceWithAngle(60);
        var ballPosition = this.ball.clone();
        ballPosition.moveCenterXTo(this.paddle.centerX());
        ballPosition.moveBottomTo(this.paddle.topLeft.y - 4);
        this.ball.moveTo(ballPosition);

        this.ball.show();
    }

    lostLives() {
        if(--this.livesLeft) {
            this.ball.bounceWithAngle(600);
            var ballPosition = this.ball.clone();
            ballPosition.moveCenterXTo(this.paddle.centerX());
            ballPosition.moveBottomTo(this.paddle.topLeft.y - 4);
            this.ball.moveTo(ballPosition);
        } else {
            this.gameState = GameState.GameOver;
            this.newGameButton.style.display = 'block';
            this.ball.hide();
        }
        this.lives.innerText = '' + this.livesLeft;
    }

    createWalls(radius, maxX: number, maxY: number) {
        this.wallLeft = new Obstacle(-radius, -radius, 0, maxY + radius);
        this.wallTop = new Obstacle(-radius, -radius, maxX + radius, 0);
        this.wallRight = new Obstacle(maxX, -radius, maxX + radius, maxY + radius);
        this.wallBottom = new Obstacle(-radius, maxY, maxX + radius, maxY + radius);
    }

    run() {
        // document.addEventListener('keyup', (e) => {
        //     // this.keyMap[e.keyCode] = false;
        //     // if(e.keyCode === 37 ) {
        //     //     this.paddle.moveLeft(5);
        //     // }
        // });
        document.addEventListener('keydown', (e) => {
            // this.keyMap[e.keyCode] = true;
            if(e.keyCode === 37 ) {
                this.paddle.moveLeft(5);
            } else if (e.keyCode === 39) {
                this.paddle.moveRight(5);
            }
        });


        setInterval(() => {
            if(this.gameState !== GameState.Running) {
                return;
            }
            let newBallPosition = this.ball.calculateNewPosition();
            // if(this.keyMap[KeyCodes.LEFT]) {
            //     this.paddle.moveLeft(5);
            // } else if(this.keyMap[KeyCodes.RIGHT]) {
            //     this.paddle.moveRight(5);
            // }

            if(this.wallBottom.checkCollision(newBallPosition)) {
                this.lostLives();
                return;
            }

            if(this.wallLeft.checkCollision(newBallPosition) || this.wallRight.checkCollision(newBallPosition)) {
                this.ball.bounceVertical();
            }

            if(this.wallTop.checkCollision(newBallPosition) || this.wallBottom.checkCollision(newBallPosition)) {
                this.ball.bounceHorizontal();
            }

            for (let brick of this.bricks) {
                let wasHit = false;
                switch (brick.checkCollision(newBallPosition)) {
                    case (Side.Left):
                    case  (Side.Right):
                        this.ball.bounceVertical();
                        wasHit = true;
                        break;
                    case (Side.Top):
                    case (Side.Bottom):
                        this.ball.bounceHorizontal();
                        wasHit = true;
                        break;
                }
                if( wasHit ) {
                    this.scoreNumber += 20;
                    this.score.innerHTML = '' + this.scoreNumber;
                    brick.hide();
                    break;
                }
            }

            if(this.paddle.checkCollision(newBallPosition)) {
                this.ball.bounceWithAngle(this.paddle.calculateHitAngle(this.ball.centerX(), this.ball.radius));
            }


            this.ball.moveTo(newBallPosition);
        }, this.loopInterval);
    }
}
var game = new Game(
    <HTMLElement>document.getElementsByClassName("ball")[0],
    <HTMLElement>document.getElementsByClassName("paddle")[0],
    <HTMLElement>document.getElementsByClassName("game-board")[0],
    <HTMLCollection>document.getElementsByClassName("brick"),
    <HTMLElement>document.getElementById("lives"),
    <HTMLElement>document.getElementById("score"),
    <HTMLElement>document.getElementById("newGame")

);
game.run();
