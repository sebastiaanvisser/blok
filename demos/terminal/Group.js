function Group ()
{
  this.containers = [];
  this.targets    = [];
  this.grid       = 10;
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
    var block = new Block(t);
    new Drag(block);
    new Resize(block);
    new Select(block);
    this.targets.push(block);
    return block;
  };

Group.prototype.touch =
  function touch ()
  {
    var containers = this.containers.map (function (block) { return block.target[0]; });
    var targets    = this.targets.map    (function (block) { return block.target[0]; });

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
         var bounds        = Dsl.bounded(2 * me.grid, 2 * me.grid);
         var dragger       = Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of)));
         var resize        = Dsl.compose(Dsl.orOrigin(Dsl.resize(cf, of)), bounds);

         t.drag.onDrag     = 
         t.drag.onStop     = Dsl.compose(dragger, grid);
         t.resize.onResize =
         t.resize.onStop   = Dsl.compose(resize,  grid);
       });

    this.targets.forEach
      ( function (t, i)
        {
          t.onRender = [ function (t) { Block.render($($("#bg > div")[i]), Geom.grow(t.geom, 5)); } ];
        }
      );

    $(this.targets.map(function (t) { return t.target[0]; })).click
      ( function (ev)
        {
          if (!ev.metaKey) return;

          this.__block.resize.startResizing(ev.clientX, ev.clientY, { top: true });
          this.__block.resize.resize(ev.clientX, -Infinity);
          this.__block.resize.stopResizing();
          this.__block.resize.startResizing(ev.clientX, ev.clientY, { bottom: true });
          this.__block.resize.resize(ev.clientX, Infinity);
          this.__block.resize.stopResizing();
          this.__block.resize.startResizing(ev.clientX, ev.clientY, { left: true });
          this.__block.resize.resize(-Infinity, ev.clientY);
          this.__block.resize.stopResizing();
          this.__block.resize.startResizing(ev.clientX, ev.clientY, { right: true });
          this.__block.resize.resize(Infinity, ev.clientY);
          this.__block.resize.stopResizing();
        }
      );

    this.targets.forEach(function (x) { x.drag.touch(); });
  };

