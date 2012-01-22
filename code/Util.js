Function.prototype.scope =
  function scope (scope)
  {
    var me = this;
    return function scoped () { return me.apply(scope, arguments); };
  };

function Util () {}

Util.id = function id (a) { return a; };

Util.copy =
  function copy (o)
  {
    var c = {};
    for (p in o) c[p] = o[p];
    return c;
  };

Util.set =
  function copy (k, v)
  {
    return function (o)
    {
      var c = Util.copy(o);
      c[k] = v;
      return c;
    };
  };

Util.concat =
  function concat (xs)
  {
    return [].concat.apply([], xs);
  };

Util.notNull =
  function notNull (xs)
  {
    return xs.filter(function (n) { return !!n; })
  };


