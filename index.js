(function (root) {

    function APIContainer() {
        this.apis = [];
    }

    APIContainer.prototype.add = function (description) {
        return this;
    };

    APIContainer.prototype.fromNative = function (description) {
        return this;
    };

    APIContainer.prototype.map = function (mapAPI) {
        return this;
    };

    APIContainer.prototype.invoke = function (name, args) {
    };

    function jsNative() {
        return new APIContainer();
    }

    jsNative.invoke = function (description) {

    };

    this.jsNative = jsNative;

    // For AMD
    if (typeof define === 'function' && define.amd) {
        
        define('jsNative', [], jsNative);
    }

})(this);