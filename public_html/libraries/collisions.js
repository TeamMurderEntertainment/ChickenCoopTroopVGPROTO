/**
 * checks to see if am x and y cord is in a SpriteObject
 * @param {int} px x of point
 * @param {int} py y of point
 * @param {SpriteObject} r SpriteObject checking hit on
 * @returns {Boolean} true if hit, false if miss
 */
function hitTestPoint(px, py, r)
{
	var hit = false;

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

function hitTestCircle(c1, c2)
{
	var vx = c1.center().x - c2.center().x;
	var vy = c1.center().y - c2.center().y;

	var magnitude = Mathsqrt(vx * vx + vy * vy);
	var totalRadii = c1.halfWidth() + c2.halfWidth();
	var hit = magnitude < totalRadii;

	return hit;
}

function blockCircle(c1, c2, bounce)
{
	if (typeof bounce === "undefined")
		bounce = false;

	var vx = c1.center().x - c2.center().x;
	var vy = c1.center().y - c2.center().y;

	var magnitude = Mathsqrt(vx * vx + vy * vy);
	var totalRadii = c1.halfWidth() + c2.halfWidth();

	if (magnitude < totalRadii)
	{
		var overlap = totalRadii - magnitude;
		vx = vx / magnitude;
		vy = vy / magnitude;

		c1.x += overlap * vx;
		c1.y += overlap * vy;

		if (bounce)
		{
			var s = {};

			s.vx = vy;
			s.vy = -vx;

			bounceOffSurface(c1, s);
		}
	}
}

function bounceOffSurface(o, s)
{
	s.lx = s.vy;
	s.ly = s.vx;

	s.magnitude = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

	s.dx = s.vx / s.magnitude;
	s.dy = s.vy / s.magnitude;

	var dp1 = o.vx * s.dx + o.vy * s.dy;

	var p1Vx = dp1 * s.dx;
	var p1Vy = dp1 * s.dy;

	var dp2 = o.vx * (s.lx / s.magnitude) + o.vy * (s.ly / s.magnitude);

	var p2Vx = dp2 * (s.lx / s.magnitude);
	var p2Vy = dp2 * (s.ly / s.magnitude);

	p2Vx *= -1;
	p2Vy *= -1;

	var bounceVx = p1Vx + p2Vx;
	var bounceVy = p1Vy + p2Vy;

	o.vx = bounceVx;
	o.vy = bounceVy;
}

function blockRectangle(r1, r2, bounce)
{
	if (typeof bounce === "undefined")
		bounce = false;

	var collisionSide = "";

	var dx = r1.center().x - r2.center().x;
	var dy = r1.center().y - r2.center().y;

	var sumHalfWidths = r1.halfWidth() + r2.halfWidth();
	if (Math.abs(dx) < sumHalfWidths)
	{
		var sumHalfHeights = r1.halfHeight() + r2.halfHeight();

		if (Math.abs(dy) < sumHalfHeights)
		{
			var overlapX = sumHalfWidths - Math.abs(dx);
			var overlapY = sumHalfHeights - Math.abs(dy);

			if (overlapX >= overlapY)
			{
				if (dy > 0)
				{
					collisionSide = "top";
					r1.y = r1.y + overlapY;
				}
				else
				{
					collisionSide = "bottom";
					r1.y = r1.y - overlapY;
				}

				if (bounce)
					r1.vy *= -1;
			}
			else
			{
				if (dx > 0)
				{
					collisionSide = "left";

					r1.x = r1.x + overlapX;
				}
				else
				{
					collisionSide = "right";

					r1.x = r1.x - overlapX;
				}

				if (bounce)
					r1.vx *= -1;
			}
		}
		else
		{
			collisionSide = "none";
		}
	}
	else
	{
		collisionSide = "none";
	}
	return collisionSide;
}
