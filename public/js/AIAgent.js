
function runAIAgent() {
  //  console.log("Agent running...");
    setInterval( runningAI, 100);
}

function runningAI() {
    //agentJump();
   // console.log(StateMain.getGameScore());
}


////////////////////////
// Actions

function agentJump() {
    StateMain.doJump();
}

function agentDuck() {
    StateMain.doDuck();
}