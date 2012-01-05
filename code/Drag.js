Function.prototype.scope =
  function scope (scope)
  {
    var me = this;
    return function scoped () { return me.apply(scope, arguments); };
  };

function Drag (target, pivot)
{
  this.target        = target;
  this.pivot         = pivot || target;

  // State, private.
  this.dragging      = false;
  this.dragOrigin    = {};
  this.targetOrigin  = {};
  this.geom          = {};

  this.dragAlign     = function (g) { return g; }
  this.stopAlign     = function (g) { return g; }

  this.requireMeta   = false;

  $(this.pivot).mousedown(this.startDragging.scope(this));
  $(document.body).mouseup(this.stopDragging.scope(this));
  $(document.body).mousemove(this.drag.scope(this));

  // $(document.body).keydown(this.keydown.scope(this));
  // $(document.body).keyup(this.keyup.scope(this));
}

/*
Drag.prototype.keydown =
  function keydown (e)
  {
    if (this.requireMeta && !e.metaKey) return;
    this.metaKey = true;
    $(this.target).addClass("dragable");
    $("body").addClass("dragging");
  };

Drag.prototype.keyup =
  function keyup (e)
  {
    this.metaKey = false;
    $(this.target).removeClass("dragable");
    $("body").removeClass("dragging");
  }
*/

Drag.prototype.startDragging =
  function startDragging (e)
  {
    if (this.requireMeta && !this.metaKey) return;

    this.dragging = true;
    $(this.target).addClass("dragging");
    this.target.style["-webkit-transition-property"] = "none";

    this.dragOrigin   = { x : e.clientX,              y : e.clientY };
    this.targetOrigin = { x : this.target.offsetLeft, y : this.target.offsetTop };

    return this.drag(e);
  };

Drag.prototype.stopDragging =
  function stopDragging ()
  {
    if (!this.dragging) return;

    this.dragging = false;
    $(this.target).removeClass("dragging");
    this.target.style["-webkit-transition-property"] = "left, top, width, height, opacity";

    this.geom = this.stopAlign(this.geom);
    this.positionTarget();
  };

Drag.prototype.drag =
  function drag (e)
  {
    if (!this.dragging) return true;

    var t  = this.target,
        dx = e.clientX - this.dragOrigin.x,
        dy = e.clientY - this.dragOrigin.y;

    this.geom =
      { x : this.targetOrigin.x + dx
      , y : this.targetOrigin.y + dy
      , w : t.offsetWidth
      , h : t.offsetHeight
      };

    this.geom = this.dragAlign(this.geom);
    this.positionTarget();

    return false;
  };

Drag.prototype.positionTarget =
  function positionTarget ()
  {
    this.target.style.left = this.geom.x + "px";
    this.target.style.top  = this.geom.y + "px";
  };

// ----------------------------------------------------------------------------

Drag.concat =
  function concat (xs)
  {
    return [].concat.apply([], xs);
  };

Drag.notNull =
  function notNull (xs)
  {
    return xs.filter(function (n) { return !!n; })
  };

Drag.intersect =
  function intersect (a, b)
  {
    var x = Math.max(a.x,       b.x)
    var y = Math.max(a.y,       b.y)
    var w = Math.min(a.x + a.w, b.x + b.w) - x
    var h = Math.min(a.y + a.h, b.y + b.h) - y

    return (w <= 0 || h <= 0) ? null : {x: x, y: y, w: w, h: h}
  };

Drag.contained =
  function contained (a, b)
  {
    return a.x >= b.x && a.x + a.w <= b.x + b.w
        && a.y >= b.y && a.y + a.h <= b.y + b.h
  };

Drag.distance =
  function (a, b)
  {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  };

Drag.grid =
  function grid (w, h)
  {
    return function grid (g)
    {
      return { x : Math.round(g.x / w) * w 
             , y : Math.round(g.y / h) * h
             , w : g.w
             , h : g.h
             };
    };
  };

Drag.within =
  function within (f)
  {
    return function within (g)
    {
      var x = Math.min(Math.max(f.x, g.x), f.x + f.w - g.w);
      var y = Math.min(Math.max(f.y, g.y), f.y + f.h - g.h);
      var r  = {x : x, y : y, w : g.w, h : g.h};
      return Drag.contained(r, f) ? [r] : [];
    };
  };

Drag.outside =
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

Drag.element =
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

Drag.sortByDistance =
  function sortByDistance (g, xs)
  {
    return xs.sort(
      function (a, b)
      {
        a.distance = Drag.distance(a, g);
        b.distance = Drag.distance(b, g);
        return a.distance - b.distance;
      });
  };

Drag.debugElem =
  function debugElemElem (v)
  {
    return function (g)
    {
      var e = $("<div class='debug " + v + "'></div>");
      $("body").append(e);
      $(e).css("left",   g.x + "px");
      $(e).css("top",    g.y + "px");
      $(e).css("width",  g.w + "px");
      $(e).css("height", g.h + "px");
    };
  };

Drag.serialize =
  function serialize (g)
  {
    return [g.x, g.y, g.w, g.h].join(",");
  };

Drag.solve1 =
  function solve1 (container, g, obstacles)
  {
    function alternatives (v)
    {
      return obstacles.map(function (o) { return Drag.outside(o)(v); }).filter(function (n) { return n.length; })
    }

    var done = {};

    var options = { good : [], maybe : Drag.within(container)(g) }

    for (var i = 0; options.maybe.length && i < obstacles.length + 1; i++)
    {
      var bounds = options.maybe;
      var blocking = bounds.map(
                       function (b)
                       {
                         var as = Drag.concat(alternatives(b)).filter(function (o) { return Drag.contained(o, container); });
                         return as.length
                           ? { good : [ ], maybe : as.filter(function (o) { return !done[Drag.serialize(o)]; }) }
                           : { good : [b], maybe : [] };
                       });

      options = { good  : options.good.concat(Drag.concat(blocking.map(function (b) { return b.good;  })))
                , maybe : Drag.concat(blocking.map(function (b) { return b.maybe; }))
                };

      if (Drag.debug)
      {
        options.good.forEach(Drag.debugElem("good"));
        options.maybe.forEach(Drag.debugElem("maybe"));
      }

      options.good.map(function (o) { done[Drag.serialize(o)] = true; });
      options.maybe.map(function (o) { done[Drag.serialize(o)] = true; });
    }

    return Drag.sortByDistance(g, options.good).slice(0, 1);
  };

Drag.solver =
  function solver (containers, obstacles)
  {
    return function (g)
    {
      if (Drag.debug)
      {
        $(".good").remove();
        $(".maybe").remove();
      }
      var options = containers.map
        (function (cont)
         {
           var c  = cont();
           var os = Drag.notNull(obstacles.map(function (o) { return Drag.intersect(o(), c); }));
           return Drag.solve1(c, g, os);
         });

      return Drag.sortByDistance(g, Drag.concat(options))[0];
    };

  };
  
Drag.compose = function compose (a, b) { return function compose (g) { return a(b(g)); }; };

Drag.strech =
  function strech (n, a)
  {
    return function strech (g)
    {
      var ag = a(g);
      var d  = Drag.distance(g, ag);

      var dx = ag.x - g.x;
      var dy = ag.y - g.y;

      ag.x = dx ? ag.x - (Math.abs(dx) / dx) * Math.pow(Math.abs(dx), 1 / (1 + n)) : g.x;
      ag.y = dy ? ag.y - (Math.abs(dy) / dy) * Math.pow(Math.abs(dy), 1 / (1 + n)) : g.y;

      return ag;
    };
  };

