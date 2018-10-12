var training_round = 0,
    best_score = 0,
    NR_OF_FEATURES = 6,
    TOTAL_STATES = Math.pow(2, NR_OF_FEATURES), // since the features are binary classified
    NR_OF_ACTIONS = 2,
    Qtable = undefined,
    features = undefined,
    currentState = 0,
    newState = 0,
    lastAction = 2,
    GAMMA = 0.99,// # decay rate of past observations original 0.99
    LEARNING_RATE = 0.5,
    EXPLORATION_RATE = 0.6,
    MIN_EXPLORATION_RATE = 0.001,
    isTraining = true,
    NR_OF_TRAINING_ROUNDS = 100;


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
    var rand = Math.random();

    var actionIdx = 0;
    var inAir = StateMain.isInTheAir();

    if(isTraining){
        do {

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

    var oldValue = (1-LEARNING_RATE) * qState[actionIdx];
    var newValue = LEARNING_RATE * (getReward() + GAMMA * maxQnew);
    qState[actionIdx] = oldValue + newValue;
}

function getReward(){
    var reward = 0;
    if(!StateMain.getPlaying())
        return -10;

    var y = StateMain.getYIfBelowOrAboveObstacle();
    if(y === 0)
        return 1;
    return y/10;
    
}

// Calculate the features
function calculateFeatures(){
    // Chosen features:
    // * distance to closest obstacle, x
    // * distance to closest obstacle, y
    // * height of closest obstacle
    // * width of closest obstacle
    // * if dino is in the air
    // * number of obstacles present

    var idx = 0;
    var closestObstacle = StateMain.getClosestObstacle();
    features[idx++] = closestObstacle.distanceInX;
    features[idx++] = closestObstacle.distanceInY;
    features[idx++] = closestObstacle.height;
    features[idx++] = closestObstacle.width;
    features[idx++] = StateMain.isInTheAir();
    features[idx++] = StateMain.getNrOfObstaclesPresent();
}

// Get the state from the features
function getState(currentFeatures) {
    var stateIndex = 0;
    if (currentFeatures[0] > 100) stateIndex += 1; // distance to closest obstacle, x
    if (currentFeatures[1] < 50) stateIndex += 2; // distance to closest obstacle, y
    if (currentFeatures[2] > 25) stateIndex += 4; // height of closest obstacle
    if (currentFeatures[3] > 30) stateIndex += 8; // width of closest obstacle
    if (currentFeatures[4]) stateIndex += 16; // if dino is in the air
    if (currentFeatures[5] > 1) stateIndex += 32; // number of obstacles present
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

    trainingElement.innerHTML = training_round;
    scoreElement.innerHTML = best_score;
    unvisitedElement.innerHTML = getNrOfUnvisitedStates();
}

function boxChecked(){
    var checkBox = document.getElementById("is-training-box");
    isTraining = checkBox.checked;
}

