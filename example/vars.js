var evalit = require('../');

var src = '[1,2,3+4*10+n,foo(3+5),obj[""+"x"].y]';

console.log(evalit(src)({
    n: 6,
    foo: function (x) { return x * 100 },
    obj: { x: { y: 555 } }
}));
