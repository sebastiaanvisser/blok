function start ()
{
  window.vp = new Viewport("body", "#content > *", "#main");
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

  $(".widget").each
    ( function (_, el)
      {
        var a = new Adjust(el, el, mode);

        with (Dsl)
        {
          var drag =
            orOrigin
              ( dragSolver
                ( function () { return [Geom.parentEl(el)]; }
                , function () { return Dsl.selector("h1, h2, p, .widget", el.parentNode, [el]); }
                )
              );

          var resize =
            compose
              ( orOrigin
                ( resizeSolver
                  ( function () { return [Geom.parentEl(el)]; }
                  , function () { return Dsl.selector("h1, h2, p, .widget", el.parentNode, [el]); }
                  )
                )
              , bounded(24 * 8, 24 * 6)
              );

          a.onDragAlign     = margin(24, strech(1.0, drag));
          a.stopDragAlign   = margin(24, compose(grid(24, 24), drag));
          a.onResizeAlign   = margin(24, strech(1.0, resize));
          a.stopResizeAlign = margin(24, compose(grid(24, 24), resize));
        }
      }
    );
}

$(document).ready(start);

