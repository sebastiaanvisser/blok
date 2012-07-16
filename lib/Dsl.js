function Dsl () {}

Dsl.bestOf =
  function bestOf (f)
  {
    return function (g, o) { return Geom.sortByDistance(g, f(g, o))[0]; };
  };

Dsl.properlyOverlap =
  function properlyOverlap (a)
  {
    return function (g, o)
    {
      var ag = a(g, o);
      if (!ag) return g;

      if (Geom.surface(ag) < Geom.surface(g))
      {
        var cy = (ag.y + ag.b) / 2;
        var cx = (ag.x + ag.r) / 2;
        return (g.y < cy && g.b > cy && g.x < cx && g.r > cx) ? ag : g;
      }
      else
      {
        var cy = (g.y + g.b) / 2;
        var cx = (g.x + g.r) / 2;
        return (ag.y < cy && ag.b > cy && ag.x < cx && ag.r > cx) ? ag : g;
      }
    };
  };

Dsl.grid =
  function grid (w, h, x, y)
  {
    h = h === undefined ? w : h;
    x = x === undefined ? 0 : x;
    y = y === undefined ? 0 : y;
    return function grid (g)
    {
      return { x : Math.round((g.x - x) / w) * w + x
             , y : Math.round((g.y - y) / h) * h + y
             , r : Math.round((g.r - x) / w) * w + x
             , b : Math.round((g.b - y) / h) * h + y
             , d : g.d
             };
    };
  };

Dsl.gridGap =
  function gridGap (w, h, x, y)
  {
    return function gridGap (g)
    {
      var a = Dsl.grid(w + x, h + y, x, y)(g);
      var b = Dsl.grid(w + x, h + y, 0, 0)(g);
      return { x : a.x
             , y : a.y
             , r : b.r
             , b : b.b
             , d : g.d
             };
    };
  };

Dsl.fromList =
  function fromList (list, butNot)
  {
    return list.filter(function (n) { return butNot.indexOf(n) == -1; })
                .map(function (n)
                     {
                       var g = Geom.relativeEl(n);
                       g.elem = n;
                       return g;
                     });
  };

Dsl.selector =
  function selector (sel, butNot)
  {
    return Dsl.fromList($(sel).get(), butNot);
  };

Dsl.compose =
  function compose (a, b)
  {
    return function compose (g, o)
    {
      var bg = b(g, o);
      return bg ? a(bg, o) : null;
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
  function margin (a, l, t, r, b)
  {
    return function margin (g, o)
    {
      return Geom.shrink(a(Geom.grow(g, l, t, r, b), o), l, t, r, b);
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

      return { x : Math.round(dx ? ag.x - (Math.abs(dx) / dx) * Math.pow(Math.abs(dx), 1 / (1 + n)) : g.x)
             , y : Math.round(dy ? ag.y - (Math.abs(dy) / dy) * Math.pow(Math.abs(dy), 1 / (1 + n)) : g.y)
             , r : Math.round(dr ? ag.r - (Math.abs(dr) / dr) * Math.pow(Math.abs(dr), 1 / (1 + n)) : g.r)
             , b : Math.round(db ? ag.b - (Math.abs(db) / db) * Math.pow(Math.abs(db), 1 / (1 + n)) : g.b)
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

Dsl.dragover =
  function dragover (sel, butNot)
  {
    return function (g)
    {
      var ls = Dsl.selector(sel, butNot);
      ls.forEach(function (n) { $(n.elem).removeClass("dragover"); });
      ls = ls.filter(function (n) { return Geom.intersect(g, n); });
      ls.forEach(function (n) { $(n.elem).addClass("dragover"); });
      return ls;
    };
  };

Dsl.swap =
  function swap (el, n, a)
  {
    return function swap (g, o)
    {
      var x = a(g, o);
      if (x && x.elem && !x.elem.__swapping && x.elem.__block)
      {
        var b = x.elem.__block;

        // Rezize current item according to the swapped element.
        g = Util.copy(g);
        g.r = g.x + Geom.width(b.geom);
        g.b = g.y + Geom.height(b.geom);

        // Move element we are draaging over to our origin.
        var e = el.__block;
        e.drag.origin = Util.copy(b.geom);
        b.geom = o;
        b.render();

        // Prevent item from swapping back in the 'near future'.
        x.elem.__swapping = true;
        setTimeout(function () { x.elem.__swapping = false }, n);
      }
      return g;
    };
  };

