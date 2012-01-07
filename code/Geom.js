function Geom () {}

Geom.intersect =
  function intersect (a, b)
  {
    var x = Math.max(a.x,       b.x)
    var y = Math.max(a.y,       b.y)
    var w = Math.min(a.x + a.w, b.x + b.w) - x
    var h = Math.min(a.y + a.h, b.y + b.h) - y

    return (w <= 0 || h <= 0) ? null : {x: x, y: y, w: w, h: h}
  };

Geom.contained =
  function contained (a, b)
  {
    return a.x >= b.x && a.x + a.w <= b.x + b.w
        && a.y >= b.y && a.y + a.h <= b.y + b.h
  };

Geom.distance =
  function distance (a, b)
  {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

