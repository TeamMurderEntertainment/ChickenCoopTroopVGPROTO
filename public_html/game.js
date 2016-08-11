function startLogic()
{
	var canvas = document.querySelector("canvas");
	var ctx = canvas.getContext("2d");

	var assetsToLoad = [];
	var assetsLoaded = 0;

	var tileCountX = 32;
	var tileCountY = 24;

	console.log("Loading...");

	// SFX files
	var chicken_walk = document.querySelector("#chicken_walk");
	chicken_walk.addEventListener("canplaythrough", loadHandler);
	chicken_walk.volume = 0.5;
	chicken_walk.load();
	assetsToLoad.push(chicken_walk);

	var squish = document.querySelector("#squish");
	squish.addEventListener("canplaythrough", loadHandler);
	squish.volume = 0.5;
	squish.load();
	assetsToLoad.push(squish);

	var egg_cracking = document.querySelector("#egg_cracking");
	egg_cracking.addEventListener("canplaythrough", loadHandler);
	egg_cracking.volume = 0.3;
	egg_cracking.load();
	egg_cracking.playCheck = function ()
	{
		if (SFX)
			egg_cracking.play();
	};
	assetsToLoad.push(egg_cracking);

	var menu_music = document.querySelector("#menu_music");
	menu_music.addEventListener("canplaythrough", loadHandler);
	menu_music.volume = 0.4;
	menu_music.load();
	assetsToLoad.push(menu_music);

	var button_sfx = document.querySelector("#button_sfx");
	button_sfx.addEventListener("canplaythrough", loadHandler);
	button_sfx.volume = 0.4;
	button_sfx.load();
	button_sfx.playCheck = function ()
	{
		if (SFX)
			button_sfx.play();
	};
	assetsToLoad.push(button_sfx);

	// Sprite sheet
	var image = new Image();
	image.src = "images/spritesheet.png";
	image.addEventListener("load", loadHandler);
	assetsToLoad.push(image);

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

			canvas.addEventListener("mousedown", mouseLocation);
			window.addEventListener("keydown", keyPressed);
			gameState = MENU;


		}
	}

	// Gamestates
	var LOADING = 0;
	var MENU = 1;
	var OPTIONS = 2;
	var PLAYING = 3;
	var GAMEEND = 4;
	var gameState = LOADING;

	var score;
	var minScore;
	var timeInSeconds;
	var level;
	var powerUp;
	var powerUpSmoother;
	var boostDuration;
	var timeToNextWorm;

	var fontHUI = 14;
	var fontHMenu = 21;
	var menuFont = "normal bold 30px cella";
	var UIFont = "normal bold 20px cella";

	var music = false;
	var SFX = true;

	var play = new simpleRect((canvas.width / 2) - (100), 405, 232, 64);
	var options = new simpleRect((canvas.width / 2) - (100), 505, 232, 64);
	var back = new simpleRect((canvas.width / 2) - (100), 605, 232, 64);
	var SFXRect = new simpleRect((canvas.width / 2) - 40, 425, 32, 32);
	var musicRect = new simpleRect((canvas.width / 2) - 40, 525, 32, 32);

	var gameTimeInterval;
	var coolDownTimeInterval;
	var wormTimeout;

	var sprites = [];
	var spriteTiles = [[]];
	var worms = [];
	var eggs = [];
	var messages = [];
	var btnMessages = [];

	var clickLocation = [];
	var spaceKeyCode = 32;

	var newGame = true;

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
		sprites.push(chicken);
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
			sprites.push(worm.sprite);
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
		sprites.push(nest);
	}

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
		sprites.push(powerUpGray);
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
		sprites.push(powerUpFull);
	}

	var eggObject = function ()
	{
		this.sprite = new SpriteObject();
	};

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
			sprites.push(egg.sprite);
			eggs.push(egg);

			egg.sprite.x = canvas.width / 2 - egg.sprite.halfWidth() + x;
			egg.sprite.y = canvas.height / 2 - egg.sprite.halfHeight() + y;
		}
	}

	function prepareEggs()
	{
		eggs = [];
		createEgg(10, -10);
		createEgg(-10, 0);
		createEgg(10, 10);
	}

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

	function update()
	{
		window.requestAnimationFrame(update);

		switch (gameState)
		{
			case LOADING:
				break;
			case MENU:
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

	function render()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		//draw menu stuff
		if (gameState == MENU)
		{
			renderMenu();
			if (music)
				menu_music.play();
		}
		if (gameState == OPTIONS)
			renderOptions();
		//draw map
		if (gameState == PLAYING || gameState == GAMEEND)
		{
			renderMap();

			//chicken info click listener here
			canvas.addEventListener("mousedown", mouseLocation);
			canvas.addEventListener("mouseup", mouseReset);
			//draw chicken
			drawEntity(nest);

			for (i = 0; i < eggs.length; i++)
			{
				var egg = eggs[i];
				drawEntity(egg.sprite);
			}

			for (i = 0; i < worms.length; i++)
			{
				var worm = worms[i];
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
							egg = eggs[eggs.length - 1];
							crackEgg(egg);
						}
						if (eggs.length < 1)
						{
							gameState = GAMEEND;
						}
					}
				}
				drawEntity(worm.sprite);
			}


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
			drawEntity(chicken);
			renderScoreUI();
			drawEntity(powerUpGray);
			drawEntity(powerUpFull);
		}
	}

	function killWorm(worm, kill)
	{
		if (kill == undefined)
			kill = true;

		if (kill)
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
			removeObject(worm.sprite, sprites);
			removeObject(worm, worms);
		}
	}

	function crackEgg(egg)
	{
		egg_cracking.playCheck();
		//future space for stuff
		removeEgg();

		function removeEgg()
		{
			removeObject(egg.sprite, sprites);
			removeObject(egg, eggs);
		}
	}

	function playGame()
	{
		if (newGame)
		{
			initGameUI();
			genMap();
			prepareEggs();
			newGame = false;
		}
	}

	function initGameUI()
	{
		score = 0;
		minScore = 0;
		timeInSeconds = 30;
		level = 1;
		powerUp = 0;
		powerUpSmoother = 0;

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

	function endGame()
	{
		if (worms.length == 0 || eggs.length == 0)
		{
			if (timeInSeconds == 0)
				endElement.text = "Times up, you got " + score + " points for killing worms.";
			else
				endElement.text = "The nest has fallen, you got " + score + " points for killing worms.";

			endElement.update();
			endElement.visible = true;
			for (i = 0; i < worms.length; i++)
			{
				var worm = worms[i];
				removeObject(worm.sprite, sprites);

			}
			worms = [];
			clearInterval(coolDownTimeInterval);
		}

		clearTimeout(wormTimeout);
		clearInterval(gameTimeInterval);
	}

// dirt = 0
// rock = 1
// grass edge = 2
// grass corner = 3
// fence edge = 4
// fence corner = 5
// 
// rotation is 0-3
// 90*rotation clockwise

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

				//level border in clockwise order from top left
				if (y == 0)								// top side
					id = EDGE;
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
				if (x > 1 && x < (tileCountX - 1) - 1)
					if (y > 1 && y < (tileCountY - 1) - 1)
						if (Math.random() > 0.95)
							id = (Math.random() > 0.60 ? 1 : 6);

				spriteTiles[x].push(new spriteID(id, rotation));
			}
		}
	}

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
		if ((gameState == MENU && hitTestPoint(clickLocation[0], clickLocation[1], play)) || gameState == GAMEEND)
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

	function buttonPressed(e)
	{
		if (e.buttons == null)
			return e.which != 0;
		else
			return e.buttons != 0;
	}

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

	function mouseReset()
	{
		clickLocation[0] = undefined;
		clickLocation[1] = undefined;
	}

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

	function renderMap()
	{
		for (var x = 0; x < tileCountX; x++)
		{
			for (var y = 0; y < tileCountY; y++)
			{

				var tempX = 0;
				var tempY = 0;
				var rot = spriteTiles[x][y].rotation;

				if (rot == 0)
				{
					tempX = 0;
					tempY = 0;
				}
				else if (rot == 1)
				{
					tempX = 0;
					tempY = -1;
				}
				else if (rot == 2)
				{
					tempX = -1;
					tempY = -1;
				}
				else if (rot == 3)
				{
					tempX = -1;
					tempY = 0;
				}

				ctx.save();
				ctx.translate((x * bgTile.w), (y * bgTile.h));

				ctx.rotate(((90 * spriteTiles[x][y].rotation) * Math.PI) / 180);
				ctx.drawImage(image,
						spriteTiles[x][y].id * bgTile.srcX, bgTile.srcY,
						bgTile.srcW, bgTile.srcH,
						(tempX * 32), (tempY * 32),
						bgTile.w, bgTile.h);
				ctx.restore();
			}
		}
	}

	function renderScoreUI()
	{
		timeElement.text = timeInSeconds + " seconds left";
		timeElement.update();
		scoreElement.text = score + " worm smears";
		scoreElement.update();

		for (var i = 0; i < messages.length; i++)
		{
			var message = messages[i];

			if (message.visible)
			{

				ctx.font = message.font;
				ctx.fillStyle = message.fontStyle;
				ctx.textBaseLine = message.textBaseline;

				ctx.fillText(message.text, message.x, message.y);
			}
		}
	}

	function renderMenu()
	{
		btnMsgOptions.visible = true;
		btnMsgPlay.visible = true;
		btnMsgBack.visible = false;
		btnMsgSFX.visible = false;
		btnMsgMusic.visible = false;

		for (var i = 0; i < sprites.length; i++)
		{

			var sprite = sprites[i];
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
		renderButton(405);
		renderButton(505);
		for (var i = 0; i < btnMessages.length; i++)
		{
			var btnMessage = btnMessages[i];
			if (btnMessage.visible)
			{
				ctx.font = btnMessage.font;
				ctx.fillStyle = btnMessage.fontStyle;
				ctx.textBaseLine = btnMessage.textBaseline;

				ctx.fillText(btnMessage.text, btnMessage.x, btnMessage.y);
			}
		}
	}

	function renderOptions()
	{
		btnMsgBack.visible = true;
		btnMsgPlay.visible = false;
		btnMsgOptions.visible = false;
		btnMsgSFX.visible = true;
		btnMsgMusic.visible = true;

		for (var i = 0; i < sprites.length; i++)
		{

			var sprite = sprites[i];
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
		renderButton(605);

		renderCheckBox((canvas.width / 2) - 40, 425, SFX);
		renderCheckBox((canvas.width / 2) - 40, 525, music);

		for (var i = 0; i < btnMessages.length; i++)
		{
			var btnMessage = btnMessages[i];
			if (btnMessage.visible)
			{
				ctx.font = btnMessage.font;
				ctx.fillStyle = btnMessage.fontStyle;
				ctx.textBaseLine = btnMessage.textBaseline;

				ctx.fillText(btnMessage.text, btnMessage.x, btnMessage.y);
			}
		}
	}

	function renderCheckBox(x, y, checked)
	{
		ctx.drawImage(image,
				chkBox.srcX, (checked ? chkBox.srcY + 32 : chkBox.srcY),
				chkBox.srcW, chkBox.srcH,
				x, y,
				chkBox.w, chkBox.h
				);
	}

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
