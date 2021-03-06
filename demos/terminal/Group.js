function Group ()
{
  this.containers  = [];
  this.targets     = [];
  this.grid        = 10;
}

Group.prototype.addContainer =
  function addContainer (t)
  {
    this.containers.push(new Block(t));
  };

Group.prototype.makeTarget =
  function makeTarget (bg, fg)
  {
    var b = $("<div>");
    var f = $("<div>");
    $("#bg").append(b);
    $("#fg").append(f);

    var t = new Block(f, Drag, Resize, Scale);
    var a = new Block(b, Resize, Scale);
    t.attachment = a;

    this.targets.push(t);
  };

Group.prototype.install =
  function install ()
  {
    var containers  = this.containers.map  (function (block) { return block.target[0];            });
    var targets     = this.targets.map     (function (block) { return block.target[0];            });
    var attachments = this.targets.map     (function (block) { return block.attachment.target[0]; });

    var me = this;

    this.targets.forEach
      (function (t)
       {
         var cf = function () { return Dsl.fromList(containers, []); };
         var of = function () { return Dsl.fromList(targets, [t.target[0]]); };

         t.drag.moveToTop =
         t.resize.moveToTop = true;

         var grid          = Dsl.grid(me.grid, me.grid);
         var bounds        = Dsl.bounded(2 * me.grid, 2 * me.grid);
         var drag          = Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of)));
         var resize        = Dsl.compose(Dsl.orOrigin(Dsl.resize(cf, of)), bounds);

         t.drag.onDrag     =
         t.drag.onStop     = Dsl.compose(drag, grid);
         t.resize.onResize =
         t.resize.onStop   = Dsl.compose(resize, grid);
       });

    this.targets.forEach
      (function (t)
       {
         t = t.attachment;
         t.resize.moveToTop = false;

         var cf = function () { return Dsl.fromList(containers, []); };
         var of = function () { return Dsl.fromList(attachments, [t.target[0]]); };

         var grid          = Dsl.grid(me.grid, me.grid, 5, 5);
         var bounds        = Dsl.bounded(2 * me.grid, 2 * me.grid);
         var drag          = Dsl.orOrigin(Dsl.bestOf(Dsl.drag(cf, of)));
         var resize        = Dsl.compose(Dsl.orOrigin(Dsl.resize(cf, of)), bounds);

         t.resize.onResize =
         t.resize.onStop   = Dsl.compose(Dsl.margin(resize, -10), grid);

       });

    this.targets.forEach
      ( function (t, i)
        {
          var a = t.attachment;

          t.onAdjust.push(function () { a.adjust(Geom.grow   (t.geom, 5)); });
          a.onAdjust.push(function () { t.adjust(Geom.shrink (a.geom, 5)); });

/*
          a.onAdjust.push
           ( function (g)
             {
               var ls = Dsl.selector("#bg > div", []); //[this.target[0]]);
               ls.forEach(function (n) { $(n.elem).removeClass("dragover"); });
               ls = ls.filter(function (n) { return Geom.intersect(g, n); });
               ls.forEach(function (n) { $(n.elem).addClass("dragover"); });
             }
           );

          a.resize.onStopE.push
           ( function (g)
             {
               var ls = Dsl.selector("#bg > div", []); //[this.target[0]]);
               ls.forEach(function (n) { $(n.elem).removeClass("dragover"); });
             }
           );
*/
        }
      );

    this.targets.forEach     (function (x) { x.drag.touch(); });
  };

