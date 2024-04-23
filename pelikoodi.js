function loadImages() {
  // Load the background image
  bgReady = false;
  bgImage = new Image();
  bgImage.onload = function () {
    // show the background image
    bgReady = true;
  };
  bgImage.src = "tausta.png";

  // Load the player image
  playerReady = false;
  playerImage = new Image();
  playerImage.onload = function () {
    // show the player image
    playerReady = true;
  };
  playerImage.src = "ukko.png";

  // Load the coin image
  coinReady = false;
  coinImage = new Image();
  coinImage.onload = function () { 
    // show the coin image
    coinReady = true;
  };
  coinImage.src = "kolikko.png";

  // Load the enemy image
  enemyReady = false;
  enemyImage = new Image();
  enemyImage.onload = function () {
    // show the enemy image
    enemyReady = true;
  };
  enemyImage.src = "vihu.png";
}

var bgReady, bgImage, playerReady, playerImage, coinReady, coinImage, enemyReady, enemyImage;

function createGameObjects() {
  // Create the player object
  player = {
    speed: 200, // movement speed of player in pixels per second
    health: 10 // health of player
  };
  // Create the enemy object
  enemy = {
    speed: player.speed / 2, // enemy moves at half the player's speed
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  };
  // Keep track of the coins
  coin = {};
  coinsCollected = 0;
  // Restart button properties
  restartButton = {
    x: canvas.width / 2,
    y: canvas.height / 2 + 30,
    width: 100,
    height: 20
  };
}

var player, enemy, coin, coinsCollected, restartButton;

function setupEventListeners() {
  // Handle keyboard controls
  keysDown = {};

  // Check for keys pressed where key represents the key pressed
  addEventListener("keydown", function (event) {
    keysDown[event.key] = true;
    event.preventDefault(); // Prevent the default action
  }, false);

  addEventListener("keyup", function (event) {
    delete keysDown[event.key];
  }, false);

  // Restart button functionality
  canvas.addEventListener('click', function(event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // check if player has died or game is finished only after make the restart work
    if (finished) {
      // Check if the button was clicked
      if (x >= restartButton.x && x <= restartButton.x + restartButton.width &&
          y >= restartButton.y && y <= restartButton.y + restartButton.height) {
        // Restart the game
        restartGame();
      }
    }
  });
}

var keysDown;

// Keep track of the last damage time
var lastDamage = Date.now();

function updateGameObjects(modifier) {
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
    // Move the enemy towards the player
    var dx = player.x - enemy.x;
    var dy = player.y - enemy.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      enemy.x += (dx / distance) * enemy.speed * modifier;
      enemy.y += (dy / distance) * enemy.speed * modifier;
    }
    // Check if the player and enemy are touching
    if (
      player.x <= (enemy.x + 32)
      && enemy.x <= (player.x + 32)
      && player.y <= (enemy.y + 32)
      && enemy.y <= (player.y + 32)
    ) {
      // Reduce player's health if they are touching the enemy 1 point/1000ms
      if (Date.now() - lastDamage >= 1000) {
        player.health -= 1;
        lastDamage = Date.now();
      }
    }
    
    // Check if the player's health is 0 or less
    if (player.health <= 0) {
      // End the game
      finished = true;
      dead = true;
      // Hide the player, coin, enemy, set count to 0
      playerReady = false;
      coinReady = false;
      enemyReady = false;
      count = 0;
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
  // Check if player and coin collide
  if (
    player.x <= (coin.x + coinImage.width)
    && coin.x <= (player.x + playerImage.width)
    && player.y <= (coin.y + coinImage.height)
    && coin.y <= (player.y + playerImage.height)
  ) {
    ++coinsCollected;
    reset();
  }
}

// Define reset function
function reset() {
  // Reset player's position to centre of canvas
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;

  // Place the coin somewhere on the canvas randomly
  coin.x = Math.random() * (canvas.width - coinImage.width);
  coin.y = Math.random() * (canvas.height - coinImage.height);

  // Place the enemy somewhere on the canvas randomly
  enemy.x = Math.random() * canvas.width;
  enemy.y = Math.random() * canvas.height;
}

// Define the restart function
function restartGame() {
  // Reset the player's health, timer, score, gameover status and death status
  player.health = 10;
  count = 15;
  coinsCollected = 0;
  finished = false;
  dead = false;

  // Reset the player, coin and the enemy
  playerReady = true;
  coinReady = true;
  enemyReady = true;

  // Use reset function to place the player, enemy and coin in new positions
  reset();
}

// Define highscore variable
var highscore;

// Save highscore
function saveHighscore(score) {
  fetch('../save_score.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'score=' + encodeURIComponent(score),
  });
}

// Get highscore
function getHighscore() {
  return fetch('../get_highscore.php')
    .then(response => response.text())
    .then(highscore => {
      if (isNaN(highscore)) {
        return 0;
      } else {
        return parseInt(highscore);
      }
    });
}

function renderGame() {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0);
  }
  if (!finished) { // Only draw the player and coins if the game is not finished and player is not dead
    if (playerReady) {
      ctx.drawImage(playerImage, player.x, player.y);
    }
    if (coinReady) {
      ctx.drawImage(coinImage, coin.x, coin.y);
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
  ctx.fillText("Kolikoita kerätty: " + coinsCollected, 20, 20);
  ctx.fillText("Aikaa jäljellä: " + count, 20, 50);

  // Display highscore
  ctx.fillText("Ennätys: " + highscore, 20, 80);

  // Display the player's health
  ctx.fillText("Elämät: " + player.health, 20, 110);
  
  // Display game over message when timer finished
  if(finished==true){
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.textAlign = "center"; // center alignment for x axis
    ctx.textBaseline = "middle"; // middle alignment for y axis
    // Display different messages based on whether the player is dead or not
    if(dead){
      ctx.fillText("Kuolit!", canvas.width / 2, canvas.height / 2);
    } else {
      // Code to run if the player is not dead
      ctx.fillText("Loppu!", canvas.width / 2, canvas.height / 2);
    }
    // Draw the restart button
    ctx.fillText("Uudelleen", restartButton.x, restartButton.y);
    // Draw a rectangle around the button
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.strokeRect(restartButton.x - 57, restartButton.y - 12, restartButton.width + 15, restartButton.height + 5);

    // If there is no highscore or the current score is higher than the highscore
    if (coinsCollected > highscore) {
      highscore = coinsCollected;
      saveHighscore(highscore);
    }
  }
}

var count = 15; // how many seconds the game lasts for - default 30
var finished = false; // set game to not finished
var dead = false; // set player to not dead
var counter = function(){
  count=count-1; // countown by 1 every second
  // when count reaches 0 clear the timer, hide coin and player and finish the game
  	if (count <= 0)
  	{
  		// stop the timer
     	clearInterval(counter);
     	// set game to finished
     	finished = true;
     	count=0;
     	// hide coin and player
     	coinReady=false;
     	playerReady=false;
      enemyReady=false;
  	}
};


// timer interval is every second (1000ms)
setInterval(counter, 1000);

// Run once at the start of the game
function initializeGame() {
  // Create the canvas and context
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = 1024;
  canvas.height = 768;
  document.body.appendChild(canvas);
  // Load the images
  loadImages();
  // Create the game objects
  createGameObjects();
  // Initialize or reset the game state
  reset();
  // Setup the event listeners
  setupEventListeners();

  // Get the highscore from the database when the game starts
  getHighscore().then(response => {
    highscore = parseInt(response);
  });
}

var canvas, ctx;
 
// Run continuously during the game
function gameLoop() {
  // Update game objects
  updateGameObjects(0.02);
  // Render the game
  renderGame();
  // Request to do this again in the ASAP
  requestAnimationFrame(gameLoop);
}

// Start the game
initializeGame();
gameLoop();