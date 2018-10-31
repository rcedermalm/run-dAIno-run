var up_key, space_key, down_key, start_world_velocity = -250, nrOfCacti = 3, AIRunning = false, increasingVelocity = false; 

var StateMain = {
    preload: function() {
        game.load.image("ground_visible", "../images/ground.png");
        game.load.image("ground", "../images/ground_physic.png");
        game.load.image("dino", "../images/dino.png");
        game.load.image("dino_dead", "../images/dino_dead.png");
        game.load.image("dino_running_1", "../images/dino_running1.png");
        game.load.image("dino_running_2", "../images/dino_running2.png");
        game.load.image("cactus_1", "../images/cactus_1.png");
        game.load.image("cactus_2", "../images/cactus_2.png");
        game.load.image("cactus_3", "../images/cactus_3.png");
        game.load.image("cactus_4", "../images/cactus_4.png");
        game.load.image("bird_1", "../images/bird_1.png");
        game.load.image("bird_2", "../images/bird_2.png");
        game.load.image("gameOver", "../images/playAgain.png");
    },
    create: function() {
        game.stage.disableVisibilityChange = true;
        game.stage.backgroundColor = "#ffffff";
        this.gameRunning = true;
        this.world_velocity = start_world_velocity;

        this.useFirstRunning = false;
        this.runningTimer = game.time.create(false);
        this.runningTimer.loop(100, this.changeOfTextures, this);
        this.runningTimer.start();

        this.game_score = 0;
        this.score_text = game.add.text(game.width - game.width*0.1, game.height * .05, ('000' + this.game_score).slice(-4), { font: "14px Palatino", fill: "#000000", align: "right" });
        this.timer = game.time.create(false);
        this.timer.loop(100, this.updateGameScore, this);
        this.timer.start();

        this.groundVisible = game.add.tileSprite(0, game.height*.9, game.width, 30, "ground_visible");
        this.groundVisible.autoScroll(this.world_velocity, 0);

        this.ground = game.add.sprite(0, game.height*0.98, "ground");

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
        this.cacti = [nrOfCacti];
        this.bird = null;

        ////////////////////////////////////////////////
        // AI related
        if(AIRunning){
            this.AIisRunning = false;
            this.AItimer = game.time.create(false);
            this.AItimer.loop(100, this.runAI, this);
            this.AItimer.start();
        }
    },
    runAI: function() {
        // Handle AI
       if(this.AIisRunning)
           getAIaction();
    },
    changeOfTextures: function() {
        this.useFirstRunning = !this.useFirstRunning;
        
        if(this.bird){ 
            if(this.useFirstRunning)
                this.bird.loadTexture('bird_1');
            else
                this.bird.loadTexture('bird_2');
        }

        if(Math.abs(this.dino.y-this.startY) > 2){
            this.dino.loadTexture('dino');
        } else {
            if(this.useFirstRunning)
                this.dino.loadTexture('dino_running_1');           
            else 
                this.dino.loadTexture('dino_running_2');
        }
    },
    updateGameScore: function() {
        this.game_score = this.game_score + 1;
        this.score_text.setText(('000' + this.game_score).slice(-4));
    },
    updateVelocities: function() {
        this.groundVisible.autoScroll(this.world_velocity, 0);

        for(var i = 0; i < nrOfCacti; i++){
            if(this.cacti[i] && this.cacti[i].body){
                this.cacti[i].body.velocity.x = this.world_velocity;
            }
        }

        if(this.bird && this.bird.body)
            this.bird.body.velocity.x = this.world_velocity;
    },
    canCreateObstacle: function() {
        var max_x = Math.max(0, game.width - 250 + this.world_velocity/10);
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
        
        this.bird = game.add.sprite(game.width + 100, 0, "bird_1");
        var rand = game.rnd.integerInRange(2, 5);    
        this.bird.y = this.ground.y - rand*(this.dino.height/2)
       
        game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        this.bird.body.velocity.x = this.world_velocity;
        this.bird.body.setSize(this.bird.body.width-5, this.bird.body.height-5, 5, 5);
    },
    getRandomCactus: function() {
        if(!this.canCreateObstacle())
            return;
        if(game.rnd.integerInRange(0, 100) > 20)
            return;

        var cactus =  game.rnd.integerInRange(0, nrOfCacti-1);

        if(!this.cacti[cactus] || this.cacti[cactus].x < 0){
            var cactus_nr = game.rnd.integerInRange(1, 4);
            this.cacti[cactus] = game.add.sprite(100, 0, "cactus_" + cactus_nr);
            this.cacti[cactus].y = this.ground.y - this.cacti[cactus].height;
            this.cacti[cactus].x = game.width;

            game.physics.enable(this.cacti[cactus], Phaser.Physics.ARCADE);
            this.cacti[cactus].body.velocity.x = this.world_velocity;
            this.cacti[cactus].body.gravity.y = 4;

            this.cacti[cactus].body.setSize(this.cacti[cactus].body.width - 10, this.cacti[cactus].body.height, 10, 0);
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
        this.runningTimer.destroy();
        this.dino.loadTexture('dino_dead');
        this.gameRunning = false;
        this.freezeGame();
        space_key.onDown.add(this.reset, this);  
        game.input.onDown.add(this.reset, this); 

        this.playAgain = game.add.sprite(game.width/2, game.height/2, "gameOver");
        this.playAgain.anchor.set(0.5, 0.5);
    },
    freezeGame: function() {
        this.groundVisible.stopScroll();
        this.dino.body.velocity = 0;
        if(this.bird)
            this.bird.body.velocity = 0;

        for(var i = 0; i < nrOfCacti; i++){
            if(this.cacti[i] && this.cacti[i].body)
                this.cacti[i].body.velocity = 0;
        }

        this.timer.stop();
    },
    reset: function() {
        this.gameRunning = true;
        game.state.start(game.state.current);
    },
    update: function() {
        if( AIRunning && !this.AIisRunning){
            initializeAgent();
            this.AIisRunning = true;
        }

        // Set collisions
        game.physics.arcade.collide(this.dino, this.ground);
        game.physics.arcade.collide(this.dino, this.bird, this.gameOver, null, this);
        for(var i = 0; i < nrOfCacti; i++){
            if(this.cacti[i]){                   
                game.physics.arcade.collide(this.dino, this.cacti[i], this.gameOver, null, this);
                game.physics.arcade.collide(this.ground, this.cacti[i]);
            }
        }
        
        if(!this.gameRunning){
              return;
        }
   
        // Handle keyboard input
        if (up_key.isDown || space_key.isDown)
            this.doJump();
        if(down_key.isDown)
            this.doDuck();

        // Make the game faster as the time moves on.
        if(increasingVelocity && this.game_score !== 0 && this.game_score % 100 === 0){
              this.world_velocity = this.world_velocity - 5;
              this.updateVelocities();
        }

        // Get obstacles
        this.getRandomCactus();
        this.getBird();
            
    },
    ///////////////////////
    // AI related functions
    getGameScore: function() {
        return this.game_score;
    },
    getPlaying: function() {
        return this.gameRunning;
    },
    getWorldVelocity: function() {
        return this.world_velocity;
    },
    isInTheAir: function() {
        return (this.dino.y < this.startY);
    },
    getYIfBelowOrAboveObstacle: function(){
        var closest_obstacle, temp, dist = 1200;

        if(this.bird && this.bird.body){
            temp = Math.sqrt(Math.pow(this.bird.x - this.dino.x, 2) + Math.pow(this.bird.y - this.dino.y, 2));
            if(temp < dist){
                dist = temp;
                closest_obstacle = {
                    height: this.bird.body.height,
                    width: this.bird.body.width,
                    x: this.bird.x,
                    y: this.bird.y    
                };
            }
        }

        for(var i = 0; i < nrOfCacti; i++){
            if(this.cacti && this.cacti[i] && this.cacti[i].body){                   
                temp = Math.sqrt(Math.pow(this.cacti[i].x - this.dino.x, 2) + Math.pow(this.cacti[i].y - this.dino.y, 2));
                if(temp < dist){
                    dist = temp;
                    closest_obstacle = {
                        height: this.cacti[i].body.height,
                        width: this.cacti[i].body.width,
                        x: this.cacti[i].x,
                        y: this.cacti[i].y    
                    };
                }
            }
        }

        // No obstacles close
        if(dist === 1200)
            return 0;

        // Not on the same x positions
        var diffX = this.dino.x - closest_obstacle.x;
        if(!(diffX > 0 && diffX < closest_obstacle.width))
            return 0;

        //Negative: obstacle beneath, positive: obstacle above 
        var realDiffY = 0, diffY = this.dino.y - closest_obstacle.y; 
        if(diffY < 0){
            realDiffY = closest_obstacle.y - (this.dino.y + this.dino.height);
        } else {
            realDiffY = this.dino.y - (closest_obstacle.y + closest_obstacle.height);
        }
        return realDiffY;
    },
    getNrOfObstaclesPresent: function() {
        var nrOfObstacles = 0;

        if(this.bird && this.bird.body)
            nrOfObstacles++;
        
        for(var i = 0; i < nrOfCacti; i++){
            if(this.cacti[i] && this.cacti[i].body){                   
               nrOfObstacles++;
            }
        }

        return nrOfObstacles;
    },
    getClosestObstacle: function() {
        var dist = 1200, temp = 0;
        var obstacle;

        if(this.bird && this.bird.body && this.bird.x > this.dino.x){
            temp = Math.sqrt(Math.pow(this.bird.x - this.dino.x, 2) + Math.pow(this.bird.y - this.dino.y, 2));
            if(temp < dist){
                dist = temp;
                obstacle = {
                    distanceInX: this.bird.x - this.dino.x, 
                    distanceToEndX: this.bird.x + this.bird.body.width - this.dino.x,
                    y: this.bird.y    
                };
            }
        }

        for(var i = 0; i < nrOfCacti; i++){
            if(this.cacti && this.cacti[i] && this.cacti[i].body && this.cacti[i].x > this.dino.x){                   
                temp = Math.sqrt(Math.pow(this.cacti[i].x - this.dino.x, 2) + Math.pow(this.cacti[i].y - this.dino.y, 2));
                if(temp < dist){
                    dist = temp;
                    obstacle = {
                        distanceInX: this.cacti[i].x - this.dino.x, 
                        distanceToEndX: this.cacti[i].x + this.cacti[i].body.width - this.dino.x,
                        y: this.cacti[i].y    
                    };
                }
            }
        }

        if(dist == 1200){
            obstacle = {
                distanceInX: 800, 
                distanceToEndX: 1000,
                y: 800    
            };
        }
        return obstacle;
    }
}

function increaseVelocity(){
    increasingVelocity = !increasingVelocity;
}