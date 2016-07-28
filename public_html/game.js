$( document ).ready( function ()
{
	console.log( "Loading..." );
	var chicken_walk = document.querySelector( "#chicken_walk" );
	chicken_walk.addEventListener( "canplaythrough", loadHandler );
	chicken_walk.load();

	function loadHandler()
	{
		chicken_walk.removeEventListener( "canplaythrough", loadHandler );
		console.log( "Sound Loaded" );
	}

	window.addEventListener( "keydown", function ( e )
	{
		if ( e.keyCode == 32 )
		{
			console.log( "Playing sound" );
			chicken_walk.play();
		}
	} );

	window.addEventListener( "keyup", function ( e )
	{
		if ( e.keyCode == 32 )
		{
			console.log( "Stoping sound" );
			chicken_walk.pause();
		}
	} );
} );