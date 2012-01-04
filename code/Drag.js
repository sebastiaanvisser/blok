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
      }

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
    }
  }

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
    }
  }

Drag.outside =
  function outside (f)
  {
    return function outside (g)
    {
      var xa  = Math.min(Math.max(f.x, g.x), f.x + f.w - g.w);
      var xb  = Math.max(f.x, Math.min(g.x, f.x + f.w - g.w));
      var ya  = Math.min(Math.max(f.y, g.y), f.y + f.h - g.h);
      var yb  = Math.max(f.y, Math.min(g.y, f.y + f.h - g.h));
      var ins = g.x < f.x + f.w && g.x + g.w > f.x
             && g.y < f.y + f.h && g.y + g.h > f.y;

      var left  = g.x - (f.x - g.w);
      var right = (f.x + f.w) - g.x;
      var up    = g.y - (f.y - g.h);
      var down  = (f.y + f.h) - g.y;

      var doLeft  = ins &&                  left  <= right && left  <= up && left  <= down
      var doRight = ins && right <  left &&                   right <= up && right <= down
      var doUp    = ins && up    <  left && up    <  right &&                up    <= down
      var doDown  = ins && down  <  left && down  <  right && down  <  up

      return { x : doLeft ? g.x - left : (doRight ? g.x + right : g.x)
             , y : doUp   ? g.y - up   : (doDown  ? g.y + down  : g.y)
             , w : g.w
             , h : g.h
             };
    }
  }

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
    }
  }

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
    }
  }

Drag.and = function and (a, b) { return function and (g) { return a(b(g)); }; };

Drag.distance =
  function (a, b)
  {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

Drag.or =
  function or (a, b)
  {
    return function or (g)
    {
      var ag = a(g);
      var bg = b(g);
      var da = Drag.distance(g, ag);
      var db = Drag.distance(g, bg);
      return da > db ? bg : ag;
    };
  };

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

