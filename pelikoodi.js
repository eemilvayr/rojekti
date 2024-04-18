// credits to https://www.codemahal.com/make-2d-game-javascript for the code
// Create the canvas for the game to display in
// Get the instruction page and start button elements
function startGame() {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = 1024;
  canvas.height = 768;
  document.body.appendChild(canvas);

  // Load the background image
  var bgReady = false;
  var bgImage = new Image();
  bgImage.onload = function () {
    // show the background image
    bgReady = true;
  };
  bgImage.src = "tausta.png";

  // Load the player image
  var playerReady = false;
  var playerImage = new Image();
  playerImage.onload = function () {
    // show the player image
    playerReady = true;
  };
  playerImage.src = "ukko.png";

  // Load the enemy image
  var enemyReady = false;
  var enemyImage = new Image();
  enemyImage.onload = function () {
    // show the enemy image
    enemyReady = true;
  };
  enemyImage.src = "kolikko.png";

  // Create the game objects
  var player = {
    speed: 200 // movement speed of player in pixels per second
  };
  var enemy = {};
  var enemiesCaught = 0;

  // Handle keyboard controls
var keysDown = {};

// Check for keys pressed where key represents the key pressed
addEventListener("keydown", function (event) {
  keysDown[event.key] = true;
}, false);

addEventListener("keyup", function (event) {
  delete keysDown[event.key];
}, false);

// Reset the player and enemy positions when player catches an enemy
var reset = function () {
  // Reset player's position to centre of canvas
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;

  // Place the enemy somewhere on the canvas randomly
  enemy.x = enemyImage.width + (Math.random() * (canvas.width - (enemyImage.width*2)));
  enemy.y = enemyImage.height + (Math.random() * (canvas.height - (enemyImage.height*2)));

  // Load the player image
  playerImage.onload = function () {
    playerReady = true;
  };
  playerImage.src = "ukko.png";

  // Load the enemy image
  enemyImage.onload = function () {
    enemyReady = true;
  };
  enemyImage.src = "kolikko.png";
};

// Update game objects - change player position based on key pressed
var update = function (modifier) {
  if (!finished) { // Only update if the game is not finished
    if ("ArrowUp" in keysDown || "w" in keysDown) { // Player is holding up key
      player.y -= player.speed * modifier;
    }
    if ("ArrowDown" in keysDown || "s" in keysDown) { // Player is holding down key
      player.y += player.speed * modifier;
    }
    if ("ArrowLeft" in keysDown || "a" in keysDown) { // Player is holding left key
      player.x -= player.speed * modifier;
    }
    if ("ArrowRight" in keysDown || "d" in keysDown) { // Player is holding right key
      player.x += player.speed * modifier;
    }
  }

  if (player.x < 0) { // left border
    player.x = 0;
  }
  if (player.y < 0) { // top border
    player.y = 0;
  }
  if (player.x > canvas.width - playerImage.width) { // right border
    player.x = canvas.width - playerImage.width;
  }
  if (player.y > canvas.height - playerImage.height) { // bottom border
    player.y = canvas.height - playerImage.height;
  }
  // Check if player and enemy collide
  if (
    player.x <= (enemy.x + enemyImage.width)
    && enemy.x <= (player.x + playerImage.width)
    && player.y <= (enemy.y + enemyImage.height)
    && enemy.y <= (player.y + playerImage.height)
  ) {
    ++enemiesCaught;
    reset();
  }
};

// Get the button element
canvas.addEventListener('click', function(event) {
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  // Check if the button was clicked
  if (x >= restartButton.x && x <= restartButton.x + restartButton.width &&
      y >= restartButton.y && y <= restartButton.y + restartButton.height) {
    // Reset the game
    reset();

    // Reset the score
    enemiesCaught = 0;

    // Reset the timer
    count = 1;

    // Reset the game over flag
    finished = false;
  }
});

var restartButton = {
  x: canvas.width / 2,
  y: canvas.height / 2 + 30,
  width: 100,
  height: 20
};
// Draw everything on the canvas
var render = function () {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0);
  }

  if (!finished) { // Only draw the player and enemies if the game is not finished
    if (playerReady) {
      ctx.drawImage(playerImage, player.x, player.y);
    }

    if (enemyReady) {
      ctx.drawImage(enemyImage, enemy.x, enemy.y);
    }
  }

  // Display score and time 
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "24px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Kolikoita kerätty: " + enemiesCaught, 20, 20);
  ctx.fillText("Aikaa jäljellä: " + count, 20, 50);
  // Get the highscore from localStorage
  var highscore = localStorage.getItem('highscore') || 0;

  // Display the highscore
  ctx.fillText("Ennätys: " + highscore, 20, 80);

  // Display game over message when timer finished
  if(finished==true){
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.textAlign = "center"; // center alignment for x axis
    ctx.textBaseline = "middle"; // middle alignment for y axis
    ctx.fillText("Loppu!", canvas.width / 2, canvas.height / 2);
    // Draw the restart button
    ctx.fillText("Uudelleen", restartButton.x, restartButton.y);
    // Draw a rectangle around the button
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.strokeRect(restartButton.x - 57, restartButton.y - 12, restartButton.width + 15, restartButton.height + 5);
  }

  // After the game is finished
  if(finished==true){
    // If there is no highscore or the current score is higher than the highscore
    if(enemiesCaught > highscore){
      // Update the highscore
      localStorage.setItem('highscore', enemiesCaught);
    }
}
};

var count = 1; // how many seconds the game lasts for - default 30
var finished = false;
var counter =function(){
  count=count-1; // countown by 1 every second
  // when count reaches 0 clear the timer, hide enemy and player and finish the game
  	if (count <= 0)
  	{
  		// stop the timer
     	clearInterval(counter);
     	// set game to finished
     	finished = true;
     	count=0;
     	// hider enemy and player
     	enemyReady=false;
     	playerReady=false;
  	}

}

// timer interval is every second (1000ms)
setInterval(counter, 1000);

// The main game loop
var main = function () {
  // run the update function
  update(0.02); // do not change
  // run the render function
  render();
  // Request to do this again ASAP
  requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
reset();
main();
}

// Get the instruction page and start button elements
var instructionPage = document.getElementById('instruction-page');
var startButton = document.getElementById('start-button');

// Handle the click event of the start button
startButton.addEventListener('click', function() {
  // Hide the instruction page
  instructionPage.style.display = 'none';

  // pelit soimaa
  startGame();
});