# Utilties.

top = this
evaluate = if top.window then eval else print
concat = (a) -> [].concat a...

# Top level loader structures.

top.js = js =
  current:    undefined
  modules:    {}
  errors:     []
  importers:  "Import Qualified Register Stage".split ' '
  collectors: "Class Static Private".split ' '

js.keywords = concat [js.importers, js.collectors]

# Install the module initializer nollector in the global namespace.

top.Module = (q, rest...) ->

  # Build module.
  js.modules[q] =
    js.current =
      qname:   q
      name:    q.match(/[^.]*$/)[0]
      params:  rest
      methods: {}

  # Build initial collector buckets.
  js.current[c] = [] for c in js.keywords

# Only here to allow wrigin: Qualified "X", As "Y".

top.As = (a) -> a

# Install all other keywords in the global namespace.

js.keywords.map (c) ->
  top[c] = (args...) -> js.current[c].push args
  top[c].annotation = c

# -----------------------------------------------------------------------------

js.compile = ->
  js.prepare()
  js.codegen()

js.prepare = ->

  flatten = (mod, def, bucket) ->
    as = {}; as[def] = true
    for m in concat bucket
      switch m.constructor
        when Function then as[m.annotation] = true
        when Object
          for n, f of m
            mod.methods[n] = f
            f.annotations = as
            as = {}; as[def] = true

  for _, mod of js.modules
    flatten mod, c, mod[c] for c in js.collectors

js.codegen = ->
  genGlobalName = (q) -> "__" + if q.match /^[^.]*$/ then q else q.replace /\./g, "_"

  for qname, mod of js.modules

    nameFromQName = (q) -> (q.match /[^.]*$/)[0]
    name = nameFromQName qname

    assertModuleExists = (qname) ->
      throw "Module #{mod.qname} imports unknown mod #{qname}" unless js.modules[qname]

    qualifiedImport = (dep) ->
      assertModuleExists dep[0]
      local  = nameFromQName (dep[1] || dep[0])
      global = "top." + genGlobalName dep[0]
      cached = global + "__cached"
      "  var #{local} = #{cached} = #{cached} || #{global}()"

    staticImport = (imp) ->
      assertModuleExists imp[0]
      m = js.modules[imp[0]]
      eligible = (f) -> f.annotations.Static and not f.annotations.Private
      ("  var #{n} = #{m.name}.#{n}" for n, f of m.methods when eligible f).join "\n"

    # mkAccessor   = (f, n) -> "  #{name}.prototype.__define#{f.Get ? "Getter" : "Setter"}__(\"#{n}\", \n    #{f}\n  )"
    rename       = (f, n) -> f.toString().replace /function\s*/, "function " + name + '_' + n + ' '
    mkMethod     = (f, n) -> "  #{name}.prototype.#{n} = \n  #{rename f, n}" + (if f.annotations.Stage then "(this)" else "")
    mkStatic     = (f, n) -> "  var #{n} = #{name}.#{n} =\n  #{rename f, n}" + (if f.annotations.Stage then "(this)" else "")
    moduleHeader = genGlobalName mod.qname + " = function ()\n{"
    qualifieds   = (qualifiedImport q for q in concat [mod.Qualified, mod.Import]).join "\n"
    imports      = (staticImport i for i in mod.Import ).join "\n"
    constructor  = "  var #{name} = " + if mod.methods[name] then "\n  " + rename mod.methods[name], "Constructor" else "{}"
    register     = ("  #{o}.register(#{name});" for o in mod.Register).join "\n"
    methods      = (mkMethod f, n for n, f of mod.methods when not f.annotations.Static and n != name).join "\n\n"
    statics      = (mkStatic f, n for n, f of mod.methods when f.annotations.Static).join "\n\n"
    initializer  = "  if (#{name}.init) #{name}.init.apply(this, arguments)"
    moduleFooter = "  return #{name}\n}\n"

    evaluate [ moduleHeader
               qualifieds
               imports
               constructor
               register
               methods
               statics
               initializer
               moduleFooter
             ].join "\n\n"

