function Group ()
{
  this.containers = [];
  this.targets    = [];
  this.grid       = 10;
}

Group.prototype.addContainer =
  function addContainer (t)
  {
    var adj = new Adjust(t);
    this.containers.push(adj);
    return adj;
  };

Group.prototype.addTarget =
  function addTarget (t)
  {
    var adj = new Adjust(t, undefined, undefined, this.grid);
    this.targets.push(adj);
    return adj;
  };

Group.prototype.touch =
  function touch ()
  {
    var containers = this.containers.map (function (adj) { return adj.target[0]; });
    var targets    = this.targets.map    (function (adj) { return adj.target[0]; });

    var me = this;

    this.containers.forEach
      (function (t)
       {
         t.allowDragging = false;
         t.allowResizing = false;
       });

    this.targets.forEach
      (function (t)
       {
         var cf = function () { return Dsl.fromList(containers, null, []); };
         var of = function () { return Dsl.fromList(targets, null, [t.target[0]]); };

         var grid          = Dsl.grid(me.grid, me.grid);
         var bounds        = Dsl.bounded(4 * me.grid, 4 * me.grid);
         var dragger       = Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of)));
         var resize        = Dsl.compose(Dsl.orOrigin(Dsl.resize(cf, of)), bounds);

         t.onDragAlign     =
         t.stopDragAlign   = Dsl.compose(dragger, grid);
         t.onResizeAlign   =
         t.stopResizeAlign = Dsl.compose(resize,  grid);
       });

    this.targets.forEach
      ( function (t, i)
        {
          t.hooks =
            [ function (t)
              {
                Adjust.render($($("#bg > div")[i]), Geom.grow(t.geom, 5));
              }
            ];
        }
      );

    this.targets.forEach(function (x) { x.touch(); });
  };

