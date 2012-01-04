Function.prototype.scope =
  function scope (scope)
  {
    var me = this;
    return function scoped () { return me.apply(scope, arguments); };
  };

window.concat =
  function concat (xs)
  {
    return [].concat.apply([], xs);
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

Drag.intersect =
  function intersect (a, b)
  {
    var x = Math.max(a.x,       b.x)
    var y = Math.max(a.y,       b.y)
    var w = Math.min(a.x + a.w, b.x + b.w) - x
    var h = Math.min(a.y + a.h, b.y + b.h) - y

    return (w <= 0 || h <= 0) ? null : {x: x, y: y, w: w, h: h}
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
      var xa = Math.min(Math.max(f.x, g.x), f.x + f.w - g.w);
      var xb = Math.max(f.x, Math.min(g.x, f.x + f.w - g.w));
      var ya = Math.min(Math.max(f.y, g.y), f.y + f.h - g.h);
      var yb = Math.max(f.y, Math.min(g.y, f.y + f.h - g.h));
      return { x : (xa + xb) / 2
             , y : (ya + yb) / 2
             , w : g.w
             , h : g.h
             };
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

      if (ins)
        return [ { x : f.x - g.w , y : g.y , w : g.w , h : g.h }
               , { x : f.x + f.w , y : g.y , w : g.w , h : g.h }
               , { x : g.x , y : f.y - g.h , w : g.w , h : g.h }
               , { x : g.x , y : f.y + f.h , w : g.w , h : g.h }
               ];
        else return [];
    };
  };

Drag.withinElem =
  function withinElem (elem)
  {
    return function (g)
    {
      return Drag.within
        ({ x : elem.offsetLeft
         , y : elem.offsetTop
         , w : elem.offsetWidth
         , h : elem.offsetHeight
         })(g);
    };
  };

Drag.outsideElem =
  function outsideElem (elem)
  {
    return function (g)
    {
      return Drag.outside
        ({ x : elem.offsetLeft
         , y : elem.offsetTop
         , w : elem.offsetWidth
         , h : elem.offsetHeight
         })(g);
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

Drag.solver =
  function solver (disjs, conjs)
  {
    function alternatives (v)
    {
      return conjs.map(function (conj) { return conj(v); }).filter(function (n) { return n.length; })
    }

    function best (d, g)
    {
      var v = d(g);
      var alts = alternatives(v);

      var ok = !alts.length;
      if (ok) return [v];

      alts = concat(alts).map(d).filter(function (n) { return !alternatives(n).length; });
      return Drag.sortByDistance(g, alts)[0];
    }

    return function (g)
    {
      var oks = disjs.map(function (d) { return best(d, g); });

      return Drag.sortByDistance(g, concat(oks))[0];
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

