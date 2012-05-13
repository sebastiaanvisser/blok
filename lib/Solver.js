function Solver () {}

Solver.within =
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

Solver.outside =
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

Solver.serialize =
  function serialize (g)
  {
    return [g.x, g.y, g.w, g.h].join(",");
  };

Solver.drag1 =
  function drag1 (container, g, obstacles)
  {
    function alternatives (v)
    {
      return obstacles.map(function (o) { return Solver.outside(o)(v); }).filter(function (n) { return n.length; })
    }

    var done = {};

    var options = { good : [], maybe : Solver.within(container)(g) }

    for (var i = 0; options.maybe.length && i < obstacles.length + 1; i++)
    {
      var blocking =
        options.maybe.map
          (function (b)
           {
             var as = Util.concat(alternatives(b))
             var bs = as.filter(function (o) { return Geom.contained(o, container); });
             return as.length
               ? { good : [ ], maybe : bs.filter(function (o) { return !done[Solver.serialize(o)]; }) }
               : { good : [b], maybe : [] };
           });

      var ok = Util.concat(blocking.map(function (b) { return b.good; }))
                   .filter(function (x) { return Geom.contained(x, container); });

      options =
        { good  : options.good.concat(ok)
        , maybe : Util.concat(blocking.map(function (b) { return b.maybe; }))
        };

      options.good.forEach  (function (o) { done[Solver.serialize(o)] = true; });
      options.maybe.forEach (function (o) { done[Solver.serialize(o)] = true; });
    }

    return options.good;
  };

Solver.drag =
  function drag (containers, obstacles)
  {
    return function (g)
    {
      return Util.concat(containers().map
        (function (c)
         {
           var os = Util.notNull(obstacles().map(function (o) { return Geom.intersect(o, c); }));
           return Solver.drag1(c, g, os);
         }));
    };

  };

Solver.resize =
  function resize (containers, obstacles)
  {
    return function (g)
    {
      var x, y, r, b, i, o;

      i = Util.notNull(Util.concat
            ( containers().map(function (c) { return Geom.intersect(c, g); })
            ));

      if (g.d.left)   o = i.sort(function (a, b) { return b.r - a.r; })[0];
      if (g.d.top)    o = i.sort(function (a, b) { return b.b - a.b; })[0];
      if (g.d.right)  o = i.sort(function (a, b) { return a.x - b.x; })[0];
      if (g.d.bottom) o = i.sort(function (a, b) { return a.y - b.y; })[0];

      function blocking (region)
      {
        return Util.notNull(obstacles().map(function (o) { return Geom.intersect(o, region); }));
      }

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

// Re-export as combinators.

Dsl.drag   = Solver.drag;
Dsl.resize = Solver.resize;

