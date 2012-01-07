Module "Main"

Class

  Main: ->
    #drag.debug = 1
    $(document).ready =>
      @position()
      @install   t for t in $(".target").get()
      @installOC t for t in $(".obstacle").get()
      @installOC t for t in $(".container").get()

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

    containers = (Constraint.element c for c in $(".container").get())
    obstacles  = (Constraint.element c for c in $(".obstacle").get())
    targets    = (Constraint.element c for c in $(".target").get() when c isnt t)

    both = Constraint.solver(containers, obstacles.concat targets)

    fd.onDragAlign   = Constraint.strech 0.7, both
    fd.stopDragAlign = Constraint.compose (Constraint.grid 24, 24), both

    # fd.onResizeAlign =
    fd.stopResizeAlign = Constraint.grid 24, 24

  installOC: (t) ->
    fd = new Drag t, t
    fd.stopDragAlign = fd.stopResizeAlign = Constraint.grid 24, 24

Static

  init: ->
    window.main = new Main

