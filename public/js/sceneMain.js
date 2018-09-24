var up_key, space_key, down_key, world_velocity = -250; 

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
        
        this.ground = game.add.sprite(0, game.height * .9, "ground");
        this.dino = game.add.sprite(game.width*.05, 0, "dino");
        this.dino.y = this.ground.y - this.dino.height;
        this.startY = this.dino.y;

        /////////////////////////////////////////////////
        // Physics

        //start the physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //enable the dino for physics
        game.physics.enable(this.dino, Phaser.Physics.ARCADE);
        game.physics.enable(this.ground, Phaser.Physics.ARCADE);
 
        this.dino.body.gravity.y = 1300;
        this.dino.body.maxVelocity.y = 500;
        this.dino.body.collideWorldBounds = true;
        this.ground.body.immovable = true;

        /////////////////////////////////////////////////
        // Set keyboard input 
        up_key = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        space_key = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        down_key = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

        ////////////////////////////////////////////////
        // Get random obstacle
        this.getRandomCactus();
    },
    getBird: function() {
        if (this.bird) {
            this.bird.destroy();
        }
        var birdY = game.rnd.integerInRange(game.height * .1, game.height * .4);
        this.bird = game.add.sprite(game.width + 100, birdY, "bird");
       
        game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        this.bird.body.velocity.x = game.rnd.integerInRange(-300, -100);;
        this.bird.body.bounce.set(2, 2);
    },
    getRandomCactus: function() {
        var cactus_nr = game.rnd.integerInRange(1, 2);
        this.random_cactus = game.add.sprite(100, 0, "cactus_" + cactus_nr);
        this.random_cactus.y = this.ground.y-this.random_cactus.height;
        this.random_cactus.x = game.width - this.random_cactus.width;

        game.physics.enable(this.random_cactus, Phaser.Physics.ARCADE);
        this.random_cactus.body.velocity.x = world_velocity;
        this.random_cactus.body.gravity.y = 4;
        this.random_cactus.body.bounce.set(1,1);
    },
    doJump: function() {
        if(Math.abs(this.dino.y-this.startY) > 2)
            return;

        this.dino.body.velocity.y = -500;
    },
    doDuck: function() {
        this.dino.body.velocity.y = 500;
    },
    gameOver: function() {
        game.state.start("StateOver");
    },
    update: function() {
        // Set collisions
        game.physics.arcade.collide(this.dino, this.ground);
        game.physics.arcade.collide(this.dino, this.random_cactus, this.gameOver, null, this);
        game.physics.arcade.collide(this.ground, this.random_cactus);
        game.physics.arcade.collide(this.dino, this.bird, this.gameOver, null, this);

        // Handle keyboard input
        if (up_key.isDown || space_key.isDown)
            this.doJump();
        if(down_key.isDown)
            this.doDuck();

        // Get obstacles
        if (this.random_cactus.x < 0) 
            this.getRandomCactus();

        if (!this.bird || (this.bird.x < 0 && game.rnd.integerInRange(0, 100) < 2) )
            this.getBird();
            
    }
}