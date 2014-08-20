(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        //commonjs
        module.exports = factory(require('../src/boot'),require('../src/platform'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../src/boot','../src/platform'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function (global,scope) {

    return scope;
}));
