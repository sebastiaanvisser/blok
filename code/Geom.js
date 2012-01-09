function Geom () {}

Geom.fromElement =
  function fromElement (e)
  {
    return { x : e.offsetLeft
           , y : e.offsetTop
           , r : e.offsetLeft + e.offsetWidth
           , b : e.offsetTop  + e.offsetHeight
           };
  };

Geom.intersect =
  function intersect (a, b)
  {
    var x = Math.max(a.x, b.x)
    var y = Math.max(a.y, b.y)
    var r = Math.min(a.r, b.r)
    var b = Math.min(a.b, b.b)
    return (r - x <= 0 || b - y <= 0) ? null : {x: x, y: y, r: r, b: b}
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

Geom.setX = function setX (g, x) { return { x : x, y : g.y, r : g.r, b : g.b }; };
Geom.setY = function setY (g, y) { return { x : g.x, y : y, r : g.r, b : g.b }; };
Geom.setR = function setR (g, r) { return { x : g.x, y : g.y, r : r, b : g.b }; };
Geom.setB = function setB (g, b) { return { x : g.x, y : g.y, r : g.r, b : b }; };

