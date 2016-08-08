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
	chicken_walk.load();
	assetsToLoad.push(chicken_walk);

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

			canvas.addEventListener("mousedown", mouseLocation);
			gameState = MENU;
			console.log(gameState);

			timeElement = new MessageObject();
			timeElement.text = timeInSeconds + " seconds left";
			timeElement.x = canvas.offsetLeft + 15;
			timeElement.y = canvas.offsetTop + 30;
			timeElement.visible = false;
			messages.push(timeElement);

			levelElement = new MessageObject();
			levelElement.text = "level: " + level;
			levelElement.x = canvas.offsetLeft + (canvas.width / 2) - (levelElement.text.length * 4);
			levelElement.y = canvas.offsetTop + 30;
			levelElement.visible = false;
			messages.push(levelElement);

			scoreElement = new MessageObject();
			scoreElement.text = score + " worm smears";
			scoreElement.x = canvas.offsetLeft + canvas.width - 200;
			scoreElement.y = canvas.offsetTop + 30;
			scoreElement.visible = false;
			messages.push(scoreElement);

			endElement = new MessageObject();
			endElement.x = canvas.offsetLeft + (canvas.width / 2) - (levelElement.text.length * 8);
			endElement.y = canvas.offsetTop + (canvas.height / 2) - 10;
			endElement.visible = false;
			messages.push(endElement);
		}
	}

	// Gamestates
	var LOADING = 0;
	var MENU = 1;
	var PLAYING = 2;
	var GAMEEND = 3;
	var gameState = LOADING;

	var score;
	var timeInSeconds;
	var level;

	var scoreElement;
	var timeElement;
	var levelElement;
	var endElement;

	var gameTimeInterval;

	var sprites = [];
	var spriteTiles = [[]];
	var messages = [];
	var btnMessages = [];

	var clickLocation = [];

	var newGame = true;

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
		title.srcH = 192;
		title.w = 512;
		title.h = 192;
		title.x = canvas.width / 2 - title.halfWidth();
		title.y = 20;
		title.visible = true;
		sprites.push(title);
	}

	var chicken = new SpriteObject();
	{
		chicken.srcX = 32;
		chicken.srcY = 64;
		chicken.srcW = 64;
		chicken.srcH = 64;
		chicken.w = 64;
		chicken.h = 64;
		chicken.x = canvas.width / 2 - chicken.halfWidth();
		chicken.y = canvas.height / 2 - chicken.halfHeight();
		chicken.r = 0;
		chicken.vx = 5;
		chicken.vy = 5;
		chicken.distance = 0;
		chicken.visible = false;
		sprites.push(chicken);
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
		btnCap.srcX = 0;
		btnCap.srcY = 64;
		btnCap.srcW = 8;
		btnCap.srcH = 32;
		btnCap.w = 16;
		btnCap.h = 64;
		btnCap.visible = false;
	}

	var btnMid = new SpriteObject();
	{
		btnMid.srcX = 9;
		btnMid.srcY = 64;
		btnMid.srcW = 1;
		btnMid.srcH = 32;
		btnMid.w = 2;
		btnMid.h = 64;
		btnMid.visible = false;
	}

	var btnMsgPlay = new MessageObject();
	{
		btnMsgPlay.text = "PLAY";
		btnMsgPlay.font = "normal bold 30px komika";
		btnMsgPlay.fontStyle = "red";
		btnMsgPlay.x = (canvas.width / 2) - (btnMsgPlay.text.length * 7);
		btnMsgPlay.y = 450;
		btnMessages.push(btnMsgPlay);
	}

	var btnMsgOptions = new MessageObject();
	{
		btnMsgOptions.text = "OPTIONS";
		btnMsgOptions.font = "normal bold 30px komika";
		btnMsgOptions.fontStyle = "red";
		btnMsgOptions.x = (canvas.width / 2) - (btnMsgOptions.text.length * 7);
		btnMsgOptions.y = 550;
		btnMessages.push(btnMsgOptions);
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
			renderMenu();

		//draw map
		if (gameState == PLAYING || gameState == GAMEEND)
		{
			renderMap();

			//chicken info click listener here
			canvas.addEventListener("mousedown", mouseLocation);
			//draw chicken
			drawChicken();
			console.log("Frame 1up" + "\nChicken movement from last location: " + chicken.distance);

			renderScoreUI();
		}
	}


	function playGame()
	{

		if (newGame)
		{
			initGameUI();
			genMap();
			newGame = false;
		}
	}

	function initGameUI()
	{
		score = 0;
		timeInSeconds = 3;
		level = 1;

		endElement.visible = false;

		timeElement.text = timeInSeconds + " seconds left";
		timeElement.visible = true;

		levelElement.text = "level: " + level;
		levelElement.visible = true;

		scoreElement.text = score + " worm smears";
		scoreElement.visible = true;

		gameTimeInterval = window.setInterval(function ()
		{
			timeInSeconds -= 1;
			if (timeInSeconds == 0)
			{
				clearInterval(gameTimeInterval);
				gameState = GAMEEND;

				endElement.text = timeInSeconds + " seconds left, times up, you got " + score + " worms killed.";
				endElement.x = canvas.offsetLeft + (canvas.width / 2) - (levelElement.text.length * 30);
			}
		}, 1000);


	}

	function endGame()
	{
		endElement.visible = true;
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

		for (var x = 0; x < tileCountX; x ++)
		{
			var id = 0;
			var rotation = 0;

			spriteTiles[x] = [];
			for (var y = 0; y < tileCountY; y ++)
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
							id = 1;

				spriteTiles[x].push(new spriteID(id, rotation));
			}
		}
	}

	function mouseLocation(e)
	{
		if (gameState == MENU || gameState == GAMEEND)
		{
			newGame = true;
			gameState = PLAYING;
		}
		else if (gameState == PLAYING)
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
				addEventListener("mousemove", mouseMoved);
			}
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
		if (! buttonPressed(e))
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

	function entityMove(x, y, entity)
	{
		var dx = entity.x + entity.halfWidth() - x;
		var dy = entity.y + entity.halfHeight() - y;

		if (dx != 0 && dy != 0)
		{
			entity.distance = Math.floor(Math.sqrt((dx * dx) + (dy * dy)));
			entity.r = Math.degrees(Math.atan2(dy, dx));
		}
	}

	function drawChicken()
	{
		entityMove(clickLocation[0], clickLocation[1], chicken);

		ctx.save();
		ctx.translate(chicken.x + chicken.halfWidth(), chicken.y + chicken.halfHeight());

		ctx.rotate(Math.radians(chicken.r - 90));
		ctx.translate(- chicken.halfWidth(), - chicken.halfHeight());

		//for (i = 0; i < chicken.distance; i++)
		//{
		ctx.save();
		ctx.translate(0, 0);

		ctx.drawImage(image,
				chicken.srcX, //srcX			
				chicken.srcY, // srcY			
				chicken.srcW, chicken.srcH,
				0, 0,
				chicken.w, chicken.h);

		ctx.restore();

		//}
//		}
		ctx.restore();

		chicken.x = clickLocation[0] - chicken.halfWidth();
		chicken.y = clickLocation[1] - chicken.halfHeight();
	}

	function renderMap()
	{
		for (var x = 0; x < tileCountX; x ++)
		{
			for (var y = 0; y < tileCountY; y ++)
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
					tempY = - 1;
				}
				else if (rot == 2)
				{
					tempX = - 1;
					tempY = - 1;
				}
				else if (rot == 3)
				{
					tempX = - 1;
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
		scoreElement.text = score + " worm smears";

		for (var i = 0; i < messages.length; i ++)
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
		for (var i = 0; i < sprites.length; i ++)
		{

			renderButton(405);
			renderButton(505);
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

		for (var i = 0; i < btnMessages.length; i ++)
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

	function renderButton(yLocation)
	{
		var xSize = 100;
		//var xStart = ((canvas.width / 2) - (xSize / 2), yLocation);
		ctx.save();

		ctx.translate((canvas.width / 2) - (xSize), yLocation);
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
