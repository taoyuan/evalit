"use strict";

module.exports = function (source) {
    var vst = typeof source === 'string' ? require('esprima').parse(source).body[0].expression : source;
    return function (vars) {
        return evaluate(vst, vars);
    }
};

var calcs = {
    '+': function (a, b) { return a + b; },
    '-': function (a, b) { return a - b; },
    '*': function (a, b) { return a * b; },
    '/': function (a, b) { return a / b; },
    '%': function (a, b) { return a % b; },
    '<': function (a, b) { return a < b; },
    '<=': function (a, b) { return a <= b; },
    '>': function (a, b) { return a >= b; },
    '|': function (a, b) { return a | b; },
    '&': function (a, b) { return a & b; },
    '^': function (a, b) { return a ^ b; },
    '||': function (a, b) { return a || b; },
    '&&': function (a, b) { return a && b; },
    '==': function (a, b) { return a == b; },
    '!=': function (a, b) { return a != b; }
};

function calc(op, l, r, fail) {
    return op in calcs ? calcs[op](l, r) : fail;
}

function evaluate(ast, vars) {
    if (!vars) vars = {};
    var FAIL = {};

    var result = (function walk (node) {
        var handlers = {
            "Literal": function (node) {
                return node.value;
            },

            "ArrayExpression": function (node) {
                var xs = [];
                for (var i = 0, l = node.elements.length; i < l; i++) {
                    var x = walk(node.elements[i]);
                    if (x === FAIL) return FAIL;
                    xs.push(x);
                }
                return xs;
            },

            "ObjectExpression": function (node) {
                var obj = {};
                for (var i = 0; i < node.properties.length; i++) {
                    var prop = node.properties[i];
                    var value = prop.value === null
                            ? prop.value
                            : this.event(prop.value)
                        ;
                    if (value === FAIL) return FAIL;
                    obj[prop.key.value] = value;
                }
                return obj;
            },

            "BinaryExpression": function (node) {
                var l = walk(node.left);
                if (l === FAIL) return FAIL;
                var r = walk(node.right);
                if (r === FAIL) return FAIL;

                return calc(node.operator, l, r, FAIL);
            },

            "Identifier": function (node) {
                if ({}.hasOwnProperty.call(vars, node.name)) {
                    return vars[node.name];
                }
                else return FAIL;
            },

            "CallExpression": function (node) {
                if ({}.hasOwnProperty.call(vars, node.callee.name)) {
                    var args = [];
                    for (var i = 0, l = node['arguments'].length; i < l; i++) {
                        var x = walk(node['arguments'][i]);
                        if (x === FAIL) return FAIL;
                        args.push(x);
                    }
                    return vars[node.callee.name].apply(null, args);
                }
                else return FAIL;
            },

            "MemberExpression": function (node) {
                var obj = walk(node.object);
                if (obj === FAIL) return FAIL;
                if (node.property.type === 'Identifier') {
                    return obj[node.property.name];
                }
                var prop = walk(node.property);
                if (prop === FAIL) return FAIL;
                return obj[prop];
            }
        };

        return node.type in handlers ? handlers[node.type](node) : FAIL;
    })(ast);

    return result === FAIL ? undefined : result;
}


