(function (root) {

    function jsNative() {

    }

    jsNative.invoke = function (description) {

    };

    this.jsNative = jsNative;

    // For AMD
    if (typeof define === 'function' && define.amd) {
        
        define('jsNative', [], jsNative);
    }

})(this);