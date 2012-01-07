Module "Main"

Class

  Main: ->
    Drag.debug = 1
    $(document).ready =>
      @position()
      @install t for t in $(".target").get()
      @installO t for t in $(".obstacle").get()

  position: ->
    for c in $(".container, .obstacle, .target")
      geom = $(c).attr("data-geom").split(/\s+/).filter((n) -> !n.match(/^\s*$/)).map (n) -> n * 24 + "px"
      $(c)
        .css("left",   geom[0])
        .css("top",    geom[1])
        .css("width",  geom[2])
        .css("height", geom[3])

  install: (t) ->

    fd = new Drag t, t

    containers = (Drag.element c for c in $(".container").get())
    obstacles  = (Drag.element c for c in $(".obstacle").get())
    targets    = (Drag.element c for c in $(".target").get() when c isnt t)

    both = Drag.solver(containers, obstacles.concat targets)

    fd.dragAlign = Drag.strech 0.7, both
    fd.stopAlign = Drag.compose(Drag.grid(24, 24), both)

  installO: (t) ->
    fd = new Drag t, t
    fd.stopAlign = Drag.grid(24, 24)

Static

  init: ->
    window.main = new Main

