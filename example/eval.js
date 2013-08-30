var evalit = require('evalit');

var src = process.argv.slice(2).join(' ');

console.log(evalit(src)());
