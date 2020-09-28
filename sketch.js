//GLOBAL VARIABLES
let slider;
let sliderValue;
let createGameButton;
let tiles = []
let tileImages = []
let imagesDeck = []
let flippedTiles = []
let delayStartFC = null
let numTries
let isFirst = true;
let isLost = false;

///TILE CLASS
class Tile {
  constructor(x, y, tileImage) {
    this.x = x;
    this.y = y;
    this.width = gameSize() / 10
    this.tileImage = tileImage
    this.isFaceUp = true
    this.isHidden = false
  }

  render() {

    if (this.isHidden) {
      return
    }
    fill(100, 100, 100)
    stroke(185, 180, 0)
    strokeWeight(4)
    rect(this.x, this.y, this.width, this.width)

    if (this.isFaceUp === true) {
      image(this.tileImage, this.x, this.y, this.width, this.width)
    }
  }

  isMouseHit(x, y) {
    if (!isLost && !this.isFaceUp) {
      return x >= this.x && x <= this.x + this.width &&
        y >= this.y && y <= this.y + this.width
    }
  }
}



///SETS-UPDATES SLIDER
//---------------------- 
//Setting Slider
function setSlider() {
  slider = createSlider(2, 6, 4, 2);
  sliderValue = slider.value();
  slider.position(10, 10);
  slider.style('width', gameSize() / 100);

}
//Showing Slider Value
function showSliderValue() {
  textSize(32);
  fill(255);
  text(sliderValue, 150, 25);
}
//Updating Slider value
function updateSliderValue() {
  sliderValue = slider.value();
}
//Drawing how many tries left
function showTries() {
  textSize(24);
  fill(255);
  text(numTries + " tries left", 10, 150);

}



///ACCESSORY FUNCTIONS
///-------------------- 

///Calculating minimum game size  
function gameSize() {
  return Math.min(windowWidth, windowHeight);
}

//Hides cards after first reveal
function delayedHide() {
  if (frameCount > 150) {
    for (let i = 0; i < tiles.length; i++) {
      if (!tiles[i].isMatch && tiles[i].isFaceUp) {
        tiles[i].isFaceUp = false
      }
    }
    isFirst = false;
    flippedTiles = []
    delayStartFC = null
  }

}

//Loading Images
function loadTileImages() {
  for (let i = 1; i <= 18; i++) {
    tileImages.push(loadImage("Assets/nm" + i + ".png"));
  }
}
//Creates Images Deck   
function createImagesDeck(images) {
  for (let i = 0; i < (sliderValue * sliderValue) / 2; i++) {
    imagesDeck.push(images[i])
    imagesDeck.push(images[i])
  }

  imagesDeck.sort(function() {
    return 0.5 - random()
  })
}

//Creates Tiles
function createTiles() {
  for (let i = 0; i < sliderValue; i++) {
    for (let j = 0; j < sliderValue; j++) {
      tiles.push(new Tile(i * gameSize() / 8 + 150, j * gameSize() / 8 + 100, imagesDeck.pop()))
    }
  }
}


//Creates New Game Button
function showNewGameButton() {
  button = createButton('Create New Game');
  button.position(10, 35);
  button.mousePressed(createGame);
}

///MAIN GAME FUNCTIONS
///-------------------------    
function createGame() {
  clearGameState()
  loadTileImages()
  createImagesDeck(tileImages)
  createTiles()
  numTries = (tiles.length / 2) + sliderValue
}

function clearGameState() {

  tiles = []
  tileImages = []
  imagesDeck = []
  flippedTiles = []
  delayStartFC = null
  frameCount = null;
  isLost = false;
  isFirst = true;  

}

//Controls tile displays and removes on matched position 
function updateGameLogic() {
  if (delayStartFC && (frameCount - delayStartFC) > 30 && !isLost) {

    tiles.filter(tile => (!tile.isMatch && tile.isFaceUp))
      .forEach(tile => {
        tile.isFaceUp = false
      })

    flippedTiles = []
    delayStartFC = null
  }

  if (frameCount - delayStartFC > 30) {
    tiles.filter(tile => tile.isMatch)
      .forEach(tile => {
        tile.isHidden = true
      });
  }
  
  if (isLost && frameCount - delayStartFC > 100) {
    createGame();
  }
  checkWinState();
}

//Game End Messages + Controlling winning conditions
function checkWinState() {

  let foundAllMatches = true

  for (let i = 0; i < tiles.length; i++) {
    foundAllMatches = foundAllMatches && tiles[i].isMatch
  }

  if (foundAllMatches && numTries >= 0) {
    fill(0, 0, 0)
    text("YOU WIN", 20, 360)
  }

  if (numTries <= 0 && !foundAllMatches) {
    fill(0, 0, 0)
    text("YOU LOST", 20, 360)
    isLost = true;

  }
}


/// P5 FUNCTIONS  
///--------------------------------------------------    
function setup() {
  createCanvas(windowWidth, windowHeight);
  showNewGameButton();
  setSlider();
  createGame();
}

function draw() {
  background(0);
  updateSliderValue();
  showSliderValue();
  showTries();

  if (isFirst) {
    delayedHide();
  }
  updateGameLogic()

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].render()
  }
}

function mouseClicked() {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].isMouseHit(mouseX, mouseY)) {
      if (flippedTiles.length < 2 && !tiles[i].isFaceUp) {
        tiles[i].isFaceUp = true
        flippedTiles.push(tiles[i])
        
        if (flippedTiles.length === 2) {
          numTries--
          
          if (flippedTiles[0].tileImage === flippedTiles[1].tileImage) {
            flippedTiles[0].isMatch = true
            flippedTiles[1].isMatch = true
          }
          
          delayStartFC = frameCount
          
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let i = 0; i < tiles.length; i++) {
    let scaleX = parseInt(i / sliderValue);
    let scaleY = i % sliderValue;
    tiles[i].x = (gameSize() / 8) * scaleX + 150;
    tiles[i].y = (gameSize() / 8) * scaleY + 100;
    tiles[i].width = gameSize() / 10;
  }
}