var up_key, down_key; 

var StateMain = {
    preload: function() {
        game.load.image("ground", "../images/ground.png");
        game.load.image("dino", "../images/dino.png");
        game.load.image("cactus_1", "../images/cactus_1.png");
        game.load.image("cactus_2", "../images/cactus_2.png");
        game.load.image("bird", "../images/bird.png");
    },
    create: function() {
        game.stage.backgroundColor = "#ffffff";
        //add the ground
        this.ground = game.add.sprite(0, game.height * .9, "ground");
        //add the dino
        this.dino = game.add.sprite(game.width*.05, 0, "dino");
        this.dino.y = this.ground.y - this.dino.height;
        //record the initial position
        this.startY = this.dino.y;

        /////////////////////////////////////////////////
        // Physics

        //start the physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //enable the dino for physics
        game.physics.enable(this.dino, Phaser.Physics.ARCADE);
        game.physics.enable(this.ground, Phaser.Physics.ARCADE);
 
        this.dino.body.gravity.y = 350;
        this.dino.body.collideWorldBounds = true;
        this.ground.body.immovable = true;

        /////////////////////////////////////////////////
        // Input handlers
        up_key = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        down_key = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

        up_key.onDown.add(this.jumpKeyDown, this);
        down_key.onDown.add(this.duckKeyDown, this);

        this.getRandomCactus();


    },
    getBird: function() {
        //if the bird already exists destroy it
        if (this.bird) {
            this.bird.destroy();
        }
        //pick a number at the top of the screen
        //between 10 percent and 40 percent of the height of the screen
        var birdY = game.rnd.integerInRange(game.height * .1, game.height * .4);
        //add the bird sprite to the game
        this.bird = game.add.sprite(game.width + 100, birdY, "bird");
        //enable the sprite for physics
        game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        //set the x velocity at -200 which is a little faster than the blocks
        this.bird.body.velocity.x = -200;
        //set the bounce for the bird
        this.bird.body.bounce.set(2, 2);
    },
    getRandomCactus: function() {
        var cactus_nr = game.rnd.integerInRange(1, 2);
        this.random_cactus = game.add.sprite(100, 0, "cactus_" + cactus_nr);
        this.random_cactus.y = this.ground.y-this.random_cactus.height;
        this.random_cactus.x = game.width - this.random_cactus.width;

        game.physics.enable(this.random_cactus, Phaser.Physics.ARCADE);
        this.random_cactus.body.velocity.x = -150;
        this.random_cactus.body.gravity.y = 4;
        //set the bounce so the blocks will react to the dino
        this.random_cactus.body.bounce.set(1,1);

    },
    jumpKeyDown: function() {
        if(Math.abs(this.dino.y-this.startY) > 2)
            return;
        this.doJump();
    },
    duckKeyDown: function() {
        this.doDuck();
    },
    doJump: function() {
        this.dino.body.velocity.y = -240;
    },
    doDuck: function() {
        this.dino.body.velocity.y = 240;
    },
    gameOver: function() {
        game.state.start("StateOver");
    },
    update: function() {
        this.hero, this.blocks, this.delayOver, null, this

        game.physics.arcade.collide(this.dino, this.ground);
        game.physics.arcade.collide(this.dino, this.random_cactus, this.gameOver, null, this);
        game.physics.arcade.collide(this.ground, this.random_cactus);
        game.physics.arcade.collide(this.dino, this.bird, this.gameOver, null, this);

        if (this.random_cactus.x < 0) {
            this.getRandomCactus();
        }
        if (!this.bird || this.bird.x < 0) {
            this.getBird();
       }
    }
}