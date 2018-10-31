# run-dAIno-run
Project in the course TNM095 - Artificial Intelligence for Interactive Media.

A version of the game created as an offline game for Google Chrome was implemented using Javascript and the framework Phaser.io. The game is an endless runner where the player plays a dinosaur trying to survive in the desert. This is done by jumping over or moving below different kinds of obstacles.

An AI agent was trained to play the game using reinforcement learning and Q-learning. Q-learning is a part of machine learning where the agent learns to optimize the policy by the rewards given. It explores the world by doing an action and seeing what reward it gets. The world is represented as different states and for each state the agent can make a few actions. In this case the state is represented by the distance to the closest obstacle, the distance to the end of the closest obstacle, the y-value of the closest obstacle and if the player is in the air or not. The actions possible are jumping or doing nothing.

Q-learning was proven to be a good method for this kind of problem. The agent was able to learn the game very good and could possible survive in it forever. The agent also handles a change in velocity of the game pretty well but to really make it work, another action, like being able to duck and therefore fall faster to the ground, needs to be introduced.
