function Constraint () {}

Constraint.grid =
  function grid (w, h)
  {
    return function grid (g)
    {
      return { x : Math.round(g.x / w) * w
             , y : Math.round(g.y / h) * h
             , w : Math.round(g.w / w) * w
             , h : Math.round(g.h / h) * h
             };
    };
  };

Constraint.within =
  function within (f)
  {
    return function within (g)
    {
      var x = Math.min(Math.max(f.x, g.x), f.x + f.w - g.w);
      var y = Math.min(Math.max(f.y, g.y), f.y + f.h - g.h);
      var r  = {x : x, y : y, w : g.w, h : g.h};
      return Geom.contained(r, f) ? [r] : [];
    };
  };

Constraint.outside =
  function outside (f)
  {
    return function outside (g)
    {
      var xa  = Math.min(Math.max(f.x, g.x), f.x + f.w - g.w);
      var xb  = Math.max(f.x, Math.min(g.x, f.x + f.w - g.w));
      var ins = g.x < f.x + f.w && g.x + g.w > f.x
             && g.y < f.y + f.h && g.y + g.h > f.y;

      return ins
        ? [ { x : f.x - g.w , y : g.y , w : g.w , h : g.h }
          , { x : f.x + f.w , y : g.y , w : g.w , h : g.h }
          , { x : g.x , y : f.y - g.h , w : g.w , h : g.h }
          , { x : g.x , y : f.y + f.h , w : g.w , h : g.h }
          ]
        : [];
    };
  };

Constraint.element =
  function element (elem)
  {
    return function ()
    {
      return { x : elem.offsetLeft
             , y : elem.offsetTop
             , w : elem.offsetWidth
             , h : elem.offsetHeight
             };
    };
  };

Constraint.bounded =
  function bounded (minx, maxx, miny, maxy)
  {
    return function (g)
    {
      var dw = g.w
      var dh = g.h
      if (minx !== null) dw = Math.max(minx, dw);
      if (miny !== null) dh = Math.max(miny, dh);
      if (maxx !== null) dw = Math.min(maxx, dw);
      if (maxy !== null) dh = Math.min(maxy, dh);
      return { x : g.d.right  ? g.x : g.x - dw + g.w
             , y : g.d.bottom ? g.y : g.y - dh + g.h
             , w : dw
             , h : dh
             };
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
      $(e).css("width",  g.w + "px");
      $(e).css("height", g.h + "px");
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
      var bounds = options.maybe;
      var blocking = bounds.map(
                       function (b)
                       {
                         var as = Util.concat(alternatives(b)).filter(function (o) { return Geom.contained(o, container); });
                         return as.length
                           ? { good : [ ], maybe : as.filter(function (o) { return !done[Constraint.serialize(o)]; }) }
                           : { good : [b], maybe : [] };
                       });

      options = { good  : options.good.concat(Util.concat(blocking.map(function (b) { return b.good; })))
                , maybe : Util.concat(blocking.map(function (b) { return b.maybe; }))
                };

      if (Constraint.debug)
      {
        options.good.forEach(Constraint.debugElem("good"));
        options.maybe.forEach(Constraint.debugElem("maybe"));
      }

      options.good.map(function (o) { done[Constraint.serialize(o)] = true; });
      options.maybe.map(function (o) { done[Constraint.serialize(o)] = true; });
    }

    return Constraint.sortByDistance(g, options.good).slice(0, 1);
  };

Constraint.solver =
  function solver (containers, obstacles)
  {
    return function (g)
    {
      if (Constraint.debug) $("#debug *").remove();
      var options = containers.map
        (function (cont)
         {
           var c  = cont();
           var os = Util.notNull(obstacles.map(function (o) { return Geom.intersect(o(), c); }));
           return Constraint.solve1(c, g, os);
         });

      return Constraint.sortByDistance(g, Util.concat(options))[0];
    };

  };
  
Constraint.compose = function compose (a, b) { return function compose (g) { return a(b(g)); }; };

Constraint.strech =
  function strech (n, a)
  {
    return function strech (g)
    {
      var ag = a(g);
      var d  = Geom.distance(g, ag);
      var dx = ag.x - g.x;
      var dy = ag.y - g.y;

      ag.x = dx ? ag.x - (Math.abs(dx) / dx) * Math.pow(Math.abs(dx), 1 / (1 + n)) : g.x;
      ag.y = dy ? ag.y - (Math.abs(dy) / dy) * Math.pow(Math.abs(dy), 1 / (1 + n)) : g.y;

      return ag;
    };
  };




Constraint.solverX =
  function solverX (containers, obstacles)
  {
    return function (g)
    {
// todo
      if (g.d.bottom)
      {
        var region = { x : g.x, y : g.y, w : g.w, h : Infinity };
        var os = Util.notNull(obstacles.map(function (o) { return Geom.intersect(o(g), region); }));
        closest = os.sort(function (a, b) { return a.y - b.y; })[0];
        if (closest) return {x : g.x, y : g.y, w : g.w, h : Math.min(g.h, closest.y - g.y)};
        else return g;
      }

      if (g.d.right)
      {
        var region = { x : g.x, y : g.y, w : Infinity, h : g.h };
        var os = Util.notNull(obstacles.map(function (o) { return Geom.intersect(o(g), region); }));
        closest = os.sort(function (a, b) { return a.y - b.y; })[0];
        if (closest) return {x : g.x, y : g.y, w : Math.min(g.w, closest.x - g.x), h : g.h};
        else return g;
      }

      return g;
    };
  };






