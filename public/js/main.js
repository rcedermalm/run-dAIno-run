var game;
window.onload = function()
{
	isMobile=navigator.userAgent.indexOf("Mobile");
    if (isMobile == -1) {
        isMobile = navigator.userAgent.indexOf("Tablet");
    }
    if (isMobile==-1)
        game = new Phaser.Game(600, 150, Phaser.AUTO, "phaser-game");
    else      
        game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, "phaser-game");  

    game.state.add("StateMain", StateMain);
    game.state.add("StateOver",StateOver);
    game.state.start("StateMain");
}