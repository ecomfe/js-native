(function (root) {

    function returnRaw(source) {
        return source;
    }

    function checkArgs(args, declaration) {

    }


    function wrapDecodeFuncArgs(args) {
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] === 'function') {
                args[i] = wrapDecpdeFuncArg(args[i]);
            }
        }

        return args;
    }

    function wrapDecpdeFuncArg(fn) {
        return function (arg) {
            fn(JSON.parse(arg));
        };
    }

    function wrapArgFunc(args) {
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] === 'function') {
                args[i] = wrapFunc(args[i]);
            }
        }

        return args;
    }

    var funcId = 1;
    var FUNC_PREFIX = '__jsna_';

    function wrapFunc(fn) {
        var funcName = FUNC_PREFIX + (funcId++);

        root[funcName] = function (arg) {
            delete root[funcName];
            fn(arg);
        };

        return funcName;
    }


    function argEncode(args) {
        for (var i = 0; i < args.length; i++) {
            args[i] = JSON.stringify(args[i]);
        }

        return args;
    }

    function argCombine(args, declaration) {
        var result = {};

        for (var i = 0; i < declaration.length; i++) {
            var arg = args[i];
            if (arg != null) {
                result[declaration[i].name] = arg;
            }
        }

        return result;
    }



    var Processors = {
        ArgCheck: function (description, option) {
            return function (args) {
                checkArgs(args, description.args);
                return args;
            };
        },

        ArgFuncArgDecode: function (description, option) {
            return option === 'JSON'
                ? wrapDecodeFuncArgs
                : returnRaw;
        },
        
        ArgFuncEncode: function (description, option) {
            return wrapArgFunc;
        },
        
        ArgEncode: function (description, option) {
            return option === 'JSON'
                ? argEncode
                : returnRaw;
        },
        
        ArgAdd: function (description, option) {
            var argLen = description.args.length;

            description.args.push({
                name: '_' + option,
                type: '*'
            });

            var value = description[option];
            return function (args) {
                args[argLen] = value;
            };
        },
        
        ArgCombine: function (description, option) {
            switch (option) {
                case 'URL':
                    var prefix = description.schema + '/' + description.authority + description.path + '?';
                    return function (args) {
                        var result = [];

                        for (var i = 0; i < declaration.length; i++) {
                            var arg = args[i];
                            if (arg != null) {
                                result.push(declaration[i].name + '=' + arg);
                            }
                        }

                        return result.join('&');
                    };

                case 'Object':
                    return function (args) {
                        return argCombine(args, description.args);
                    };

                case 'JSONString':
                    return function (args) {
                        return JSON.stringify(argCombine(args, description.args));
                    };
            }

            return returnRaw;
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