function start ()
{
  window.vp = new Viewport("body", ".widget, #content > *", "#main");
  var mode = new Mode();

  var content = $("#content")[0];

  $(".widget").each
    ( function (_, el)
      {
        var block = new Block(el);
        new Drag(block);
        block.initialGeometry(24);

        with (Dsl)
        {
          block.drag.onDrag =
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

          block.drag.onStop =
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

