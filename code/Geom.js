function Geom () {}

Geom.relativeEl =
  function relativeEl (e)
  {
    return { x : e.offsetLeft
           , y : e.offsetTop
           , r : e.offsetLeft + e.offsetWidth
           , b : e.offsetTop  + e.offsetHeight
           };
  };

Geom.absoluteEl =
  function absoluteEl (e, p)
  {
    var x = e.offsetLeft
      , y = e.offsetTop;

    var cur = e;
    while (cur != document.body)
    {
      cur = cur.parentNode;
      if (cur == p) break;
      x += cur.offsetLeft - cur.scrollLeft;
      y += cur.offsetTop - cur.scrollTop;
    }

    return { x : x
           , y : y
           , r : x + e.offsetWidth
           , b : y + e.offsetHeight
           };
  };

Geom.parentEl =
  function parentEl (e)
  {
    return { x : 0
           , y : 0
           , r : e.parentNode.offsetWidth
           , b : e.parentNode.offsetHeight
           };
  };

Geom.intersect =
  function intersect (a, b)
  {
    var c = Util.copy(a);
    c.x = Math.max(a.x, b.x)
    c.y = Math.max(a.y, b.y)
    c.r = Math.min(a.r, b.r)
    c.b = Math.min(a.b, b.b)
    return (c.r - c.x <= 0 || c.b - c.y <= 0) ? null : c;
  };

Geom.grow =
  function grow (a, m)
  {
    var c = Util.copy(a);
    c.x = a.x - m;
    c.y = a.y - m;
    c.r = a.r + m;
    c.b = a.b + m;
    return c;
  };

Geom.shrink =
  function shrink (a, m)
  {
    var c = Util.copy(a);
    c.x = a.x + m;
    c.y = a.y + m;
    c.r = a.r - m;
    c.b = a.b - m;
    return c;
  };

Geom.contained =
  function contained (a, b)
  {
    return a.x >= b.x && a.r <= b.r && a.y >= b.y && a.b <= b.b
  };

Geom.distance =
  function distance (a, b)
  {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

Geom.setX = function setX (g, x) { return Util.set("x", x)(g); };
Geom.setY = function setY (g, y) { return Util.set("y", y)(g); };
Geom.setR = function setR (g, r) { return Util.set("r", r)(g); };
Geom.setB = function setB (g, b) { return Util.set("b", b)(g); };

Geom.sortByDistance =
  function sortByDistance (g, xs)
  {
    return xs.sort(
      function (a, b)
      {
        a.distance = Geom.distance(a, g);
        b.distance = Geom.distance(b, g);
        return a.distance - b.distance;
      });
  };

