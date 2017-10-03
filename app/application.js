var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.add = function (point) {
        this.x += point.x;
        this.y += point.y;
    };
    return Point;
}());
var Vector = (function (_super) {
    __extends(Vector, _super);
    function Vector() {
        return _super.apply(this, arguments) || this;
    }
    Vector.prototype.flipX = function () {
        this.x *= -1;
    };
    Vector.prototype.flipY = function () {
        this.y *= -1;
    };
    return Vector;
}(Point));
var Rect = (function () {
    function Rect(left, top, right, bottom) {
        this.topLeft = new Point(left, top);
        this.bottomRight = new Point(right, bottom);
    }
    Rect.prototype.add = function (point) {
        this.topLeft.add(point);
        this.bottomRight.add(point);
    };
    Rect.prototype.clone = function () {
        return new Rect(this.topLeft.x, this.topLeft.y, this.bottomRight.x, this.bottomRight.y);
    };
    Rect.prototype.moveTo = function (rect) {
        this.topLeft.x = rect.topLeft.x;
        this.topLeft.y = rect.topLeft.y;
        this.bottomRight.x = rect.bottomRight.x;
        this.bottomRight.y = rect.bottomRight.y;
    };
    Rect.prototype.with = function () {
        return this.bottomRight.x - this.topLeft.x; // długośc obszaru gry
    };
    Rect.prototype.height = function () {
        return this.bottomRight.y - this.topLeft.y; // Wysokośc Obszaru gry
    };
    Rect.prototype.centerX = function () {
        return (this.topLeft.x + this.bottomRight.x) / 2;
    };
    Rect.prototype.centerY = function () {
        return (this.topLeft.y + this.bottomRight.y) / 2;
    };
    Rect.prototype.moveLeft = function (step) {
        this.topLeft.x -= step;
        this.bottomRight.x -= step;
    };
    Rect.prototype.moveRight = function (step) {
        this.topLeft.x += step;
        this.bottomRight.x += step;
    };
    Rect.prototype.moveCenterXTo = function (centerX) {
        var left = centerX - this.with() / 2;
        var right = left + this.with();
        this.topLeft.x = left;
        this.bottomRight.x = right;
    };
    Rect.prototype.moveBottomTo = function (bottom) {
        // var top = bottom - this.height();
        this.topLeft.y = bottom - this.height();
        this.bottomRight.y = bottom;
    };
    return Rect;
}());
var Side;
(function (Side) {
    Side[Side["None"] = 0] = "None";
    Side[Side["Left"] = 1] = "Left";
    Side[Side["Top"] = 2] = "Top";
    Side[Side["Right"] = 3] = "Right";
    Side[Side["Bottom"] = 4] = "Bottom"; // Typ wyliczeniowy ścian, NONE to 0 czyli fałsz
})(Side || (Side = {}));
var Obstacle = (function (_super) {
    __extends(Obstacle, _super);
    function Obstacle() {
        return _super.apply(this, arguments) || this;
    }
    // isVisible: boolean = true;
    Obstacle.prototype.checkCollision = function (anotherRect) {
        var w = 0.5 * (this.with() + anotherRect.with());
        var h = 0.5 * (this.height() + anotherRect.height());
        var dx = this.centerX() - anotherRect.centerX();
        var dy = this.centerY() - anotherRect.centerY();
        if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
            var wy = w * dy;
            var hx = h * dx;
            if (wy > hx) {
                return wy > -hx ? Side.Top : Side.Left;
            }
            else {
                return wy > -hx ? Side.Right : Side.Bottom;
            }
        }
        else {
            return Side.None;
        }
    };
    return Obstacle;
}(Rect));
var Sprite = (function (_super) {
    __extends(Sprite, _super);
    function Sprite(sprite, left, top, right, bottom) {
        var _this;
        bottom = bottom || sprite.offsetTop + sprite.offsetHeight;
        right = right || sprite.offsetTop + sprite.offsetWidth;
        top = top || sprite.offsetTop;
        left = left || sprite.offsetLeft;
        _this = _super.call(this, left, top, right, bottom) || this;
        _this.sprite = sprite;
        _this.isVisible = true;
        return _this;
    }
    Sprite.prototype.moveTo = function (rect) {
        _super.prototype.moveTo.call(this, rect);
        var _a = this.topLeft, posX = _a.x, posY = _a.y;
        this.sprite.style.left = posX + "px";
        this.sprite.style.top = posY + "px";
    };
    Sprite.prototype.hide = function () {
        this.isVisible = false;
        this.sprite.style.display = 'none';
    };
    Sprite.prototype.show = function () {
        this.isVisible = true;
        this.sprite.style.display = 'block';
    };
    return Sprite;
}(Obstacle));
var Paddle = (function (_super) {
    __extends(Paddle, _super);
    function Paddle(sprite, maxRight) {
        var _this = _super.call(this, sprite) || this;
        _this.maxRight = maxRight;
        return _this;
    }
    Paddle.prototype.moveLeft = function (step) {
        var newPosition = this.clone();
        newPosition.moveLeft(step);
        if (newPosition.topLeft.x >= 0) {
            this.moveTo(newPosition);
        }
    };
    Paddle.prototype.moveRight = function (step) {
        var newPosition = this.clone();
        newPosition.moveRight(step);
        if (newPosition.bottomRight.x <= this.maxRight + (2 * this.sprite.offsetWidth)) {
            this.moveTo(newPosition);
        }
    };
    Paddle.prototype.calculateHitAngle = function (ballX, ballRadius) {
        var hitPoint = ballX - this.topLeft.x;
        var maxPaddle = this.with() + ballRadius;
        var minPaddle = -ballRadius;
        var paddleRange = maxPaddle - minPaddle;
        var minAngle = 160;
        var maxAngle = 20;
        var angleRange = maxAngle - minAngle;
        return ((hitPoint * angleRange) / paddleRange) + minAngle;
    };
    return Paddle;
}(Sprite));
var Ball = (function (_super) {
    __extends(Ball, _super);
    function Ball(sprite, direction) {
        var _this;
        var radius = 16;
        _this = _super.call(this, sprite, sprite.offsetLeft, sprite.offsetTop, sprite.offsetLeft + 2 * radius, sprite.offsetTop + 2 * radius) || this;
        _this.sprite = sprite;
        _this.radius = radius;
        _this.dir = direction;
        _this.velocity = 5;
        return _this;
    }
    Ball.prototype.calculateNewPosition = function () {
        var newPosition = this.clone();
        newPosition.add(this.dir);
        return newPosition;
    };
    Ball.prototype.bounceHorizontal = function () {
        this.dir.flipY();
    };
    Ball.prototype.bounceVertical = function () {
        this.dir.flipX();
    };
    Ball.prototype.moveTo = function (rect) {
        _super.prototype.moveTo.call(this, rect);
        var _a = this.topLeft, posX = _a.x, posY = _a.y;
        this.sprite.style.left = posX + "px";
        this.sprite.style.top = posY + "px";
    };
    Ball.prototype.bounceWithAngle = function (angle) {
        angle = angle * (Math.PI / 180);
        this.dir.x = Math.cos(angle) * this.velocity;
        this.dir.y = -Math.sin(angle) * this.velocity;
    };
    return Ball;
}(Sprite));
var GameState;
(function (GameState) {
    GameState[GameState["Running"] = 0] = "Running";
    GameState[GameState["GameOver"] = 1] = "GameOver";
})(GameState || (GameState = {}));
var KeyCodes;
(function (KeyCodes) {
    KeyCodes[KeyCodes["LEFT"] = 37] = "LEFT";
    KeyCodes[KeyCodes["RIGHT"] = 39] = "RIGHT";
})(KeyCodes || (KeyCodes = {}));
var Brick = (function (_super) {
    __extends(Brick, _super);
    function Brick() {
        return _super.apply(this, arguments) || this;
    }
    return Brick;
}(Sprite));
var Game = (function () {
    function Game(ballElement, paddle, boardElement, bricks, lives, score, newGameButton) {
        var _this = this;
        this.lives = lives;
        this.score = score;
        this.newGameButton = newGameButton;
        this.loopInterval = 20;
        this.paddle = new Paddle(paddle, boardElement.offsetWidth);
        this.gameState = GameState.Running;
        this.ballElement = ballElement;
        this.ball = new Ball(ballElement, new Vector(-2, -2));
        this.bricks = [];
        for (var i = 0; i < bricks.length; i++) {
            this.bricks.push(new Brick(bricks[i]));
        }
        this.createWalls(this.ball.radius, boardElement.offsetWidth, boardElement.offsetHeight);
        this.newGame();
        this.newGameButton.addEventListener('click', function () { return _this.newGame(); });
    }
    Game.prototype.newGame = function () {
        this.gameState = GameState.Running;
        this.newGameButton.style.display = 'none';
        this.livesLeft = 3;
        this.lives.innerText = '' + this.livesLeft;
        this.scoreNumber = 0;
        this.ball.bounceWithAngle(60);
        var ballPosition = this.ball.clone();
        ballPosition.moveCenterXTo(this.paddle.centerX());
        ballPosition.moveBottomTo(this.paddle.topLeft.y - 4);
        this.ball.moveTo(ballPosition);
        this.ball.show();
    };
    Game.prototype.lostLives = function () {
        if (--this.livesLeft) {
            this.ball.bounceWithAngle(600);
            var ballPosition = this.ball.clone();
            ballPosition.moveCenterXTo(this.paddle.centerX());
            ballPosition.moveBottomTo(this.paddle.topLeft.y - 4);
            this.ball.moveTo(ballPosition);
        }
        else {
            this.gameState = GameState.GameOver;
            this.newGameButton.style.display = 'block';
            this.ball.hide();
        }
        this.lives.innerText = '' + this.livesLeft;
    };
    Game.prototype.createWalls = function (radius, maxX, maxY) {
        this.wallLeft = new Obstacle(-radius, -radius, 0, maxY + radius);
        this.wallTop = new Obstacle(-radius, -radius, maxX + radius, 0);
        this.wallRight = new Obstacle(maxX, -radius, maxX + radius, maxY + radius);
        this.wallBottom = new Obstacle(-radius, maxY, maxX + radius, maxY + radius);
    };
    Game.prototype.run = function () {
        var _this = this;
        // document.addEventListener('keyup', (e) => {
        //     // this.keyMap[e.keyCode] = false;
        //     // if(e.keyCode === 37 ) {
        //     //     this.paddle.moveLeft(5);
        //     // }
        // });
        document.addEventListener('keydown', function (e) {
            // this.keyMap[e.keyCode] = true;
            if (e.keyCode === 37) {
                _this.paddle.moveLeft(5);
            }
            else if (e.keyCode === 39) {
                _this.paddle.moveRight(5);
            }
        });
        setInterval(function () {
            if (_this.gameState !== GameState.Running) {
                return;
            }
            var newBallPosition = _this.ball.calculateNewPosition();
            // if(this.keyMap[KeyCodes.LEFT]) {
            //     this.paddle.moveLeft(5);
            // } else if(this.keyMap[KeyCodes.RIGHT]) {
            //     this.paddle.moveRight(5);
            // }
            if (_this.wallBottom.checkCollision(newBallPosition)) {
                _this.lostLives();
                return;
            }
            if (_this.wallLeft.checkCollision(newBallPosition) || _this.wallRight.checkCollision(newBallPosition)) {
                _this.ball.bounceVertical();
            }
            if (_this.wallTop.checkCollision(newBallPosition) || _this.wallBottom.checkCollision(newBallPosition)) {
                _this.ball.bounceHorizontal();
            }
            for (var _i = 0, _a = _this.bricks; _i < _a.length; _i++) {
                var brick = _a[_i];
                var wasHit = false;
                switch (brick.checkCollision(newBallPosition)) {
                    case (Side.Left):
                    case (Side.Right):
                        _this.ball.bounceVertical();
                        wasHit = true;
                        break;
                    case (Side.Top):
                    case (Side.Bottom):
                        _this.ball.bounceHorizontal();
                        wasHit = true;
                        break;
                }
                if (wasHit) {
                    _this.scoreNumber += 20;
                    _this.score.innerHTML = '' + _this.scoreNumber;
                    brick.hide();
                    break;
                }
            }
            if (_this.paddle.checkCollision(newBallPosition)) {
                _this.ball.bounceWithAngle(_this.paddle.calculateHitAngle(_this.ball.centerX(), _this.ball.radius));
            }
            _this.ball.moveTo(newBallPosition);
        }, this.loopInterval);
    };
    return Game;
}());
var game = new Game(document.getElementsByClassName("ball")[0], document.getElementsByClassName("paddle")[0], document.getElementsByClassName("game-board")[0], document.getElementsByClassName("brick"), document.getElementById("lives"), document.getElementById("score"), document.getElementById("newGame"));
game.run();
