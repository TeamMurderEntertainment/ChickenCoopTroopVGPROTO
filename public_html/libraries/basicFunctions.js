/**
* gets a random int between bottom number and top provided
* @param {int} bot lowest number you can get
* @param {int} top highest number you can get
* @returns {int} random result
*/
function getRandom(bot,top)
{
	return Math.floor(Math.random()*(top + 1 - bot)) + bot;
}

/**
 * removes the given object from the given array
 * 
 * @param {type} objectToRemove the object that is to be removed
 * @param {type} array the array the object will be removed from
 */
function removeObject(objectToRemove,array)
{
	var index = array.indexOf(objectToRemove);
	
	if(index != -1)
	{
		array.splice(index,1);
	}
}