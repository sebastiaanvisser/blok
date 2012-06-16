function Group ()
{
  this.containers = [];
  this.targets    = [];
}

Group.prototype.addContainer =
  function addContainer (t)
  {
    var block = new Block(t);
    this.containers.push(block);
    return block;
  };

Group.prototype.addTarget =
  function addTarget (t)
  {
    var block = new Block(t, undefined, undefined, 1);
    new Drag(block);
    new Resize(block);
    block.initialGeometry(1);
    this.targets.push(block);
    return block;
  };

Group.prototype.touch =
  function touch ()
  {
    var containers = this.containers.map (function (block) { return block.target[0]; });
    var targets    = this.targets.map    (function (block) { return block.target[0]; });

    this.targets.forEach
      (function (t)
       {
         var cf = function () { return Dsl.fromList(containers, null, []); };
         var of = function () { return Dsl.fromList(targets, null, [t.target[0]]); };

         var dragger       = Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of)));
         var resize        = Dsl.compose(Dsl.orOrigin(Dsl.resize( cf, of)), Dsl.bounded(12 * 4, 12 * 4));

         t.drag.onDrag     =
         t.drag.onStop     = Dsl.margin(dragger, 0);
         t.resize.onResize = 
         t.resize.onStop   = Dsl.margin(resize, 0);
       });

    this.targets.forEach
      ( function (t, i)
        {
          t.onRender =
            [ function (t)
              {
                Block.render($($("#bg > div")[i]), Geom.grow(t.geom, 10));
              }
            ];
        }
      );

    this.targets.forEach(function (x) { x.drag.touch(); });
  };

