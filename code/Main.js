function start ()
{
  window.vp = new Viewport("body", ".widget, #content > *", "#main");
  var mode = new Mode();

  var content = $("#content")[0];

  $(".widget").each
    ( function (_, el)
      {
        var a = new Adjust(el, el, mode);
        a.allowResizing = false;
        a.moveToTop = true;

        with (Dsl)
        {
          var r =
            compose
              ( orOrigin
                ( Dsl.resize
                  ( function () { return [Geom.parentEl(el)]; }
                  , function () { return Dsl.fromList(window.vp.middle, el.parentNode, [el]); }
                  )
                )
              , bounded(24 * 8, 24 * 2)
              );

          a.onDragAlign =
            compose
            ( swap(el, 200, properlyOverlap(bestOf(dragover(".widget", el.parentNode, [el]))))
            , strech(0.8,
                orOrigin
                  ( Dsl.bestOf
                    ( Dsl.drag
                      ( function () { return [Geom.parentEl(el)]; }
                      , function () { return []; }
                      )
                    )
                  ))
            )

          a.stopDragAlign =
            compose(grid(24, 24),
              orOrigin
                ( Dsl.bestOf
                  ( Dsl.drag
                    ( function () { return [Geom.parentEl(el)]; }
                    , function () { return Dsl.fromList(window.vp.middle, el.parentNode, [el]); }
                    )
                  )
                ));
        }
      }
    );

  vp.compute();
  mode.toggle();
}

$(document).ready(start);

