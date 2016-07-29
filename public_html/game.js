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

			startLogic();
		}
	}

	// Gamestates
	var MENU = 0;
	var PLAYING = 1;
	var GAMEEND = 2;
	var gameState = MENU;

	var sprites = [ [ ] ];

	var background = new SpriteObject();
	background.srcY = 192;
	background.srcW = 1024;
	background.srcH = 768;
	background.w = 1024;
	background.h = 768;
	background.visible = true;
	sprites.push( background );

	var title = new SpriteObject();
	title.srcX = 192;
	title.srcW = 512;
	title.srcH = 192;
	title.w = 512;
	title.h = 192;
	title.x = canvas.width / 2 - title.halfWidth();
	title.y = 20;
	title.visible = true;
	sprites.push( title );

	var bgTile = new SpriteObject();
	bgTile.srcW = 32;
	bgTile.srcH = 32;
	bgTile.w = 32;
	bgTile.h = 32;
	bgTile.visible = true;
	sprites.push( bgTile );



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
	}

	function showMenu()
	{

	}

	function playGame()
	{

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
		for ( var i = 0; i < tileCountX; i++ )
		{
			for ( var j = 0; j < tileCountY; j++ )
			{

			}
		}
	}
	update();
}