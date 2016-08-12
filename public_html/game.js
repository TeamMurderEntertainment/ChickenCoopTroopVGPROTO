function startLogic()
{
	// canvas variable set up
	var canvas = document.querySelector("canvas");
	var ctx = canvas.getContext("2d");

	// loader variables
	var assetsToLoad = [];
	var assetsLoaded = 0;

	// map size
	var tileCountX = canvas.width / 32;
	var tileCountY = canvas.height / 32;

	console.log("Loading...");

	// sound files
	{
		var chicken_walk = document.querySelector("#chicken_walk");
		{
			chicken_walk.addEventListener("canplaythrough", loadHandler);
			chicken_walk.volume = 0.5;
			chicken_walk.load();
			assetsToLoad.push(chicken_walk);
		}

		var squish = document.querySelector("#squish");
		{
			squish.addEventListener("canplaythrough", loadHandler);
			squish.volume = 0.5;
			squish.load();
			assetsToLoad.push(squish);
		}

		var egg_cracking = document.querySelector("#egg_cracking");
		{
			egg_cracking.addEventListener("canplaythrough", loadHandler);
			egg_cracking.volume = 0.3;
			egg_cracking.load();
			egg_cracking.playCheck = function ()
			{
				if (SFX)
					egg_cracking.play();
			};
			assetsToLoad.push(egg_cracking);
		}

		var menu_music = document.querySelector("#menu_music");
		{
			menu_music.addEventListener("canplaythrough", loadHandler);
			menu_music.volume = 0.4;
			menu_music.load();
			assetsToLoad.push(menu_music);
		}

		var button_sfx = document.querySelector("#button_sfx");
		{
			button_sfx.addEventListener("canplaythrough", loadHandler);
			button_sfx.volume = 0.4;
			button_sfx.load();
			button_sfx.playCheck = function ()
			{
				if (SFX)
					button_sfx.play();
			};
			assetsToLoad.push(button_sfx);
		}

		var siren = document.querySelector("#siren");
		{
			siren.addEventListener("canplaythrough", loadHandler);
			siren.volume = 0.4;
			siren.load();
			siren.playCheck = function ()
			{
				if (SFX)
					siren.play();
			};
			assetsToLoad.push(siren);
		}

		var fanfare = document.querySelector("#fanfare");
		{
			fanfare.addEventListener("canplaythrough", loadHandler);
			fanfare.volume = 1;
			fanfare.load();
			fanfare.playCheck = function ()
			{
				if (SFX)
					fanfare.play();
			};
			assetsToLoad.push(fanfare);
		}
	}
	// Sprite sheet
	var image = new Image();
	{
		image.src = "images/spritesheet.png";
		image.addEventListener("load", loadHandler);
		assetsToLoad.push(image);
	}

	/**
	 * checks each time somthing loads and doesn't start the menu till it's all loaded
	 */
	function loadHandler()
	{
		assetsLoaded += 1;

		console.log(getPercentage(assetsLoaded, assetsToLoad.length) + " loaded...");

		if (assetsLoaded == assetsToLoad.length)
		{
			console.log("Finished Loading");
			image.removeEventListener("load", loadHandler);

			chicken_walk.removeEventListener("canplaythrough", loadHandler);
			menu_music.removeEventListener("canplaythrough", loadHandler);
			squish.removeEventListener("canplaythrough", loadHandler);
			button_sfx.removeEventListener("canplaythrough", loadHandler);
			egg_cracking.removeEventListener("canplaythrough", loadHandler);
			fanfare.removeEventListener("canplaythrough", loadHandler);
			siren.removeEventListener("canplaythrough", loadHandler);

			canvas.addEventListener("mousedown", mouseLocation);
			canvas.addEventListener("mouseup", mouseReset);
			window.addEventListener("keydown", keyPressed);

			if (gameState == LOADING && typeof loadingTimer == undefined)
				gameState = MENU;
		}
	}

	var loadingTimer = window.setTimeout(splashHandler, 2000);

	function splashHandler()
	{
		if (assetsLoaded == assetsToLoad.length && gameState == LOADING)
			gameState = MENU;
		window.clearTimeout(loadingTimer);
	}

	// Gamestates
	{
		var LOADING = 0;
		var MENU = 1;
		var OPTIONS = 2;
		var PLAYING = 3;
		var GAMEEND = 4;
		var gameState = LOADING;
	}

	// assorted variables
	{
		var score;
		var minScore;
		var timeInSeconds;
		var level;
		var powerUp;
		var powerUpSmoother;
		var boostDuration;
		var timeToNextWorm;
		var newGame = true;
		var playedEndTune=false;
	}

	// font variables
	{
		var fontHUI = 14;
		var fontHMenu = 21;
		var menuFont = "normal bold 30px cella";
		var UIFont = "normal bold 20px cella";
	}

	// audio toggle variables
	{
		var music = true;
		var SFX = true;
	}

	// click detection boxes
	{
		var play = new simpleRect((canvas.width / 2) - (100), 405, 232, 64);
		var options = new simpleRect((canvas.width / 2) - (100), 505, 232, 64);
		var back = new simpleRect((canvas.width / 2) - (100), 605, 232, 64);
		var SFXRect = new simpleRect((canvas.width / 2) - 40, 425, 32, 32);
		var musicRect = new simpleRect((canvas.width / 2) - 40, 525, 32, 32);
	}

	// timers
	{
		var gameTimeInterval;
		var coolDownTimeInterval;
		var wormTimeout;
	}

	// object arrays
	{
		var sprites = [];
		var spriteTiles = [[]];
		var worms = [];
		var eggs = [];
		var messages = [];
		var btnMessages = [];
		var splashMessages = [];
	}

	// input variables
	{
		var clickLocation = [];
		var spaceKeyCode = 32;
	}

	// text elements
	{
		var timeElement = new MessageObject();
		{
			timeElement.update = function ()
			{
				timeElement.text = timeInSeconds + " seconds left";
				timeElement.x = canvas.offsetLeft + 30;
			};

			timeElement.update();
			timeElement.y = canvas.offsetTop + 30;
			timeElement.font = UIFont;
			timeElement.visible = false;
			messages.push(timeElement);
		}

		var levelElement = new MessageObject();
		{
			levelElement.update = function ()
			{
				levelElement.text = "level: " + level;
				levelElement.x = canvas.offsetLeft + (canvas.width / 2) - ((levelElement.text.length * fontHUI) / 2);
			};

			levelElement.update();
			levelElement.y = canvas.offsetTop + 30;
			levelElement.font = UIFont;
			levelElement.visible = false;
			messages.push(levelElement);
		}

		var scoreElement = new MessageObject();
		{
			scoreElement.update = function ()
			{
				scoreElement.text = "Score: " + score;
				scoreElement.x = canvas.offsetLeft + canvas.width - (scoreElement.text.length * fontHUI) - 40;
			};

			scoreElement.update();
			scoreElement.y = canvas.offsetTop + 30;
			scoreElement.font = UIFont;
			scoreElement.visible = false;
			messages.push(scoreElement);
		}

		var endElement = new MessageObject();
		{
			endElement.update = function ()
			{
				endElement.x = canvas.offsetLeft + (canvas.width / 2) - ((endElement.text.length * fontHUI) / 2);
			};

			endElement.update();
			endElement.y = canvas.offsetTop + (canvas.height / 2) - 50;
			endElement.font = UIFont;
			endElement.visible = false;
			messages.push(endElement);
		}

		var teamElement = new MessageObject();
		{
			teamElement.text = "TEAM";
			teamElement.font = "normal bold 120px cella";
			teamElement.fontStyle = "red";
			teamElement.x = ((canvas.width / 2) - ((teamElement.text.length * 84) / 2) - 100);
			teamElement.y = 340;
			teamElement.visible = false;
			splashMessages.push(teamElement);
		}
		
		var murderElement = new MessageObject();
		{
			murderElement.text = "MURDER";
			murderElement.font = "normal bold 120px cella";
			murderElement.fontStyle = "red";
			murderElement.x = ((canvas.width / 2) - ((murderElement.text.length * 84) / 2) + 50);
			murderElement.y = 450;
			murderElement.visible = false;
			splashMessages.push(murderElement);
		}
	}

	// menu sprites
	{
		var background = new SpriteObject();
		{
			background.srcY = 192;
			background.srcW = 1024;
			background.srcH = 768;
			background.w = 1024;
			background.h = 768;
			background.visible = true;
			sprites.push(background);
		}

		var title = new SpriteObject();
		{
			title.srcX = 192;
			title.srcW = 512;
			title.srcH = 128;
			title.w = 512;
			title.h = 128;
			title.x = canvas.width / 2 - title.halfWidth();
			title.y = 20;
			title.visible = true;
			sprites.push(title);
		}
	}

	// Entities
	{
		var chicken = new SpriteObject();
		{
			chicken.srcX = 0;
			chicken.srcY = 64;
			chicken.srcW = 64;
			chicken.srcH = 64;
			chicken.w = 64;
			chicken.h = 64;
			chicken.x = canvas.width / 2 - chicken.halfWidth();
			chicken.y = canvas.height / 2 + chicken.halfHeight() + 10;
			chicken.r = 0;
			chicken.speed = 4;
			chicken.framesLeft = 5;
			chicken.distance = 0;
			chicken.state = 0;

			chicken.update = function ()
			{
				chicken.srcX = chicken.state * this.srcW;
			};

			chicken.animateCycle = function ()
			{
				if (chicken.framesLeft == 0)
				{
					if (chicken.state == 0)
						chicken.state = 1;
					else
						chicken.state = 0;

					chicken.framesLeft = 10;
				}
				else
					chicken.framesLeft -= 1;
			};
			chicken.visible = false;
		}

		var wormObject = function ()
		{
			this.startDistance = 0;
			this.sprite = new SpriteObject();
			this.NORMAL = 0;
			this.DEAD = 3;
			this.state = this.NORMAL;
			this.framesLeft = 10;
			this.ascend = true;

			this.update = function ()
			{
				this.sprite.srcX = this.state * this.sprite.srcW;
			};
			this.getScore = function ()
			{
				var score = getPercentage(this.sprite.distance, this.startDistance, false);
				return Math.floor(score / 2) + 50;
			};
			this.animateCycle = function ()
			{
				if (this.framesLeft == 0)
				{
					if (this.state == 0)
						this.ascend = true;
					else if (this.state == 2)
						this.ascend = false;

					if (!this.ascend)
						this.state -= 1;
					else if (this.ascend)
						this.state += 1;

					this.framesLeft = 10;
				}
				else
					this.framesLeft -= 1;
			};
		};

		var nest = new SpriteObject();
		{
			nest.srcX = 128;
			nest.srcY = 128;
			nest.srcW = 64;
			nest.srcH = 64;
			nest.w = 64;
			nest.h = 64;
			nest.x = canvas.width / 2 - nest.halfWidth();
			nest.y = canvas.height / 2 - nest.halfHeight();
			nest.visible = false;
		}
		var eggObject = function ()
		{
			this.sprite = new SpriteObject();
		};
	}

	// bg tiles
	var bgTile = new SpriteObject();
	{
		bgTile.srcX = 32;
		bgTile.srcY = 0;
		bgTile.srcW = 32;
		bgTile.srcH = 32;
		bgTile.w = 32;
		bgTile.h = 32;
		bgTile.visible = true;
	}

	// UI sprites
	{
		var powerUpGray = new SpriteObject();
		{
			powerUpGray.srcX = 192;
			powerUpGray.srcY = 128;
			powerUpGray.srcW = 64;
			powerUpGray.srcH = 64;
			powerUpGray.w = 64;
			powerUpGray.h = 64;
			powerUpGray.x = 30;
			powerUpGray.y = canvas.height - powerUpGray.h - 30;
			powerUpGray.visible = false;
		}

		var powerUpFull = new SpriteObject();
		{
			powerUpFull.srcX = 256;
			powerUpFull.srcY = 128;
			powerUpFull.srcW = 64;
			powerUpFull.srcH = 64;
			powerUpFull.w = 64;
			powerUpFull.h = 64;
			powerUpFull.x = 30;
			powerUpFull.y = canvas.height - powerUpGray.h - 30;
			powerUpFull.visible = false;
		}

		var btnCap = new SpriteObject();
		{
			btnCap.srcX = 320;
			btnCap.srcY = 128;
			btnCap.srcW = 16;
			btnCap.srcH = 64;
			btnCap.w = 16;
			btnCap.h = 64;
			btnCap.visible = false;
		}

		var btnMid = new SpriteObject();
		{
			btnMid.srcX = 329;
			btnMid.srcY = 128;
			btnMid.srcW = 2;
			btnMid.srcH = 64;
			btnMid.w = 2;
			btnMid.h = 64;
			btnMid.visible = false;
		}

		var chkBox = new SpriteObject();
		{
			chkBox.srcX = 352;
			chkBox.srcY = 128;
			chkBox.srcW = 32;
			chkBox.srcH = 32;
			chkBox.w = 32;
			chkBox.h = 32;
			chkBox.visible = true;
		}
	}

	// button text
	{
		var btnMsgPlay = new MessageObject();
		{
			btnMsgPlay.text = "PLAY";
			btnMsgPlay.font = menuFont;
			btnMsgPlay.fontStyle = "red";
			btnMsgPlay.x = (canvas.width / 2) - ((btnMsgPlay.text.length * fontHMenu) / 2);
			btnMsgPlay.y = 450;
			btnMsgPlay.visible = false;
			btnMessages.push(btnMsgPlay);
		}

		var btnMsgOptions = new MessageObject();
		{
			btnMsgOptions.text = "OPTIONS";
			btnMsgOptions.font = menuFont;
			btnMsgOptions.fontStyle = "red";
			btnMsgOptions.x = (canvas.width / 2) - ((btnMsgOptions.text.length * fontHMenu) / 2);
			btnMsgOptions.y = 550;
			btnMsgOptions.visible = false;
			btnMessages.push(btnMsgOptions);
		}

		var btnMsgBack = new MessageObject();
		{
			btnMsgBack.text = "BACK";
			btnMsgBack.font = menuFont;
			btnMsgBack.fontStyle = "red";
			btnMsgBack.x = (canvas.width / 2) - ((btnMsgBack.text.length * fontHMenu) / 2);
			btnMsgBack.y = 650;
			btnMsgBack.visible = false;
			btnMessages.push(btnMsgBack);
		}

		var btnMsgSFX = new MessageObject();
		{
			btnMsgSFX.text = "SFX";
			btnMsgSFX.font = menuFont;
			btnMsgSFX.fontStyle = "red";
			btnMsgSFX.x = (canvas.width / 2) + 10;
			btnMsgSFX.y = 450;
			btnMsgSFX.visible = false;
			btnMessages.push(btnMsgSFX);
		}

		var btnMsgMusic = new MessageObject();
		{
			btnMsgMusic.text = "Music";
			btnMsgMusic.font = menuFont;
			btnMsgMusic.fontStyle = "red";
			btnMsgMusic.x = (canvas.width / 2) + 10;
			btnMsgMusic.y = 550;
			btnMsgMusic.visible = false;
			btnMessages.push(btnMsgMusic);
		}
	}

	/**
	 * determins which game state were in and which functions to call each frame
	 * then calls render
	 */
	function update()
	{
		window.requestAnimationFrame(update);

		switch (gameState)
		{
			case LOADING:
				runLoading();
				break;
			case MENU:
				//runMenu();
				break;
			case OPTIONS:
				break;
			case PLAYING:
				playGame();
				break;
			case GAMEEND:
				endGame();
				break;
			default:
				console.log("Welp, shit went pear shaped on us....");
		}
		render();
	}

	/**
	 * runs all appropriate render functions depending on what state the game is in
	 */
	function render()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		//draw menu stuff
		if (gameState == LOADING)
			showLoading();

		//draw menu stuff
		if (gameState == MENU)
			showMenu();

		//draw options
		if (gameState == OPTIONS)
			showOptions();

		//draw game screen
		if (gameState == PLAYING || gameState == GAMEEND)
		{
			renderMap();

			drawEntity(nest);

			for (i = 0; i < worms.length; i ++)
				drawEntity(worms[i].sprite);

			for (i = 0; i < eggs.length; i ++)
				drawEntity(eggs[i].sprite);

			drawEntity(chicken);
			showScoreUI();
			drawEntity(powerUpGray);
			drawEntity(powerUpFull);
		}
	}

	/**
	 * clears eggs array, and creates new eggs in the corrects spots
	 */
	function prepareEggs()
	{
		eggs = [];
		createEgg(10, -10);
		createEgg(-10, 0);
		createEgg(10, 10);
	}

	/**
	 * creates a new egg at cords x,y and adds it do the eggs array
	 * @param {type} x x location of egg
	 * @param {type} y y location of egg
	 */
	function createEgg(x, y)
	{
		var egg = new eggObject();
		{
			egg.sprite.srcX = 128;
			egg.sprite.srcY = 32;
			egg.sprite.srcW = 32;
			egg.sprite.srcH = 32;
			egg.sprite.w = 26;
			egg.sprite.h = 26;
			egg.sprite.visible = false;
			eggs.push(egg);

			egg.sprite.x = canvas.width / 2 - egg.sprite.halfWidth() + x;
			egg.sprite.y = canvas.height / 2 - egg.sprite.halfHeight() + y;
		}
	}

	/**
	 * creates a new worm at a random location off screen on ether 4 sides
	 * and adds them to the worm array
	 */
	function createWorm()
	{
		var worm = new wormObject();
		{
			worm.sprite.srcY = 128;
			worm.sprite.srcW = 32;
			worm.sprite.srcH = 63;
			worm.sprite.w = 32;
			worm.sprite.h = 63;
			worm.sprite.r = 0;
			worm.sprite.speed = 2;
			worm.sprite.distance = 0;
			worm.sprite.visible = false;
			worm.update();
			worms.push(worm);
		}

		var axis = getRandom(0, 1);
		var range = getRandom(0, 1);

		if (range)
		{
			range = (axis ? canvas.width + worm.sprite.halfHeight() : canvas.height + worm.sprite.halfHeight());
		}
		else
		{
			range = range - worm.sprite.h;
		}

		var domain = getRandom(0, (!axis ? canvas.width : canvas.height));

		if (axis)
		{
			worm.sprite.x = range;
			worm.sprite.y = domain;
		}
		else
		{
			worm.sprite.y = range;
			worm.sprite.x = domain;
		}
	}

	/**
	 * moves the given worm object towards the nest, then checks if it hits
	 * the chicken, and kills it if it does, then checks if it hits the nest
	 * and cracks an egg
	 * @param {SpriteObject} worm worm to be moved
	 */
	function calcWorm(worm)
	{
		if (worm.state != worm.DEAD)
		{
			worm.animateCycle();
			worm.update();
			entityMove(nest.center().x, nest.center().y, worm.sprite);

			if (worm.startDistance == 0)
				worm.startDistance = worm.sprite.distance;

			if (hitTestRectangle(chicken, worm.sprite))
				killWorm(worm);

			if (hitTestRectangle(worm.sprite, nest))
			{
				killWorm(worm, false);

				if (eggs.length > 0)
				{
					var egg = eggs[eggs.length - 1];
					crackEgg(egg);
				}
			}
		}
	}

	/**
	 * moves the chicken based on the current clickLocation and checks to make
	 * sure it stays on screen, and can't move over the nest
	 */
	function calcChicken()
	{
		var tempX = chicken.x;
		var tempY = chicken.y;

		entityMove(clickLocation[0], clickLocation[1], chicken);

		if (hitTestCircle(nest, chicken))
		{
			chicken.x = tempX;
			chicken.y = tempY;
		}

		else if (chicken.x <= 0 || chicken.y <= 0 ||
				chicken.x + chicken.w >= canvas.width || chicken.y + chicken.h >= canvas.height)
		{
			chicken.x = tempX;
			chicken.y = tempY;
		}

		var walkingChicken = false;

		if (!isNaN(clickLocation[0]) && !isNaN(clickLocation[1]))
		{
			walkingChicken = true;
			chicken.animateCycle();
			chicken.update();
		}

		if (walkingChicken && SFX)
			chicken_walk.play();
		else
		{
			chicken_walk.pause();
			chicken_walk.currentTime = 0;
		}
	}

	/**
	 * removes the given egg from the eggs array, playing sound of they are on
	 * @param {SpriteObject} egg the egg to destroy
	 */
	function crackEgg(egg)
	{
		egg_cracking.playCheck();
		//future space for stuff
		removeEgg();

		function removeEgg()
		{
			removeObject(egg, eggs);
		}
	}

	/**
	 * adds points and sets animate to dead worm, after 1 second removes the 
	 * given worm from the worms array, playing sound of they are on
	 * @param {SpriteObject} worm the worm to destroy
	 * @param {Boolean} chickenKilled true if chicken killed it
	 */
	function killWorm(worm, chickenKilled)
	{
		if (chickenKilled == undefined)
			chickenKilled = true;

		if (chickenKilled)
		{
			squish.play();
			minScore += 50;
			score += worm.getScore();
			worm.state = worm.DEAD;
			worm.update();
			setTimeout(removeWorm, 1000);
		}
		else
		{
			removeWorm();
		}

		function removeWorm()
		{
			removeObject(worm, worms);
		}
	}

	/**
	 * initilizes the UI, run ONCE at the START of each game or level
	 */
	function initGame()
	{
		score = 0;
		minScore = 0;
		timeInSeconds = 60;
		level = 1;
		powerUp = 0;
		powerUpSmoother = 0;
		playedEndTune = false;

		powerUpGray.visible = true;

		endElement.visible = false;

		timeElement.update();
		timeElement.visible = true;

		levelElement.update();
		levelElement.visible = true;

		scoreElement.update();
		scoreElement.visible = true;

		gameTimeInterval = window.setInterval(function ()
		{
			timeInSeconds -= 1;

			if (timeInSeconds == 0)
			{
				gameState = GAMEEND;
			}
		}, 1000);

		wormTimer();
		coolDownTimer();
	}

	/**
	 * sets the timer for the next worm based on how well the player is doing
	 * calls itself
	 * 
	 * minScore is 50 times worm kills
	 * timeToNextWorm is the last timer, updated to the new timer
	 * (100 - (timeToNextWorm / (score - minScore) * 100) * 20)
	 */
	function wormTimer()
	{
		wormTimeout = window.setTimeout(function ()
		{
			if (minScore == 0)
			{
				timeToNextWorm = 2000;
			}
			else
			{
				timeToNextWorm = score - minScore;
				timeToNextWorm = getPercentage(timeToNextWorm, minScore, false);
				timeToNextWorm = 100 - timeToNextWorm;
				timeToNextWorm = parseInt(timeToNextWorm * 20);
			}
			createWorm();
			wormTimer();
		}, timeToNextWorm);
	}

	/**
	 * tracks the cooldown before you can use the powerUp next
	 * doubles as the math for what numbers to use when you render the images
	 */
	function coolDownTimer()
	{
		coolDownTimeInterval = window.setInterval(function ()
		{
			var size = (powerUp / 100) * powerUpFull.srcW;

			powerUpFull.srcY = powerUpGray.srcY;
			powerUpFull.srcH = size;
			powerUpFull.h = size;
			powerUpFull.y = powerUpGray.y;
			if (powerUp != 100)
			{
				powerUp += 1;
			}
			else
			{
				clearInterval(coolDownTimeInterval);
			}


		}, 100);
	}

	/**
	 * starts music when the game is loading
	 */
	function runLoading()
	{
		if (music)
			menu_music.play();
	}

	/**
	 * runs the calculations when the game is playing
	 */
	function playGame()
	{
		if (newGame)
		{
			//chicken info click listener here
			initGame();
			genMap();
			prepareEggs();
			newGame = false;
		}
		
		for (i = 0; i < worms.length; i ++)
			calcWorm(worms[i]);

		calcChicken();

		if (eggs.length < 1)
			gameState = GAMEEND;
	}

	/**
	 * runs calculations to finish the game once it is ending and displays the 
	 * end elements
	 */
	function endGame()
	{
		for (i = 0; i < worms.length; i ++)
			calcWorm(worms[i]);

		calcChicken();

		if (worms.length == 0 || eggs.length == 0)
		{
			if (timeInSeconds == 0)
			{
				if (!playedEndTune)
				{
					playedEndTune=true;
					fanfare.playCheck();
				}
				endElement.text = "Times up, you got " + score + " points for killing worms.";
			}
			else
			{
				if (!playedEndTune)
				{
					playedEndTune=true;
					siren.playCheck();
				}
				endElement.text = "The nest has fallen, you got " + score + " points for killing worms.";
			}

			endElement.update();
			endElement.visible = true;

			worms = [];
			clearInterval(coolDownTimeInterval);
		}

		clearTimeout(wormTimeout);
		clearInterval(gameTimeInterval);
	}

	/**
	 * generates the array for the game map, randomly selecting gravel/rock thing
	 * and randomly selecting fence or no fence
	 *  dirt = 0
	 * rock = 1
	 * grass edge = 2
	 * grass corner = 3
	 * fence edge = 4
	 * fence corner = 5
	 * rock = 6
	 * grass = 7
	 */
	function genMap()
	{
		var EDGE = 2;		//defaults to fenceless edge
		var CORNER = 3;		//defaults to fenceless corner

		if (Math.random() > 0.5)//random fence
		{
			EDGE = 4;
			CORNER = 5;
		}

		for (var x = 0; x < tileCountX; x++)
		{
			var id = 0;
			var rotation = 0;

			spriteTiles[x] = [];
			for (var y = 0; y < tileCountY; y++)
			{
				id = 0;
				rotation = getRandom(0, 3);

				//level border in clockwise order from top left
				if (y == 0)									// top side
				{
					id = EDGE;
					rotation = 0;
				}
				if (x == tileCountX - 1)					// right side
				{
					id = EDGE;
					rotation = 1;
				}
				if (y == tileCountY - 1)					// bottom side
				{
					id = EDGE;
					rotation = 2;
				}
				if (x == 0)								// left side
				{
					id = EDGE;
					rotation = 3;
				}

				//level corner --- draws over border
				if (x == 0 && y == 0)
				{					//NW
					id = CORNER;
					rotation = 0;
				}
				if (x == tileCountX - 1 && y == 0)			//NE
				{
					id = CORNER;
					rotation = 1;
				}
				if (x == tileCountX - 1 && y == tileCountY - 1)	//SE
				{
					id = CORNER;
					rotation = 2;
				}
				if (x == 0 && y == tileCountY - 1)			//SW
				{
					id = CORNER;
					rotation = 3;
				}

				//random rocks 1 space inside border
				if (x >= 1 && x <= (tileCountX - 1) - 1)
					if (y >= 1 && y <= (tileCountY - 1) - 1)
						if (Math.random() > 0.9)
							id = (Math.random() > 0.5 ? 1 : 7);


				spriteTiles[x].push(new spriteID(id, rotation));
			}
		}
	}

	/**
	 * if key pressed is space then if triggers the boost if its up and sets the cooldown
	 * @param {keydown} e keyboard button pressed
	 */
	function keyPressed(e)
	{
		if (e.keyCode == spaceKeyCode)
		{
			if (powerUp == 100 && chicken.speed == 4)
			{
				chicken.speed = 8;
				boostDuration = setTimeout(function ()
				{
					chicken.speed = 4;
					powerUp = 0;
					coolDownTimer();
				}, 3000);
			}
		}
	}

	/**
	 * checks the click location against button locations and states of game and
	 * runs appropiate code
	 * @param {type} e mouse click event
	 */
	function mouseLocation(e)
	{
		if (event.which == 1)
		{
			if (e.pageX != undefined && e.pageY != undefined)
			{
				x = e.pageX;
				y = e.pageY;
			}

			x -= canvas.offsetLeft;
			y -= canvas.offsetTop;

			clickLocation = [Math.floor(x), Math.floor(y)];

		}

		if ((gameState == MENU && hitTestPoint(clickLocation[0], clickLocation[1], play)) ||
				(gameState == GAMEEND && (worms.length == 0 || eggs.length == 0)))
		{
			button_sfx.playCheck();
			newGame = true;
			gameState = PLAYING;
		}
		else if (gameState == MENU && hitTestPoint(clickLocation[0], clickLocation[1], options))
		{
			button_sfx.playCheck();
			gameState = OPTIONS;
		}
		else if (gameState == OPTIONS)
		{
			if (hitTestPoint(clickLocation[0], clickLocation[1], back))
			{
				button_sfx.playCheck();
				gameState = MENU;
			}
			if (hitTestPoint(clickLocation[0], clickLocation[1], SFXRect))
			{
				SFX = !SFX;
				button_sfx.playCheck();
			}
			if (hitTestPoint(clickLocation[0], clickLocation[1], musicRect))
			{
				button_sfx.playCheck();

				if (music)
					menu_music.pause();
				else
					menu_music.play();

				music = !music;
			}
		}
		else if (gameState == PLAYING)
		{
			addEventListener("mousemove", mouseMoved);

		}
	}

	/**
	 * takes the event of a moust click and makes sure it's the left mouse button
	 * before continueing
	 * @param {type} e mouse click event
	 * @returns {Boolean} true if mouse button clicked is left button
	 */
	function buttonPressed(e)
	{
		if (e.buttons == null)
			return e.which != 0;
		else
			return e.buttons != 0;
	}

	/**
	 * when called sets clickLocation to the current cords of the mouse on the canvas
	 * @param {type} e mousemove event
	 */
	function mouseMoved(e)
	{
		if (!buttonPressed(e))
		{
			removeEventListener("mousemove", mouseMoved);
		}
		else
		{
			if (e.pageX != undefined && e.pageY != undefined)
			{
				x = e.pageX;
				y = e.pageY;
			}

			x -= canvas.offsetLeft;
			y -= canvas.offsetTop;

			clickLocation = [Math.floor(x), Math.floor(y)];
		}
	}

	/**
	 * resets clickLocation to undefined
	 */
	function mouseReset()
	{
		clickLocation[0] = undefined;
		clickLocation[1] = undefined;
	}

	/**
	 * moves the given entity in the direction of x,y by an amount equal to
	 * the vx and vy of the given entity
	 * @param {int} x x of target cords
	 * @param {int} y y of target cords
	 * @param {SpriteObject} entity entity to move
	 */
	function entityMove(x, y, entity)
	{
		if (!isNaN(x) && !isNaN(y))
		{
			var dx = entity.x + entity.halfWidth() - x;
			var dy = entity.y + entity.halfHeight() - y;

			if (dx != 0 && dy != 0)
			{
				entity.distance = Math.floor(Math.sqrt((dx * dx) + (dy * dy)));
				entity.r = Math.degrees(Math.atan2(dy, dx));

				entity.vx = Math.cos(Math.radians(entity.r)) * entity.speed;
				entity.vy = Math.sin(Math.radians(entity.r)) * entity.speed;

				if (entity.distance < 10)
				{
					entity.vx = 0;
					entity.vy = 0;
				}

				entity.x = entity.x - entity.vx;
				entity.y = entity.y - entity.vy;
			}
		}
	}

	/**
	 * draws the given entity based on the location and src information as well
	 * as rotation it has
	 * @param {SpriteObject} entity to draw
	 */
	function drawEntity(entity)
	{
		ctx.save();
		ctx.translate(entity.center().x, entity.center().y);

		if (entity.r != 0)
			ctx.rotate(Math.radians(entity.r - 90));

		ctx.translate(-entity.halfWidth(), -entity.halfHeight());

		ctx.drawImage(image,
				entity.srcX, //srcX			
				entity.srcY, // srcY			
				entity.srcW, entity.srcH,
				0, 0,
				entity.w, entity.h);

		ctx.restore();
	}

	/**
	 * shows splash screen
	 */
	function showLoading()
	{
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.stroke();
		teamElement.visible = true;
		murderElement.visible = true;
		renderMsg(splashMessages);
	}

	/**
	 * updates and rerenders the scoreUI on the game screen
	 */
	function showScoreUI()
	{
		timeElement.text = timeInSeconds + " seconds left";
		timeElement.update();
		scoreElement.text = score + " worm smears";
		scoreElement.update();

		renderMsg(messages);
	}

	/**
	 * sets correct visabilty for main menu and rerenders approprite elements
	 */
	function showMenu()
	{
		btnMsgOptions.visible = true;
		btnMsgPlay.visible = true;
		btnMsgBack.visible = false;
		btnMsgSFX.visible = false;
		btnMsgMusic.visible = false;

		renderSprites(sprites);

		renderButton(405);
		renderButton(505);
		renderMsg(btnMessages);
	}

	/**
	 * sets correct visabilty for options menu and rerenders approprite elements
	 */
	function showOptions()
	{
		btnMsgBack.visible = true;
		btnMsgPlay.visible = false;
		btnMsgOptions.visible = false;
		btnMsgSFX.visible = true;
		btnMsgMusic.visible = true;

		renderSprites(sprites);

		renderButton(605);

		renderCheckBox((canvas.width / 2) - 40, 425, SFX);
		renderCheckBox((canvas.width / 2) - 40, 525, music);

		renderMsg(btnMessages);
	}

	/**
	 * renders the BG of the game screen by reading an array representing the
	 * tiles and their orientation
	 */
	function renderMap()
	{
		for (var x = 0; x < tileCountX; x++)
		{
			for (var y = 0; y < tileCountY; y++)
			{

				var tempX = 0;
				var tempY = 0;
				var rot = spriteTiles[x][y].rotation;

				switch (rot)
				{
					case 0:
						tempX = 0;
						tempY = 0;
						break;
					case 1:
						tempX = 0;
						tempY = -1;
						break;
					case 2:
						tempX = -1;
						tempY = -1;
						break;
					case 3:
						tempX = -1;
						tempY = 0;
						break;
				}

				ctx.save();
				ctx.translate((x * bgTile.w), (y * bgTile.h));

				ctx.rotate(((90 * spriteTiles[x][y].rotation) * Math.PI) / 180);
				ctx.drawImage(image,
						(spriteTiles[x][y].id % 6) * bgTile.srcX, Math.floor(spriteTiles[x][y].id / 6) * bgTile.h,
						bgTile.srcW, bgTile.srcH,
						(tempX * 32), (tempY * 32),
						bgTile.w, bgTile.h);
				ctx.restore();
			}
		}
	}

	/**
	 * renders all MessageObjects in the given array based on each objects
	 * proporties
	 * @param {Array} msgs Array of MessageObjects to be rendered
	 */
	function renderMsg(msgs)
	{
		for (var i = 0; i < msgs.length; i++)
		{
			var msg = msgs[i];
			if (msg.visible)
			{
				ctx.font = msg.font;
				ctx.fillStyle = msg.fontStyle;
				ctx.textBaseLine = msg.textBaseline;

				ctx.fillText(msg.text, msg.x, msg.y);
			}
		}
	}

	/**
	 * renders all SpriteObject in the given array based on each objects
	 * proporties
	 * @param {Array} spritesArray Array of SpriteObject to be rendered
	 */
	function renderSprites(spritesArray)
	{
		for (var i = 0; i < spritesArray.length; i++)
		{

			var sprite = spritesArray[i];
			if (sprite.visible)
			{

				ctx.drawImage(image,
						sprite.srcX, sprite.srcY,
						sprite.srcW, sprite.srcH,
						Math.floor(sprite.x), Math.floor(sprite.y),
						sprite.w, sprite.h
						);
			}
		}
	}

	/**
	 * renders a checkbox at x,y that is ether checked or unchecked based on
	 * given boolean value
	 * @param {int} x x cords of boxes top left
	 * @param {int} y y cords of boxes top left
	 * @param {Boolean} checked if the checkbox is checked
	 */
	function renderCheckBox(x, y, checked)
	{
		ctx.drawImage(image,
				chkBox.srcX, (checked ? chkBox.srcY + 32 : chkBox.srcY),
				chkBox.srcW, chkBox.srcH,
				x, y,
				chkBox.w, chkBox.h
				);
	}

	/**
	 * renders a button at the given height, centered in the canvas, using 
	 * btnCap and btnMid
	 * @param {int} yLocation height of button
	 */
	function renderButton(yLocation)
	{
		var xSize = 100;
		//var xStart = ((canvas.width / 2) - (xSize / 2), yLocation);
		ctx.save();

		ctx.translate((canvas.width / 2) - (xSize) - 16, yLocation);
		ctx.drawImage(image,
				btnCap.srcX, btnCap.srcY,
				btnCap.srcW, btnCap.srcH,
				0, 0,
				btnCap.w, btnCap.h
				);

		ctx.translate(16, 0);

		for (var i = 0; i < xSize; i += 1)
		{
			ctx.drawImage(image,
					btnMid.srcX, btnMid.srcY,
					btnMid.srcW, btnMid.srcH,
					0, 0,
					btnMid.w, btnMid.h
					);
			ctx.translate(2, 0);
		}

		ctx.translate(16, 0);
		ctx.rotate(Math.radians(180));

		ctx.drawImage(image,
				btnCap.srcX, btnCap.srcY,
				btnCap.srcW, btnCap.srcH,
				0, 0 - 64,
				btnCap.w, btnCap.h
				);
		ctx.restore();
	}

	update();
}
