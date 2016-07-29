function startLogic()
{
	var canvas = document.querySelector( "canvas" );
	var ctx = canvas.getContext( "2d" );

	var assetsToLoad = [ ];
	var assetsLoaded = 0;

	var tileCountX = 32;
	var tileCountY = 24;

	console.log( "Loading..." );

	// SFX files
	var chicken_walk = document.querySelector( "#chicken_walk" );
	chicken_walk.addEventListener( "canplaythrough", loadHandler );
	chicken_walk.load();
	assetsToLoad.push( chicken_walk );

	// Sprite sheet
	var image = new Image();
	image.src = "images/spritesheet.png";
	image.addEventListener( "load", loadHandler );
	assetsToLoad.push( image );

	function loadHandler()
	{
		assetsLoaded += 1;

		console.log( getPercentage( assetsLoaded, assetsToLoad.length ) + " loaded..." );

		if ( assetsLoaded == assetsToLoad.length )
		{
			console.log( "Finished Loading" );
			image.removeEventListener( "load", loadHandler );

			chicken_walk.removeEventListener( "canplaythrough", loadHandler );
		}
	}

	// Gamestates
	var MENU = 0;
	var PLAYING = 1;
	var GAMEEND = 2;
	var gameState = PLAYING;

	var sprites = [ ];
	var spriteTiles = [ [ ] ];

	var background = new SpriteObject();
	background.srcY = 192;
	background.srcW = 1024;
	background.srcH = 768;
	background.w = 1024;
	background.h = 768;
	background.visible = false;
	sprites.push( background );

	var title = new SpriteObject();
	title.srcX = 192;
	title.srcW = 512;
	title.srcH = 192;
	title.w = 512;
	title.h = 192;
	title.x = canvas.width / 2 - title.halfWidth();
	title.y = 20;
	title.visible = false;
	sprites.push( title );

	var bgTile = new SpriteObject();
	bgTile.srcW = 32;
	bgTile.srcH = 32;
	bgTile.w = 32;
	bgTile.h = 32;
	bgTile.visible = true;



	function update()
	{
		window.requestAnimationFrame( update );
		switch ( gameState )
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
				console.log( "Welp, shit went pear shaped on us...." );
		}

		render();
	}

	function render()
	{
		ctx.clearRect( 0, 0, canvas.width, canvas.height );

		for ( var i = 0; i < sprites.length; i++ )
		{
			var sprite = sprites[i];
			if ( sprite.visible )
			{

				ctx.drawImage( image,
						sprite.srcX, sprite.srcY,
						sprite.srcW, sprite.srcH,
						Math.floor( sprite.x ), Math.floor( sprite.y ),
						sprite.w, sprite.h
						);
			}
		}

		for ( var i = 0; i < spriteTiles.length; i++ )
		{
			for ( var j = 0; j < spriteTiles[i].length; i++ )
			{
				ctx.rotate( ( spriteTiles[i][j].rotation * 90 ) * Math.PI / 180 );
				ctx.drawImage( image,
						(32*spriteTiles[i][j].id),0,
						32,32,
						(i*32),(j*32),
						32,32);
			}
		}

	}

	function showMenu()
	{

	}

	function playGame()
	{
		genMap();
	}

	function endGame()
	{

	}

	var spriteID = function ( id, rotation )
	{
		if ( id < 0 || id > 5 )
			console.log( "Invalid ID : " + id );
		if ( rotation < 0 || rotation > 3 )
			console.log( "Invalid Rotation : " + rotation );

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
		var spriteNum = 0;
		
		for ( var x = 0; x < tileCountX; x++ )
		{
			spriteTiles [x] = [];
			for ( var y = 0; y < tileCountY; y++ )
			{
				spriteTiles[x][y] = 0;
				
				if (x == 0)
					spriteTiles[x][y] = 2;
				if (x == tileCountX-1)
					spriteTiles[x][y] = 2;
				if (y == 0)
					spriteTiles[x][y] = 2;
				if (y == tileCountY-1)
					spriteTiles[x][y] = 2;
				
				
				switch (spriteTiles[x][y])
				{
					case 5: //fenceCorner
						spriteNum = 5;
						break;
					case 4: // fenceEdge
						spriteNum = 4;
						break;
					case 3: // grassCorner
						spriteNum = 3;
						break;
					case 2: // grassEdge
						spriteNum = 2;
						break;
					case 1: // rock
						spriteNum = 1;
						break;
					default: // dirt
						spriteNum = 0;
						break;
				}
			}
		}
	}
	update();
	}