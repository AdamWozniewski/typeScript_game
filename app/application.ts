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
        var x = "pizda";
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
}

enum Side {
    None, Left, Top, Right, Bottom // Typ wyliczeniowy ścian, NONE to 0 czyli fałsz
}

class Obstacle extends Rect {
    checkCollision(anotherRect: Rect): Side {
        var w = 0.5 * (this.with() + anotherRect.with());
        var h = 0.5 * (this.height() + anotherRect.height());
        var dx = this.centerX() - anotherRect.centerX();
        var dy = this.centerY() - anotherRect.centerY();

        if(Math.abs(dx) <= w && Math.abs(dy) <= h) {
            let wy = w * dy;
            let hx = h * dx;
            if (wy > hx) {
                return wy > - hx ? Side.Bottom : Side.Left;
            } else {
                return wy > - hx ? Side.Right : Side.Top;
            }
        } else {
            return Side.None;
        }
    }
}

class Sprite extends Obstacle {
    sprite: HTMLElement;
    constructor(sprite: HTMLElement, left?: number, top?: number, right?: number, bottom?: number) {
        bottom = bottom || sprite.offsetTop + sprite.offsetHeight;
        right = right || sprite.offsetTop + sprite.offsetWidth;
        top = top || sprite.offsetTop;
        left = left || sprite.offsetLeft;
        super(left, top, right, bottom);
        this.sprite = sprite;
    }

    moveTo(rect: Rect) {
        super.moveTo(rect);
        let {x: posX, y: posY} = this.topLeft;
        this.sprite.style.left = `${posX}px`;
        this.sprite.style.top = `${posY}px`;
    }
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
            console.log(this.maxRight)
            this.moveTo(newPosition);
        }
    }
}

class Ball extends Sprite{
    radius: number;
    dir: Vector;
    sprite: HTMLElement;

    constructor(sprite: HTMLElement,  direction: Vector) {
        var radius = 16;
        super(sprite, sprite.offsetLeft, sprite.offsetTop, sprite.offsetLeft + 2 * radius, sprite.offsetTop + 2 * radius);
        this.sprite = sprite;
        this.radius = radius;
        this.dir = direction;
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

    hide() {
        this.sprite.style.display = 'none';
    }
}

enum GameState {
    Running, GameOver
}

enum KeyCodes {
    LEFT = 37,
    RIGHT = 39
}

class Game {
    loopInterval: number = 10;
    ballElement: HTMLElement;
    ball: Ball;
    paddle: Paddle;
    gameState: GameState;

    wallLeft: Obstacle;
    wallTop: Obstacle;
    wallRight: Obstacle;
    wallBottom: Obstacle;

    constructor(ballElement: HTMLElement, paddle: HTMLElement, boardElement: HTMLElement) {
        this.paddle = new Paddle(paddle, boardElement.offsetWidth);
        this.gameState = GameState.Running
        this.ballElement = ballElement;
        this.ball = new Ball(ballElement,  new Vector(2, -2));
        this.createWalls(this.ball.radius, boardElement.offsetWidth, boardElement.offsetHeight)
    }

    createWalls(radius, maxX: number, maxY: number) {
        this.wallLeft = new Obstacle(-radius, -radius, 0, maxY + radius);
        this.wallTop = new Obstacle(-radius, -radius, maxX + radius, 0);
        this.wallRight = new Obstacle(maxX, -radius, maxX + radius, maxY + radius);
        this.wallBottom = new Obstacle(-radius, maxY, maxX + radius, maxY + radius);
    }

    run() {
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === KeyCodes.LEFT) {
                this.paddle.moveLeft(10);
            }
            if (e.keyCode === KeyCodes.RIGHT) {
                this.paddle.moveRight(10);
            }
        });
        setInterval(() => {
            if(this.gameState !== GameState.Running) {
                return;
            }
            let newBallPosition = this.ball.calculateNewPosition();

            if(this.wallBottom.checkCollision(newBallPosition)) {
                this.gameState = GameState.GameOver;
                this.ball.hide();
                return;
            }

            if(this.wallLeft.checkCollision(newBallPosition) || this.wallRight.checkCollision(newBallPosition)) {
                this.ball.bounceVertical();
            }

            if(this.wallTop.checkCollision(newBallPosition) || this.wallBottom.checkCollision(newBallPosition)) {
                this.ball.bounceHorizontal();
            }

            switch (this.paddle.checkCollision(newBallPosition)) {
                case (Side.Left):
                case  (Side.Right):
                    this.ball.bounceHorizontal();
                    break;
                case (Side.Top):
                    this.ball.bounceVertical();
                    break;

            }

            this.ball.moveTo(newBallPosition);
        }, this.loopInterval);
    }
}
var game = new Game(
    <HTMLElement>document.getElementsByClassName("ball")[0],
    <HTMLElement>document.getElementsByClassName("paddle")[0],
    <HTMLElement>document.getElementsByClassName("game-board")[0]
);
game.run();
