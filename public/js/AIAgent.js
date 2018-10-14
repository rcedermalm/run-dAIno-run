var training_round = 0,
    best_score = 0,
    NR_OF_FEATURES = 4,
    TOTAL_STATES = Math.pow(2, NR_OF_FEATURES), // since the features are binary classified
    NR_OF_ACTIONS = 2,
    Qtable = undefined,
    visitedState = undefined,
    features = undefined,
    currentState = 0,
    newState = 0,
    lastAction = 2,
    GAMMA = 0.99,// # decay rate of past observations original 0.99
    LEARNING_RATE = 0.5,
    EXPLORATION_RATE = 0.4,
    MIN_EXPLORATION_RATE = 0.1,
    isTraining = true,
    NR_OF_TRAINING_ROUNDS = 1000,
    NR_OF_LEARNING_ROUNDS = 100000;


// Create a new agent
function createNewAgent(){
    training_round = 0;

    // Initialize Qtable to -10 for all states and their actions.
    Qtable = new Array(TOTAL_STATES);
    for(var state = 0; state < TOTAL_STATES; state++){
        Qtable[state] = new Array(NR_OF_ACTIONS);
        for(var action = 0; action < NR_OF_ACTIONS; action++){
            Qtable[state][action] = 0;
        }
    }

    visitedState = new Array(TOTAL_STATES);
    for(var state = 0; state < TOTAL_STATES; state++){
        visitedState[state] = new Array(NR_OF_ACTIONS);
        for(var action = 0; action < NR_OF_ACTIONS; action++){
            visitedState[state][action] = 0;
        }
    }
}

// Initialize the agent, calculate features and the state
function initializeAgent() {
    features = new Array(NR_OF_FEATURES).fill(1.0);
    lastAction = 1;
    calculateFeatures();
    currentState = getState(features);
    training_round++;
}

function getAIaction() {

    // Evaluate the new state
    calculateFeatures();
    newState = getState(features);

    // update qTable for the last action since we now know if the 
    // last action was bad or good (died or survived)
    updateQtable(currentState, lastAction, newState);

    if(!StateMain.getPlaying()){
        StateMain.reset();
        return;
    }

    // Update current state to the new state
    currentState = newState;

    // Choose and do action according to the new state
    var actionIdx = chooseAction(currentState);
    doAction(actionIdx);
    
    // Update the old action to the new action
    lastAction = actionIdx;

    if(StateMain.getGameScore() > best_score)
        best_score = StateMain.getGameScore();

    updateAIinfo();
}

// Choose which action to take, it could be random or not
function chooseAction(state){
    

    var actionIdx = 0;
    var inAir = StateMain.isInTheAir();

    if(isTraining){
        do {
            var rand = Math.random();
            if(rand < EXPLORATION_RATE){
                // Act randomly
                actionIdx = Math.floor(Math.random() * NR_OF_ACTIONS);
            } else {
                // Act according to policy         
                var qState = Qtable[state];
                actionIdx = qState.indexOf(Math.max(...qState));
            }
        } while(inAir && actionIdx == 0);
    } else {
        // Act according to policy
        var qState = Qtable[state];
        actionIdx = qState.indexOf(Math.max(...qState));
    }

    if(training_round > NR_OF_TRAINING_ROUNDS){
        if(EXPLORATION_RATE > MIN_EXPLORATION_RATE)
            EXPLORATION_RATE = EXPLORATION_RATE - 0.001;
    }

    // return index of chosen action.
    return actionIdx;
}

function doAction(actionIdx){
    switch(actionIdx){
        case 0:
            StateMain.doJump();
            console.log("Idx: ", currentState);
            console.log("State: ", Qtable[currentState]);
            break;
        case 1:
            // Do nothing
            break;
        case 2:
            StateMain.doDuck();
            break;
    }
}

// Update the Q-table
function updateQtable(QstateIdx, actionIdx, newQstateIdx) {
    var qState = Qtable[QstateIdx];
    var qNewState =  Qtable[newQstateIdx];

    var maxQnew = Math.max(...qNewState);

    if(isTraining){
        var oldValue = (1-LEARNING_RATE) * qState[actionIdx];
        var newValue = LEARNING_RATE * (getReward() + GAMMA * maxQnew);
        qState[actionIdx] = oldValue + newValue;
        if(visitedState[QstateIdx][actionIdx] > NR_OF_LEARNING_ROUNDS){
            if(LEARNING_RATE > MIN_EXPLORATION_RATE)
                LEARNING_RATE = LEARNING_RATE - 0.00001;
        }

        visitedState[QstateIdx][actionIdx]++;
    }
    
}

function getReward(){
    
    if(!StateMain.getPlaying())
        return -10;

    var reward = 0.1; // Survival reward

    var y = StateMain.getYIfBelowOrAboveObstacle();
    if(y === 0)
        return reward;
    return reward + y/10;
    
}

// Calculate the features
function calculateFeatures(){
    // Chosen features:
    // * distance to closest obstacle, x
    // * distance to closest obstacle'end in x
    // * height of closest obstacle
    // * if dino is in the air
    // * number of obstacles present

    var idx = 0;
    var closestObstacle = StateMain.getClosestObstacle();
    features[idx++] = closestObstacle.distanceInX;
    features[idx++] = closestObstacle.distanceToEndX;
    features[idx++] = closestObstacle.y;
    features[idx++] = StateMain.isInTheAir();
   // features[idx++] = StateMain.getNrOfObstaclesPresent();
}

// Get the state from the features
function getState(currentFeatures) {
    var stateIndex = 0;
    if (currentFeatures[0] > 65) stateIndex += 1; // distance to closest obstacle, x
    if (currentFeatures[1] < 150) stateIndex += 2; // distance to closest obstacle's end, x
    if (currentFeatures[2] > 100) stateIndex += 4; // y value of closest obstacle
    if (currentFeatures[3]) stateIndex += 8; // if dino is in the air
 //   if (currentFeatures[4] > 1) stateIndex += 16; // number of obstacles present
    return stateIndex;
}

function getNrOfUnvisitedStates(){
    var unvisited = 0;
    for(var state = 0; state < TOTAL_STATES; state++){
        for(var action = 0; action < NR_OF_ACTIONS; action++){
            if(Qtable[state][action] == 0)
                unvisited++;
        }
    }
    return unvisited;
}

function updateAIinfo(){
    var trainingElement = document.getElementById('training-round');
    var scoreElement = document.getElementById('best-score');
    var unvisitedElement = document.getElementById('unvisited-states');
    var learningElement = document.getElementById('learning-rate');
    var explorationElement = document.getElementById('exploration-rate');

    trainingElement.innerHTML = training_round;
    scoreElement.innerHTML = best_score;
    learningElement.innerHTML = LEARNING_RATE;
    explorationElement.innerHTML = EXPLORATION_RATE;
    unvisitedElement.innerHTML = getNrOfUnvisitedStates();

}

function boxChecked(){
    var checkBox = document.getElementById("is-training-box");
    isTraining = checkBox.checked;
}

function saveAgent(){
    var agent = {
        training_round: training_round,
        best_score: best_score,
        Qtable: Qtable,
    }

    var json_data = JSON.stringify(agent);
    downloadAgent(json_data, "agent.txt");
}

function downloadAgent(content, fileName) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

