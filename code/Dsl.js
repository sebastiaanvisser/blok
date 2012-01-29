function Dsl () {}

Dsl.grid =
  function grid (w, h)
  {
    return function grid (g)
    {
      return { x : Math.round(g.x / w) * w
             , y : Math.round(g.y / h) * h
             , r : Math.round(g.r / w) * w
             , b : Math.round(g.b / h) * h
             , d : g.d
             };
    };
  };

Dsl.fromList =
  function fromList (list, p, skip)
  {
    return list.filter(function (n) { return skip.indexOf(n) == -1; })
                .map(function (n) { return Geom.absoluteEl(n, p, true); });
  };

Dsl.selector =
  function selector (sel, p, skip)
  {
    return fromList($(sel).get(), p, skip);
  };

Dsl.compose =
  function compose (a, b)
  {
    return function compose (g, o)
    {
      return a(b(g, o), o);
    };
  };

Dsl.orOrigin =
  function orOrigin (a)
  {
    return function orOrigin (g, o)
    {
      var x = a(g, o);
      return x === undefined ? o : x;
    };
  };

Dsl.orCurrent =
  function orCurrent (a)
  {
    return function orCurrent (g, o)
    {
      var x = a(g, o);
      return x === undefined ? g : x;
    };
  };

Dsl.margin =
  function margin (m, a)
  {
    return function margin (g, o)
    {
      return Geom.shrink(a(Geom.grow(g, m), o), m);
    }
  }

Dsl.strech =
  function strech (n, a)
  {
    return function strech (g, o)
    {
      var ag = a(g, o);

      var dx = ag.x - g.x;
      var dy = ag.y - g.y;
      var dr = ag.r - g.r;
      var db = ag.b - g.b;

      return { x : dx ? ag.x - (Math.abs(dx) / dx) * Math.pow(Math.abs(dx), 1 / (1 + n)) : g.x
             , y : dy ? ag.y - (Math.abs(dy) / dy) * Math.pow(Math.abs(dy), 1 / (1 + n)) : g.y
             , r : dr ? ag.r - (Math.abs(dr) / dr) * Math.pow(Math.abs(dr), 1 / (1 + n)) : g.r
             , b : db ? ag.b - (Math.abs(db) / db) * Math.pow(Math.abs(db), 1 / (1 + n)) : g.b
             , d : g.d
             };
    };
  };

Dsl.bounded =
  function bounded (minx, miny, maxx, maxy)
  {
    return function bounded (g)
    {
      var dw = g.r - g.x
      var dh = g.b - g.y
      if (minx !== undefined) dw = Math.max(minx, dw);
      if (miny !== undefined) dh = Math.max(miny, dh);
      if (maxx !== undefined) dw = Math.min(maxx, dw);
      if (maxy !== undefined) dh = Math.min(maxy, dh);
      return { x : g.d.left   ? g.r - dw : g.x
             , y : g.d.top    ? g.b - dh : g.y
             , r : g.d.right  ? g.x + dw : g.r
             , b : g.d.bottom ? g.y + dh : g.b
             , d : g.d
             };
    };
  };

