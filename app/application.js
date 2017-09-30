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
    Obstacle.prototype.checkCollision = function (anotherRect) {
        var w = 0.5 * (this.with() + anotherRect.with());
        var h = 0.5 * (this.height() + anotherRect.height());
        var dx = this.centerX() - anotherRect.centerX();
        var dy = this.centerY() - anotherRect.centerY();
        if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
            var wy = w * dy;
            var hx = h * dx;
            if (wy > hx) {
                return wy > -hx ? Side.Bottom : Side.Left;
            }
            else {
                return wy > -hx ? Side.Right : Side.Top;
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
    //TO TEZ
    Sprite.prototype.checkCollision = function (anotherRect) {
        if (this.isVisible) {
            return Side.None;
        }
        return _super.prototype.checkCollision.call(this, anotherRect);
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
            console.log(this.maxRight);
            this.moveTo(newPosition);
        }
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
    function Game(ballElement, paddle, boardElement, bricks) {
        this.loopInterval = 20;
        this.paddle = new Paddle(paddle, boardElement.offsetWidth);
        this.gameState = GameState.Running;
        this.ballElement = ballElement;
        this.ball = new Ball(ballElement, new Vector(1, -1));
        this.bricks = [];
        for (var i = 0; i < bricks.length; i++) {
            this.bricks.push(new Brick(bricks[i]));
        }
        this.createWalls(this.ball.radius, boardElement.offsetWidth, boardElement.offsetHeight);
    }
    Game.prototype.createWalls = function (radius, maxX, maxY) {
        this.wallLeft = new Obstacle(-radius, -radius, 0, maxY + radius);
        this.wallTop = new Obstacle(-radius, -radius, maxX + radius, 0);
        this.wallRight = new Obstacle(maxX, -radius, maxX + radius, maxY + radius);
        this.wallBottom = new Obstacle(-radius, maxY, maxX + radius, maxY + radius);
    };
    Game.prototype.run = function () {
        var _this = this;
        document.addEventListener('keydown', function (e) {
            if (e.keyCode === KeyCodes.LEFT) {
                _this.paddle.moveLeft(10);
            }
            if (e.keyCode === KeyCodes.RIGHT) {
                _this.paddle.moveRight(10);
            }
        });
        setInterval(function () {
            if (_this.gameState !== GameState.Running) {
                return;
            }
            var newBallPosition = _this.ball.calculateNewPosition();
            if (_this.wallBottom.checkCollision(newBallPosition)) {
                _this.gameState = GameState.GameOver;
                _this.ball.hide();
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
                        wasHit = true;
                        _this.ball.bounceHorizontal();
                        break;
                    case (Side.Top):
                        wasHit = true;
                        _this.ball.bounceVertical();
                        break;
                }
                if (wasHit) {
                    brick.hide();
                    break;
                }
            }
            switch (_this.paddle.checkCollision(newBallPosition)) {
                case (Side.Left):
                case (Side.Right):
                    _this.ball.bounceHorizontal();
                    break;
                case (Side.Top):
                    _this.ball.bounceVertical();
                    break;
            }
            _this.ball.moveTo(newBallPosition);
        }, this.loopInterval);
    };
    return Game;
}());
var game = new Game(document.getElementsByClassName("ball")[0], document.getElementsByClassName("paddle")[0], document.getElementsByClassName("game-board")[0], document.getElementsByClassName("brick"));
game.run();
