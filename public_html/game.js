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
		}
	}

	// Gamestates
	var MENU = 0;
	var PLAYING = 1;
	var GAMEEND = 2;
	var gameState = MENU;

	var sprites = [];
	var spriteTiles = [[]];

	var clickLocation = [];

	var background = new SpriteObject();
	background.srcY = 192;
	background.srcW = 1024;
	background.srcH = 768;
	background.w = 1024;
	background.h = 768;
	background.visible = true;
	sprites.push(background);

	var title = new SpriteObject();
	title.srcX = 192;
	title.srcW = 512;
	title.srcH = 192;
	title.w = 512;
	title.h = 192;
	title.x = canvas.width / 2 - title.halfWidth();
	title.y = 20;
	title.visible = true;
	sprites.push(title);

	var chicken = new SpriteObject();
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

	var bgTile = new SpriteObject();
	bgTile.srcW = 32;
	bgTile.srcH = 32;
	bgTile.w = 32;
	bgTile.h = 32;
	bgTile.visible = true;
	sprites.push(bgTile);

	function update()
	{
		//window.requestAnimationFrame( update );

		gameState = PLAYING;//HARDCODING!

		switch (gameState)
		{
			case MENU:
				showMenu();
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


	}

	function render()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		//draw menu stuff
		//renderMenu();

		//draw map
		renderMap();

		//chicken info click listener here
		canvas.addEventListener("mousedown", mouseLocation);
		//draw chicken
		drawChicken();
	}

	function showMenu()
	{

	}

	function playGame()
	{
		genMap();
		setInterval(render, 30);
	}

	function endGame()
	{

	}

	var spriteID = function (id, rotation)
	{
		if (id < 0 || id > 5)
			console.log("Invalid ID : " + id);
		if (rotation < 0 || rotation > 3)
			console.log("Invalid Rotation : " + rotation);

		this.id = id;
		this.rotation = rotation;
	};

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
							id = 1;

				spriteTiles[x].push(new spriteID(id, rotation));
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
		} else
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
		ctx.translate(-chicken.halfWidth(), -chicken.halfHeight());

//		for (i = 0; i < chicken.distance; i++)
//		{
			ctx.save();
			ctx.translate(0, 0);

			ctx.drawImage(image,
					chicken.srcX, //srcX			
					chicken.srcY, // srcY			
					chicken.srcW, chicken.srcH,
					0, 0,
					chicken.w, chicken.h);

			ctx.restore();
//		}
		ctx.restore();

		chicken.x = clickLocation[0] - chicken.halfWidth();
		chicken.y = clickLocation[1] - chicken.halfHeight();
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
				} else if (rot == 1)
				{
					tempX = 0;
					tempY = -1;
				} else if (rot == 2)
				{
					tempX = -1;
					tempY = -1;
				} else if (rot == 3)
				{
					tempX = -1;
					tempY = 0;
				}

				ctx.save();
				ctx.translate((x * bgTile.w), (y * bgTile.h));

				ctx.rotate(((90 * spriteTiles[x][y].rotation) * Math.PI) / 180);
				ctx.drawImage(image,
						spriteTiles[x][y].id * 32, //srcX
						0, // srcY
						32, 32,
						0 + (tempX * 32), 0 + (tempY * 32),
						32, 32);
				ctx.restore();
			}
		}
	}

	function renderMenu()
	{
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
	}

	update();
}
