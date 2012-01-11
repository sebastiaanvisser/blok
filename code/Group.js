function Group ()
{
  this.containers = [];
  this.obstacles  = [];
  this.targets    = [];

  this.grid   = Constraint.grid(24, 24);
  this.bound  = Constraint.bounded(24, 24);
  this.strech = function (s) { return Constraint.strech(0.8, s); };
}

Group.prototype.addContainer =
  function addContainer (c)
  {
    var d = new Drag(c, c);
    d.stopDragAlign   = this.grid;
    d.stopResizeAlign = this.grid;
    this.containers.push(c);
  };

Group.prototype.addObstacle =
  function addObstacle (o)
  {
    var d = new Drag(o, o);
    d.stopDragAlign   = this.grid;
    d.stopResizeAlign = this.grid;
    this.obstacles.push(o);
  };

Group.prototype.addTarget =
  function addTarget (t)
  {
    var d = new Drag(t, t);
    var drag          = Constraint.dragSolver(this.containers, this.obstacles.concat(this.targets));
    var solveR        = Constraint.resizeSolver(this.containers, this.obstacles.concat(this.targets));
    var resize        = Constraint.compose(solveR, this.bound);
    d.onDragAlign     = this.strech(drag)
    d.stopDragAlign   = Constraint.compose(this.grid, drag)
    d.onResizeAlign   = this.strech(resize)
    d.stopResizeAlign = Constraint.compose(this.grid, resize)
    this.targets.push(t);
  };

