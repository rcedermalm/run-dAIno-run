var up_key, space_key, down_key, world_velocity = -250, nrOfCacti = 3, game_score; 

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

        game_score = 0;
        this.score_text = game.add.text(game.width - game.width*0.1, game.height * .05, ('000' + game_score).slice(-4), { font: "14px Palatino", fill: "#000000", align: "right" });
        timer = game.time.create(false);
        timer.loop(100, this.updateGameScore, this);
        timer.start();

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
        // Set random obstacles
        this.cacti = [3];
        this.bird = null;
    },
    updateGameScore: function() {
        game_score = game_score + 1;
        this.score_text.setText(('000' + game_score).slice(-4));
    },
    canCreateObstacle: function() {
        var max_x = 5 * game.width / 7;
        if(this.bird && this.bird.x > max_x )
            return false;

        for(var i = 0; i < nrOfCacti; i++){
            if(this.cacti[i] && this.cacti[i].x > max_x)
                return false;
        }

        return true;
    },
    getBird: function() {
        if(!this.canCreateObstacle())
            return;

        if(game.rnd.integerInRange(0, 300) > 1)
            return;
        
        this.bird = game.add.sprite(game.width + 100, 0, "bird");
        var rand = game.rnd.integerInRange(2, 5);    
        this.bird.y = this.ground.y - rand*(this.dino.height/2)
       
        game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        this.bird.body.velocity.x = world_velocity;
        this.bird.body.bounce.set(2, 2);
    },
    getRandomCactus: function() {
        if(!this.canCreateObstacle())
            return;
        if(game.rnd.integerInRange(0, 100) > 20)
            return;

        var cactus =  game.rnd.integerInRange(0, nrOfCacti-1);

        if(!this.cacti[cactus] || this.cacti[cactus].x < 0){
            var cactus_nr = game.rnd.integerInRange(1, 2);
            this.cacti[cactus] = game.add.sprite(100, 0, "cactus_" + cactus_nr);
            this.cacti[cactus].y = this.ground.y-this.cacti[cactus].height;
            this.cacti[cactus].x = game.width;

            game.physics.enable(this.cacti[cactus], Phaser.Physics.ARCADE);
            this.cacti[cactus].body.velocity.x = world_velocity;
            this.cacti[cactus].body.gravity.y = 4;
            this.cacti[cactus].body.bounce.set(1,1);
        }
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
        game.physics.arcade.collide(this.dino, this.bird, this.gameOver, null, this);
        for(var i = 0; i < nrOfCacti; i++){
            if(this.cacti[i]){
                game.physics.arcade.collide(this.dino, this.cacti[i], this.gameOver, null, this);
                game.physics.arcade.collide(this.ground, this.cacti[i]);
            }
        }

        // Handle keyboard input
        if (up_key.isDown || space_key.isDown)
            this.doJump();
        if(down_key.isDown)
            this.doDuck();

        // Make the game faster as the time moves on.
        if(game_score !== 0 && game_score % 100 === 0)
            world_velocity = world_velocity*1.005;

        // Get obstacles
        this.getRandomCactus();
        this.getBird();
            
    }
}