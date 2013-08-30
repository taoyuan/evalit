var t = require('chai').assert;
var evalit = require('../');
var parse = require('esprima').parse;

it('resolved', function () {
    var src = '[1,2,3+4*10+n,foo(3+5),obj[""+"x"].y]';
    var fn = evalit(src);
    var res = fn({
        n: 6,
        foo: function (x) { return x * 100 },
        obj: { x: { y: 555 } }
    });
    t.deepEqual(res, [ 1, 2, 49, 800, 555 ]);
});

it('unresolved', function () {
    var src = '[1,2,3+4*10*z+n,foo(3+5),obj[""+"x"].y]';
    var fn = evalit(src);
    var res = fn({
        n: 6,
        foo: function (x) { return x * 100 },
        obj: { x: { y: 555 } }
    });
    t.equal(res, undefined);
});

