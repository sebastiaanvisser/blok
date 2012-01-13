function Group ()
{
  this.draggers =
    { containers : []
    , obstacles  : []
    , targets    : []
    }

  this.elems =
    { containers : []
    , obstacles  : []
    , targets    : []
    }
}

Group.prototype.addContainer =
  function addContainer (t)
  {
    var d = new Drag(t, t);
    this.draggers.containers.push(d);
    this.elems.containers.push(t);
    this.rebuildSolvers();
  };

Group.prototype.addObstacle =
  function addObstacle (t)
  {
    var d = new Drag(t, t);
    this.draggers.obstacles.push(d);
    this.elems.obstacles.push(t);
    this.rebuildSolvers();
  };

Group.prototype.addTarget =
  function addTarget (t)
  {
    var d = new Drag(t, t);
    this.draggers.targets.push(d);
    this.elems.targets.push(t);
    this.rebuildSolvers();
  };

Group.prototype.serialize =
  function serialize ()
  {
    return Util.concat
      ([ this.draggers.containers.map (function (t) { return 'c'+t.geom.x+","+t.geom.y+","+t.geom.r+","+t.geom.b; })
       , this.draggers.obstacles.map  (function (t) { return 'o'+t.geom.x+","+t.geom.y+","+t.geom.r+","+t.geom.b; })
       , this.draggers.targets.map    (function (t) { return 't'+t.geom.x+","+t.geom.y+","+t.geom.r+","+t.geom.b; })
       ]).join(";");
  };

Group.prototype.rebuildSolvers =
  function rebuildSolvers ()
  {
    var grid   = Constraint.grid(24, 24);
    var strech = function (s) { return Constraint.strech(0.8, s); };
    var resize = strech(Constraint.bounded(24 * 4, 24 * 4));

    this.draggers.containers.forEach
      (function (t)
       {
         t.stopDragAlign   = grid;
         t.stopResizeAlign = grid;
         t.onResizeAlign   = resize;
         t.stopResizeAlign = Constraint.compose(grid, resize);
       });

    this.draggers.obstacles.forEach
      (function (t)
       {
         t.stopDragAlign   = grid;
         t.stopResizeAlign = grid;
         t.onResizeAlign   = resize;
         t.stopResizeAlign = Constraint.compose(grid, resize);
       });

    var elems = this.elems;
    this.draggers.targets.forEach
      (function (t)
       {
         var others = elems.targets.filter(function (u) { return u !== t.target[0]; });

         var dragSolver =
           Constraint.orOrigin
             (Constraint.dragSolver
               ( elems.containers
               , elems.obstacles.concat(others)
               ));

         var resizeSolver =
           Constraint.orOrigin
             (Constraint.resizeSolver
               ( elems.containers
               , elems.obstacles.concat(others)
               ));

         var bound           = Constraint.bounded(24, 24);
         var resize          = Constraint.compose(resizeSolver, bound);
         var onDragAlign     = strech(dragSolver);
         var stopDragAlign   = Constraint.compose(grid, dragSolver);
         var onResizeAlign   = strech(resize);
         var stopResizeAlign = Constraint.compose(grid, resize);

         t.onDragAlign     = onDragAlign;
         t.stopDragAlign   = stopDragAlign;
         t.onResizeAlign   = onResizeAlign;
         t.stopResizeAlign = stopResizeAlign;
       });
  };

