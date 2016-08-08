/**
 * checks to see if am x and y cord is in a SpriteObject
 * @param {int} px x of point
 * @param {int} py y of point
 * @param {SpriteObject or SimpleRect} r SpriteObject checking hit on
 * @returns {Boolean} true if hit, false if miss
 */
function hitTestPoint(px, py, r)
{
	var hit = false;
	console.log(px > r.left(), px < r.right(), py > r.top(), py < r.bottom());
	if (px > r.left() && px < r.right() && py > r.top() && py < r.bottom())
		hit = true;

	return hit;
}
/**
 * checks to see if 2 SpriteObjects are overlapping, or colliding
 * @param {SpriteObject} r1 first SpriteObject
 * @param {SpriteObject} r2 second SpriteObject
 * @returns {Boolean} true if hit, false if miss
 */
function hitTestRectangle(r1, r2)
{
	var hit = false;

	var dx = r1.center().x - r2.center().x;
	var dy = r1.center().y - r2.center().y;

	var sumHalfWidths = r1.halfWidth() + r2.halfWidth();
	if (Math.abs(dx) < sumHalfWidths)
	{
		var sumHalfHeights = r1.halfHeight() + r2.halfHeight();

		if (Math.abs(dy) < sumHalfHeights)
			hit = true;
	}
	return hit;
}