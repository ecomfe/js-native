(function (root) {

    function returnRaw(source) {
        return source;
    }

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
            return option === 'JSON'
                ? JSON.parse
                : returnRaw;
        }
    };



    function APIContainer() {
        this.apis = [];
        this.apiIndex = {};
    }

    APIContainer.prototype.add = function (description) {
        if (description instanceof Array) {
            for (var i = 0; i < description.length; i++) {
                this.add(description[i]);
            }
        }
        else if (typeof description === 'object') {
            var name = description.name;

            if (this.apiIndex[name]) {
                throw new Error('[jsNative] API exists: ' + name);
            }

            this.apis.push(description);
            this.apiIndex[name] = description;
        }

        return this;
    };

    APIContainer.prototype.fromNative = function (description) {
        return this.add(jsNative.invoke(description));
    };

    APIContainer.prototype.map = function (mapAPI) {
        return this;
    };

    APIContainer.prototype.invoke = function (name, args) {
        return jsNative.invoke(this.apiIndex[name], args);
    };

    function jsNative() {
        return new APIContainer();
    }

    jsNative.invoke = function (description, args) {

    };

    this.jsNative = jsNative;

    // For AMD
    if (typeof define === 'function' && define.amd) {
        
        define('jsNative', [], jsNative);
    }

})(this);