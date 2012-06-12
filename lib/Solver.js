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
      if (Solver.debugging) options.maybe.forEach(Debug.elem("maybe", i));

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

      if (Solver.debugging) options.good.forEach(Debug.elem("good", i));

      options.good.forEach  (function (o) { done[Solver.serialize(o)] = true; });
      options.maybe.forEach (function (o) { done[Solver.serialize(o)] = true; });

      // Optimization.
      if (options.good.length && i > 2) break;
    }

    return options.good;
  };

Solver.drag =
  function drag (containers, obstacles)
  {
    return function (g)
    {
      if (Solver.debugging)
      {
        Debug.clear();
        Debug.elem("bad", "g")(g, "0");
      }

      return Util.concat(containers().map
        (function (c)
         {
           var os = Util.notNull(obstacles().map(function (o) { return Geom.intersect(o, c); }));
           return Solver.drag1(c, g, os);
         }));
    };

  };

// ----------------------------------------------------------------------------

Solver.resize =
  function resize (containers, obstacles)
  {
    return function (g, o)
    {
      var l, t, r, b, i, p;

      if (Solver.debugging) Debug.clear();

      var isect = function (c) { return Geom.intersect(c, g); };
      i = Util.notNull(Util.concat(containers().map(isect)));

      if (!i.length) return null;

      if (g.d.left)   p = i.sort(function (a, b) { return b.r - a.r; })[0];
      if (g.d.top)    p = i.sort(function (a, b) { return b.b - a.b; })[0];
      if (g.d.right)  p = i.sort(function (a, b) { return a.x - b.x; })[0];
      if (g.d.bottom) p = i.sort(function (a, b) { return a.y - b.y; })[0];

      function blocking (region)
      {
        return Util.notNull(obstacles().map(function (p) { return Geom.intersect(p, region); }));
      }

      function compute (pt)
      {

        var pos = [];

        if (g.d.left)
        {
          l = blocking(Geom.setX(pt, -Infinity)).sort(function (a, b) { return b.r - a.r; })[0];
          if (l) pos.push(Geom.setX(pt, Math.max(pt.x, l.r)));
        }

        if (g.d.top)
        {
          t = blocking(Geom.setY(pt, -Infinity)).sort(function (a, b) { return b.b - a.b; })[0];
          if (t) pos.push(Geom.setY(pt, Math.max(pt.y, t.b)));
        }

        if (g.d.right)
        {
          r = blocking(Geom.setR(pt,  Infinity)).sort(function (a, b) { return a.x - b.x; })[0];
          if (r) pos.push( Geom.setR(pt, Math.min(pt.r, r.x)) );
        }

        if (g.d.bottom)
        {
          b = blocking(Geom.setB(pt,  Infinity)).sort(function (a, b) { return a.y - b.y; })[0];
          if (b) pos.push( Geom.setB(pt, Math.min(pt.b, b.y)) );
        }

        if (t && l) pos.push( Geom.setY(Geom.setX(pt, t.r), l.b) );
        if (t && r) pos.push( Geom.setY(Geom.setR(pt, t.x), r.b) );
        if (b && l) pos.push( Geom.setB(Geom.setX(pt, b.r), l.y) );
        if (b && r) pos.push( Geom.setB(Geom.setR(pt, b.x), r.y) );

        var target;

        if (t && l) target = Geom.points(p)[0];
        if (t && r) target = Geom.points(p)[1];
        if (b && l) target = Geom.points(p)[2];
        if (b && r) target = Geom.points(p)[3];

        if (Solver.debugging && target) Debug.point("origin")(target);

        if (pos.length > 1)
          pos =
            pos.map( function (q)
                     {
                       var qt;
                       if (t && l) qt = Geom.points(q)[0];
                       if (t && r) qt = Geom.points(q)[1];
                       if (b && l) qt = Geom.points(q)[2];
                       if (b && r) qt = Geom.points(q)[3];

                       if (Solver.debugging && qt) Debug.point("origin")(qt);

                       return [ q
                              , Geom.distance(target, qt)
                              ];
                     }
                   )
               .sort(function (a, b) { return a[1] - b[1]; })
               .map(function (a) { return a[0]; });

        if (Solver.debugging && pos.length) Debug.elem("bad")(pos[0][0]);

        if (pos.length)
        {
          if (Geom.eq(pos[0], pt)) return pt;
          else return compute(pos[0]);
        } else return pt;
      }

      return compute(p, 0);
    };
  };

// Re-export as combinators.

Dsl.drag   = Solver.drag;
Dsl.resize = Solver.resize;

