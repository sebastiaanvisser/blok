function Group ()
{
  this.containers = [];
  this.targets    = [];
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
    var adj = new Adjust(t, undefined, undefined, 1);
    this.targets.push(adj);
    return adj;
  };

Group.prototype.touch =
  function touch ()
  {
    var containers = this.containers.map (function (adj) { return adj.target[0]; });
    var targets    = this.targets.map    (function (adj) { return adj.target[0]; });

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

         var dragger       = Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of)));
         var resize        = Dsl.compose(Dsl.orOrigin(Dsl.resize( cf, of)), Dsl.bounded(12 * 4, 12 * 4));

         t.onDragAlign     =
         t.stopDragAlign   = Dsl.margin(dragger, 0);
         t.onResizeAlign   = 
         t.stopResizeAlign = Dsl.margin(resize, 0);
       });

    this.targets.forEach
      ( function (t, i)
        {
          t.hooks =
            [ function (t)
              {
                Adjust.render($($("#bg > div")[i]), Geom.grow(t.geom, 10));
              }
            ];
        }
      );

    this.targets.forEach(function (x) { x.touch(); });
  };

