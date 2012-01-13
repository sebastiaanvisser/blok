function Constraint () {}

Constraint.grid =
  function grid (w, h)
  {
    return function grid (g)
    {
      return { x : Math.round(g.x / w) * w
             , y : Math.round(g.y / h) * h
             , r : Math.round(g.r / w) * w
             , b : Math.round(g.b / h) * h
             };
    };
  };

Constraint.within =
  function within (f)
  {
    return function within (g)
    {
      var w = g.r - g.x;
      var h = g.b - g.y;
      var x = Math.min(Math.max(f.x, g.x), f.r - w);
      var y = Math.min(Math.max(f.y, g.y), f.b - h);
      var z =
          { x : x
          , y : y
          , r : x + w
          , b : y + h
          };
      return [z];
    };
  };

Constraint.outside =
  function outside (f)
  {
    return function outside (g)
    {
      if (!Geom.intersect(f, g)) return [];

      var fw = f.r - f.x;
      var fh = f.b - f.y;
      var gw = g.r - g.x;
      var gh = g.b - g.y;

      return [ { x : f.x - gw , y : g.y,       r : f.x      , b : g.b      }
             , { x : f.r      , y : g.y,       r : f.r + gw , b : g.b      }
             , { x : g.x      , y : f.y - gh , r : g.r      , b : f.y      }
             , { x : g.x      , y : f.b      , r : g.r      , b : f.b + gh }
             ];
    };
  };

// ----------------------------------------------------------------------------

Constraint.sortByDistance =
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

Constraint.debugElem =
  function debugElemElem (v)
  {
    return function (g)
    {
      var e = $("<div class='debug " + v + "'></div>");
      $("#debug").append(e);
      $(e).css("left",   g.x + "px");
      $(e).css("top",    g.y + "px");
      $(e).css("width",  (g.r - g.x) + "px");
      $(e).css("height", (g.b - g.y) + "px");
    };
  };

Constraint.serialize =
  function serialize (g)
  {
    return [g.x, g.y, g.w, g.h].join(",");
  };

Constraint.solve1 =
  function solve1 (container, g, obstacles)
  {
    function alternatives (v)
    {
      return obstacles.map(function (o) { return Constraint.outside(o)(v); }).filter(function (n) { return n.length; })
    }

    var done = {};

    var options = { good : [], maybe : Constraint.within(container)(g) }

    for (var i = 0; options.maybe.length && i < obstacles.length + 1; i++)
    {
      var blocking =
        options.maybe.map
          (function (b)
           {
             var as = Util.concat(alternatives(b))
             var bs = as.filter(function (o) { return Geom.contained(o, container); });
             return as.length
               ? { good : [ ], maybe : bs.filter(function (o) { return !done[Constraint.serialize(o)]; }) }
               : { good : [b], maybe : [] };
           });

      var ok = Util.concat(blocking.map(function (b) { return b.good; }))
                   .filter(function (x) { return Geom.contained(x, container); });

      options =
        { good  : options.good.concat(ok)
        , maybe : Util.concat(blocking.map(function (b) { return b.maybe; }))
        };

      if (Constraint.debug)
      {
        options.good.forEach(Constraint.debugElem("good"));
        options.maybe.forEach(Constraint.debugElem("maybe"));
      }

      options.good.forEach  (function (o) { done[Constraint.serialize(o)] = true; });
      options.maybe.forEach (function (o) { done[Constraint.serialize(o)] = true; });
    }

    return Constraint.sortByDistance(g, options.good).slice(0, 1);
  };

Constraint.dragSolver =
  function dragSolver (containers, obstacles)
  {
    return function (g)
    {
      if (Constraint.debug) $("#debug *").remove();
      var options = Util.concat(containers.map
        (function (cont)
         {
           var c  = Geom.fromElement(cont);
           var os = Util.notNull(obstacles.map(function (o) { return Geom.intersect(Geom.fromElement(o), c); }));
           return Constraint.solve1(c, g, os);
         }));

      return Constraint.sortByDistance(g, options)[0];
    };

  };
  
Constraint.compose =
  function compose (a, b)
  {
    return function compose (g, o)
    {
      return a(b(g, o), o);
    };
  };

Constraint.orOrigin =
  function orOrigin (a)
  {
    return function orOrigin (g, o)
    {
      var x = a(g, o);
      return x === undefined ? o : x;
    };
  };

Constraint.orCurrent =
  function orCurrent (a)
  {
    return function orOrigin (g, o)
    {
      var x = a(g, o);
      return x === undefined ? g : x;
    };
  };

Constraint.strech =
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

Constraint.bounded =
  function bounded (minx, miny, maxx, maxy)
  {
    return function (g)
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

Constraint.resizeSolver =
  function resizeSolver (containers, obstacles)
  {
    return function (g)
    {
      var x, y, r, b, i, o;

      i = Util.notNull(Util.concat
            ( containers
            . map(Geom.fromElement)
            . map(function (c) { return Geom.intersect(c, g); })
            ));

      if (g.d.left)   o = i.sort(function (a, b) { return b.r - a.r; })[0];
      if (g.d.top)    o = i.sort(function (a, b) { return b.b - a.b; })[0];
      if (g.d.right)  o = i.sort(function (a, b) { return a.x - b.x; })[0];
      if (g.d.bottom) o = i.sort(function (a, b) { return a.y - b.y; })[0];

      function blocking (region) { return Util.notNull(obstacles.map(function (o) { return Geom.intersect(Geom.fromElement(o), region); })); }

      if (g.d.left)   x = blocking(Geom.setX(o, -Infinity)).sort(function (a, b) { return b.r - a.r; })[0];
      if (g.d.top)    y = blocking(Geom.setY(o, -Infinity)).sort(function (a, b) { return b.b - a.b; })[0];
      if (g.d.right)  r = blocking(Geom.setR(o,  Infinity)).sort(function (a, b) { return a.x - b.x; })[0];
      if (g.d.bottom) b = blocking(Geom.setB(o,  Infinity)).sort(function (a, b) { return a.y - b.y; })[0];

      return { x : x ? Math.max(o.x, x.r) : o.x
             , y : y ? Math.max(o.y, y.b) : o.y
             , r : r ? Math.min(o.r, r.x) : o.r
             , b : b ? Math.min(o.b, b.y) : o.b
             , d : g.x
             };
    };
  };

