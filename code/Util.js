Function.prototype.scope =
  function scope (scope)
  {
    var me = this;
    return function scoped () { return me.apply(scope, arguments); };
  };

function Util () {}

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


