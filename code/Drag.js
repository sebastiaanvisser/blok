Function.prototype.scope =
  function scope (scope)
  {
    var me = this;
    return function scoped () { return me.apply(scope, arguments); };
  };

function Drag (target, pivot)
{
  this.target          = target;
  this.pivot           = pivot || target;

  this.origin          = {};
  this.geom            = {};

  this.allowDragging   = true;
  this.dragging        = false;
  this.dragOrigin      = {};

  this.allowResizing   = true;
  this.resizeMargin    = 10;
  this.resizeDir       = null;
  this.resizing        = false;
  this.resizeOrigin    = {};

  this.onDragAlign     = function (g) { return g; }
  this.stopDragAlign   = function (g) { return g; }
  this.onResizeAlign   = function (g) { return g; }
  this.stopResizeAlign = function (g) { return g; }

  $(this.pivot).mousedown    (this.mousedown.scope(this));
  $(this.pivot).mousemove    (this.hovering.scope(this));
  $(this.pivot).mouseout     (this.mouseout.scope(this));
  $(document.body).mouseup   (this.mouseup.scope(this));
  $(document.body).mousemove (this.mousemove.scope(this));
}

// ----------------------------------------------------------------------------

Drag.prototype.render =
  function render ()
  {
    this.target.style.left   = this.geom.x + "px";
    this.target.style.top    = this.geom.y + "px";
    this.target.style.width  = this.geom.w + "px";
    this.target.style.height = this.geom.h + "px";
  };

Drag.prototype.hovering =
  function hovering (e)
  {
    if (this.dragging || this.resizing) return;

    var resizeDir = this.inResizeBorder(e.clientX, e.clientY);
    this.resetResizeStyling();
    if (resizeDir.left  ) $(this.target).addClass("left");
    if (resizeDir.right ) $(this.target).addClass("right");
    if (resizeDir.top   ) $(this.target).addClass("top");
    if (resizeDir.bottom) $(this.target).addClass("bottom");
  };

Drag.prototype.mouseout =
  function mousedown (e)
  {
    if (!this.resizing) this.resetResizeStyling();
    return false;
  };

Drag.prototype.mousedown =
  function mousedown (e)
  {
    var r = this.inResizeBorder(e.clientX, e.clientY);
    var i = r.left || r.right || r.top || r.bottom;
    if ( i && this.allowResizing) this.startResizing(e.clientX, e.clientY, r);
    if (!i && this.allowDragging) this.startDragging(e.clientX, e.clientY);
    return false;
  };

Drag.prototype.mouseup =
  function mouseup (e)
  {
    if (this.dragging) this.stopDragging(e);
    if (this.resizing) this.stopResizing(e);
    return false;
  };

Drag.prototype.mousemove =
  function mousemove (e)
  {
    if (this.dragging) this.drag(e.clientX, e.clientY);
    if (this.resizing) this.resize(e.clientX, e.clientY);
    return false;
  };

// ----------------------------------------------------------------------------

Drag.prototype.turnOffTransitions =
  function turnOffTransitions ()
  {
    this.transitions = this.target.style["-webkit-transition-property"];
    this.target.style["-webkit-transition-property"] = "none";
  };

Drag.prototype.restoreTransitions =
  function restoreTransitions ()
  {
    this.target.style["-webkit-transition-property"] = this.transitions;
  };

// ----------------------------------------------------------------------------
// DRAGGING
// ----------------------------------------------------------------------------

Drag.prototype.startDragging =
  function startDragging (x, y)
  {
    $(this.target).parent().append(this.target);
    this.dragging = true;
    $(this.target).addClass("dragging");
    this.turnOffTransitions();

    this.dragOrigin = { x : x, y : y };
    this.origin =
      { x : this.target.offsetLeft
      , y : this.target.offsetTop
      , w : this.target.offsetWidth
      , h : this.target.offsetHeight
      };

    this.drag(x, y);
  };

Drag.prototype.stopDragging =
  function stopDragging ()
  {
    this.dragging = false;
    $(this.target).removeClass("dragging");
    this.restoreTransitions();

    this.geom = this.stopDragAlign(this.geom);
    this.render();
  };

Drag.prototype.drag =
  function drag (x, y)
  {
    var t  = this.target,
        dx = x - this.dragOrigin.x,
        dy = y - this.dragOrigin.y;

    this.geom =
      { x : this.origin.x + dx
      , y : this.origin.y + dy
      , w : this.origin.w
      , h : this.origin.h
      };

    this.geom = this.onDragAlign(this.geom);

    this.render();
  };

// ----------------------------------------------------------------------------
// RESIZING
// ----------------------------------------------------------------------------

Drag.prototype.inResizeBorder =
  function inResizeBorder (x, y)
  {
    var m = this.resizeMargin;
    var t = this.target;
    return { left   : -t.offsetLeft                 + x <= m
           , right  :  t.offsetLeft + t.offsetWidth - x <= m
           , top    : -t.offsetTop                  + y <= m
           , bottom :  t.offsetTop + t.offsetHeight - y <= m
           };
  };

Drag.prototype.resetResizeStyling =
  function resetResizeStyling ()
  {
    $(this.target).removeClass("top");
    $(this.target).removeClass("bottom");
    $(this.target).removeClass("left");
    $(this.target).removeClass("right");
  };

Drag.prototype.startResizing =
  function startResizing (x, y, r)
  {
    $(this.target).parent().append(this.target);
    this.resizing = true;
    $(this.target).addClass("resizing");
    this.turnOffTransitions();

    this.resizeDir = r;
    this.resizeOrigin = { x : x, y : y };
    this.origin       =
      { x : this.target.offsetLeft
      , y : this.target.offsetTop
      , w : this.target.offsetWidth
      , h : this.target.offsetHeight
      };

    this.resize(x, y);
  };

Drag.prototype.stopResizing =
  function stopResizing ()
  {
    this.resizing = false;
    $(this.target).removeClass("resizing");
    this.restoreTransitions();

    this.geom = this.stopResizeAlign(this.geom);
    this.render();
    this.resetResizeStyling();
  };

Drag.prototype.resize =
  function resize (x, y)
  {
    var r  = this.resizeDir;
    var t  = this.target;
    var dx = x - this.resizeOrigin.x;
    var dy = y - this.resizeOrigin.y;

    this.geom =
      { x : this.origin.x +                       (r.left ? Math.min(this.origin.w, dx) : 0)
      , y : this.origin.y +                       (r.top  ? Math.min(this.origin.h, dy) : 0)
      , w : Math.max(0, this.origin.w + (r.right  ? dx : 0) - (r.left ? dx : 0))
      , h : Math.max(0, this.origin.h + (r.bottom ? dy : 0) - (r.top  ? dy : 0))
      };

    this.geom = this.onResizeAlign(this.geom);
    this.render();
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
             , w : Math.round(g.w / w) * w
             , h : Math.round(g.h / h) * h
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
      $("#debug").append(e);
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
        $("#debug *").remove();
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

