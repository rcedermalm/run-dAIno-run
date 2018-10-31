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
    MIN_RATE = 0.1,
    isExploring = true,
    isLearning = true,
    NR_OF_TRAINING_ROUNDS = 1000,
    NR_OF_LEARNING_ROUNDS = 100000,
    all_agents = undefined,
    agent_index = 0,
    current_agent = undefined;


// Create a new agent
function createNewAgent(){
    training_round = 0;
    best_score = 0;

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

    current_agent = {
        training_round: training_round,
        best_score: best_score,
        agent_index: all_agents.length,
        Qtable: Qtable
    }

    all_agents.push(current_agent);
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

}

// Choose which action to take, it could be random or not
function chooseAction(state){
    var actionIdx = 0;
    var inAir = StateMain.isInTheAir();

    if(isExploring){
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

        if(training_round > NR_OF_TRAINING_ROUNDS){
            if(EXPLORATION_RATE > MIN_RATE)
                EXPLORATION_RATE = EXPLORATION_RATE - 0.001;
        }

    } else {
        // Act according to policy
        var qState = Qtable[state];
        actionIdx = qState.indexOf(Math.max(...qState));
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
    }
}

// Update the Q-table
function updateQtable(QstateIdx, actionIdx, newQstateIdx) {
    if(isLearning){
        var qState = Qtable[QstateIdx];
        var qNewState =  Qtable[newQstateIdx];

        var maxQnew = Math.max(...qNewState);

        var oldValue = (1-LEARNING_RATE) * qState[actionIdx];
        var newValue = LEARNING_RATE * (getReward() + GAMMA * maxQnew);
        qState[actionIdx] = oldValue + newValue;
        if(visitedState[QstateIdx][actionIdx] > NR_OF_LEARNING_ROUNDS){
            if(LEARNING_RATE > MIN_RATE)
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

    var idx = 0;
    var closestObstacle = StateMain.getClosestObstacle();
    features[idx++] = closestObstacle.distanceInX;
    features[idx++] = closestObstacle.distanceToEndX;
    features[idx++] = closestObstacle.y;
    features[idx++] = StateMain.isInTheAir();
}

// Get the state from the features
function getState(currentFeatures) {
    var stateIndex = 0;
    if (currentFeatures[0] > 65) stateIndex += 1; // distance to closest obstacle, x
    if (currentFeatures[1] < 150) stateIndex += 2; // distance to closest obstacle's end, x
    if (currentFeatures[2] > 100) stateIndex += 4; // y value of closest obstacle
    if (currentFeatures[3]) stateIndex += 8; // if dino is in the air
    return stateIndex;
}

function saveAgent(){
    // Update the current agent
    var curr_idx = all_agents.findIndex(agent => agent.agent_index === agent_index);
    all_agents[curr_idx].training_round = training_round;
    all_agents[curr_idx].best_score = best_score;
    all_agents[curr_idx].Qtable = Qtable;

    // Save and download
    var json_data = JSON.stringify(all_agents);
    var file_data = "agents = '[" + json_data + "]';";
    downloadAgent(file_data, "agents.json");
}

function downloadAgent(content, fileName) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function readOldAgents(){
    all_agents = JSON.parse(agents);
}

function useAgent(curr_idx){
    StateMain.reset();
    createNewAgent();
    AIRunning = true;

    agent_index = all_agents[curr_idx].agent_index;
    training_round = all_agents[curr_idx].training_round;
    best_score = all_agents[curr_idx].best_score;
    Qtable = all_agents[curr_idx].Qtable;
    isExploring = false;
    isLearning = false;

    var element = document.getElementById("play-btn");
    element.classList.remove("no-show");
    element = document.getElementById("AI-btn");
    element.classList.add("no-show");
    element = document.getElementById("AI-phrase");
    element.classList.remove("no-show");
    element = document.getElementById("play-phrase");
    element.classList.add("no-show");
}

function playGame(){
    AIRunning = false;
    StateMain.reset();
    var element = document.getElementById("play-btn");
    element.classList.add("no-show");
    element = document.getElementById("AI-btn");
    element.classList.remove("no-show");
    element = document.getElementById("AI-phrase");
    element.classList.add("no-show");
    element = document.getElementById("play-phrase");
    element.classList.remove("no-show");
}

