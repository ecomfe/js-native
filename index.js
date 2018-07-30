(function (root) {

    var Processors = {
        ArgCheck: function (description, option) {

        },

        ArgFuncArgDecode: function (description, option) {

        },
        
        ArgFuncEncode: function (description, option) {

        },
        
        ArgEncode: function (description, option) {

        },
        
        ArgAdd: function (description, option) {

        },
        
        ArgCombine: function (description, option) {

        },
        
        CallMethod: function (description, option) {

        },
        
        CallPrompt: function (description, option) {

        },
        
        CallIframe: function (description, option) {

        },
        
        CallLocation: function (description, option) {

        },
        
        CallMessage: function (description, option) {

        },
        
        ReturnDecode: function (description, option) {

        }
    };



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