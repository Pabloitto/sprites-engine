(function() {

    var path = null;
    var ext = null;

    var ImageLoader = function(config) {
        var loaded = {};

        function getImg(name) {
            return loaded[name + ext];
        }

        function loadImage(name) {
            var image = null;
            if (!loaded[name + ext]) {
                image = new Image();
                loaded[name + ext] = image;
                image.src = path + name + ext;
            } else {
                image = loaded[name + ext];
            }
            return image;
        }

        return {
            getImg: getImg,
            loadImage: loadImage
        }
    };

    var Sprite = function(config) {

        var x = 0;
        var y = 0;
        var image = null;
        var onImageLoad = function() {};

        this.spriteName = config.spriteName;
        this.currentState = config.currentState;
        this.size = config.size;
        this.states = config.states;
        this.fps = config.fps;
        this.animationConfig = null;

        this.init = function() {
            var state = this.states.find(function(s) {
                return s.current === true;
            });
            x = state.startOn.x;
            y = state.startOn.y;
            image = ImageLoader().loadImage(this.spriteName);
            image.onload = function() {
                onImageLoad.bind(this)();
            }.bind(this);
            return this;
        }

        this.then = function(callBack) {
            onImageLoad = callBack;
            return this;
        }

        this.animate = function(config) {
            if (config.loop === false) {
                this.startAnimation(config);
                return this;
            }
            setInterval(function() {
                this.startAnimation(config);
            }.bind(this), this.fps);

            return this;
        }

        this.startAnimation = function(config) {
            this.animationConfig = config;
            var state = this.states.find(function(s) {
                return s.current === true;
            });
            if (state) {
                config.ctx.clearRect(config.position.x, config.position.y, this.size.width, this.size.height);
                config.ctx.drawImage(image,
                    x * this.size.width,
                    y * this.size.height,
                    this.size.width,
                    this.size.height,
                    config.position.x,
                    config.position.y,
                    this.size.width,
                    this.size.height);

                if (config.loop === true) {
                    this.updateAnimationPosition(state);
                }
            }
        }

        this.updateAnimationPosition = function(state) {
            if (x < state.endOn.x) {
                x++;
            } else {
                x = state.startOn.x;
            }

            if (y < state.endOn.y) {
                y++;
            } else {
                y = state.startOn.y;
            }
        }

        this.setState = function(name, overrideConfig, repaint) {
            this.states.forEach(function(element) {
                element.current = false;
                if (element.name === name) {
                    element.current = true;
                    x = element.startOn.x;
                    y = element.startOn.y;
                }
            }, this);
            if (repaint === true) {
                this.animationConfig.position = overrideConfig.position;
                this.startAnimation(this.animationConfig);
            }
            return this;
        }

        return this;
    };

    window.SpriteEngine = function(config) {
        path = config.path;
        ext = config.ext;

        return {
            Sprite: Sprite
        }
    };



    window.onload = function() {
        var canvas = document.querySelector(".main-canvas");
        var ctx = canvas.getContext("2d");
        var x = 0,
            y = 0;
        //test
        var spriteEngine = SpriteEngine({
            path: "./",
            ext: ".png"
        });

        var spriteTest = spriteEngine.Sprite({
            spriteName: "hero",
            size: { width: 20, height: 20 },
            fps: 500,
            states: [
                { name: "bottom", startOn: { x: 0, y: 0 }, endOn: { x: 2, y: 0 }, current: false },
                { name: "right", startOn: { x: 3, y: 0 }, endOn: { x: 5, y: 0 }, current: true },
                { name: "left", startOn: { x: 6, y: 0 }, endOn: { x: 8, y: 0 }, current: false },
                { name: "top", startOn: { x: 9, y: 0 }, endOn: { x: 11, y: 0 }, current: false }
            ]
        }).init().then(function() {
            this.animate({
                ctx: ctx,
                position: { x: 0, y: 0 },
                loop: false
            });
        });

        var KC = {
            UP: 38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39
        };

        window.addEventListener("keydown", function(evt) {
            if (evt.keyCode === KC.UP) {
                y--;
                spriteTest.setState("top", {
                    position: { x: x, y: y }
                }, true);
            } else if (evt.keyCode === KC.DOWN) {
                y++;
                spriteTest.setState("bottom", {
                    position: { x: x, y: y }
                }, true);
            } else if (evt.keyCode === KC.RIGHT) {
                x++;
                spriteTest.setState("right", {
                    position: { x: x, y: y }
                }, true);
            } else if (evt.keyCode === KC.LEFT) {
                x--;
                spriteTest.setState("left", {
                    position: { x: x, y: y }
                }, true);
            }
        }, false);
    }




}());