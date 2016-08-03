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

/**
 * returns an string value 0-100 that is the percentage a is of b
 * 
 * @param {int} a number to be checked against b
 * @param {int} b total value
 * @param {bool} asString default true, false if you want an int value back
 * @returns {String/int} returns 0-100 in string or int representing percent
 */
function getPercentage(a,b,asString)
{
	if (asString == null)
		asString = true;
	
	if (asString)
		return Math.floor((a / b)*100).toString();
	else
		return Math.floor((a / b)*100);
}

/**
 * converts from degrees to radians
 * @param {int} degrees number to be converted
 * @returns {Number} converted number
 */
Math.radians = function(degrees) 
{
	return degrees * Math.PI / 180;
};
 
/**
 * converts from radians to degrees
 * @param {int} radians number to be converted
 * @returns {Number} converted number
 */
Math.degrees = function(radians)
{
	return radians * 180 / Math.PI;
};