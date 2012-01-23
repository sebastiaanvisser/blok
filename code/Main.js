function start ()
{
  var mode = new Mode;

  $("h1, h2, p").each
    ( function (_, el)
      {
        var a = new Adjust(el, el, mode);

        with (Dsl)
        {
          var drag = orOrigin
            ( dragSolver
              ( function () { return [Geom.parentEl(el)]; }
              , function () { return []; }
              )
            );

          var resize = orOrigin
            ( resizeSolver
              ( function () { return [Geom.parentEl(el)]; }
              , function () { return []; }
              )
            );

          a.onDragAlign     = strech(1.0, drag);
          a.stopDragAlign   = compose(grid(24, 24), drag);
          a.onResizeAlign   = strech(1.0, resize);
          a.stopResizeAlign = compose(grid(24, 24), resize);
        }
      }
    );

  $(".target").each
    ( function (_, el)
      {
        var a = new Adjust(el, el, mode);

        with (Dsl)
        {
          var drag = orOrigin
            ( dragSolver
              ( function () { return [Geom.parentEl(el)]; }
              , function () { return Dsl.selector("h1, h2, p, .target", el.parentNode, [el]); }
              )
            );

          var resize = orOrigin
            ( resizeSolver
              ( function () { return [Geom.parentEl(el)]; }
              , function () { return Dsl.selector("h1, h2, p, .target", el.parentNode, [el]); }
              )
            );

          a.onDragAlign     = margin(24, strech(1.0, drag));
          a.stopDragAlign   = margin(24, compose(grid(24, 24), drag));
          a.onResizeAlign   = compose(bounded(24 * 6, 24 * 4), margin(24, strech(1.0, resize)));
          a.stopResizeAlign = compose(bounded(24 * 6, 24 * 4), margin(24, compose(grid(24, 24), resize)));
        }
      }
    );
}

$(document).ready(start);

