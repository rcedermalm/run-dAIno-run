var StateOver = {    
    preload: function() {
        game.load.image("playAgain", "../images/playAgain.png");
    },
    create: function()
    {
    	//add a sprite to be used as a play again button
        this.playAgain = game.add.sprite(game.width/2, game.height/2, "playAgain");
        //center the button image
        this.playAgain.anchor.set(0.5, 0.5);
        //enable for input
        this.playAgain.inputEnabled = true;
        //add an event listener
        this.playAgain.events.onInputDown.add(this.restartGame,this);

    },
    restartGame:function()
    {
    	//restart the game by starting stateMain
    	game.state.start("StateMain");
    }
}