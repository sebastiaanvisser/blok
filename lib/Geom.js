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

Geom.width  = function width  (g) { return g.r - g.x; };
Geom.height = function height (g) { return g.b - g.y; };

Geom.surface =
  function surface (g)
  {
    return Math.abs(g.r - g.x) * Math.abs(g.b - g.y);
  };

Geom.absoluteEl =
  function absoluteEl (e, p, s)
  {
    var x = e.offsetLeft
      , y = e.offsetTop;

    var cur = e;
    while (cur != document.body)
    {
      cur = cur.parentNode;
      if (cur == p) break;
      x += cur.offsetLeft - (s ? cur.scrollLeft : 0);
      y += cur.offsetTop  - (s ? cur.scrollTop  : 0);
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

Geom.centroid =
  function centroid (a)
  {
    return { x : (a.x + a.r) / 2
           , y : (a.y + a.b) / 2
           , r : (a.x + a.r) / 2
           , b : (a.y + a.b) / 2
           };
  };

Geom.setX = function setX (g, x) { return Util.set("x", x)(g); };
Geom.setY = function setY (g, y) { return Util.set("y", y)(g); };
Geom.setR = function setR (g, r) { return Util.set("r", r)(g); };
Geom.setB = function setB (g, b) { return Util.set("b", b)(g); };

Geom.sortByDistance =
  function sortByDistance (g, points)
  {
    var centroid      = Geom.centroid(g);
    var withDistances = points.map(function (pt) { return [Geom.distance(Geom.centroid(pt), centroid), pt]; });
    var sorted        = withDistances.sort(function (a, b) { return a[0] - b[0]; });
    if (Geom.debugging)
    {
      Debug.point("origin")(centroid);
      points.map(Geom.centroid).map(Debug.point(""));
      if (sorted.length) Debug.point("origin")(Geom.centroid(sorted[0][1]));
    }
    return sorted.map(function (a) { return a[1]; });
  };

Geom.withinRange =
  function withinRange (g, d, x)
  {
    return Geom.distance(Geom.centroid(x), Geom.centroid(g)) < d ? x : null;
  };
 
