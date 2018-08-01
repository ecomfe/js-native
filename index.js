(function (root) {

    /**
     * 返回原值的方法，调用过程的兜底处理函数
     *
     * @inner
     * @param {*} source
     * @return {*}
     */
    function returnRaw(source) {
        return source;
    }


    /**
     * 参数检查，错误直接抛出异常
     *
     * @inner
     * @param {Array} args 调用参数
     * @param {Array} declaration 参数声明列表
     * @return {Array}
     */
    function checkArgs(args, declaration) {

    }

    /**
     * 对调用参数中的所有回调函数，进行参数解码（反序列化）包装
     *
     * @inner
     * @param {Array} args 调用参数
     * @return {Array}
     */
    function wrapDecodeFuncArgs(args) {
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] === 'function') {
                args[i] = wrapDecpdeFuncArg(args[i]);
            }
        }

        return args;
    }

    /**
     * 对回调函数的参数进行解码（反序列化）包装
     *
     * @inner
     * @param {Function} fn 回调函数
     * @return {Function}
     */
    function wrapDecpdeFuncArg(fn) {
        return function (arg) {
            fn(JSON.parse(arg));
        };
    }

    /**
     * 对调用参数中的所有回调函数，进行序列化包装
     *
     * @inner
     * @param {Array} args 调用参数
     * @return {Array}
     */
    function wrapArgFunc(args) {
        for (var i = 0; i < args.length; i++) {
            if (typeof args[i] === 'function') {
                args[i] = wrapFunc(args[i]);
            }
        }

        return args;
    }

    /**
     * 用于回调函数包装命名的自增id
     *
     * @inner
     * @type {number}
     */
    var funcId = 1;

    /**
     * 用于回调函数包装命名的前缀
     *
     * @inner
     * @const
     * @type {string}
     */
    var FUNC_PREFIX = '__jsna_';

    /**
     * 对回调函数，进行序列化包装
     *
     * @inner
     * @param {Function} fn 回调函数
     * @return {string}
     */
    function wrapFunc(fn) {
        var funcName = FUNC_PREFIX + (funcId++);

        root[funcName] = function (arg) {
            delete root[funcName];
            fn(arg);
        };

        return funcName;
    }

    /**
     * 对调用参数中的所有参数进行JSON序列化
     *
     * @inner
     * @param {Array} args 调用参数
     * @return {Array}
     */
    function argJSONEncode(args) {
        for (var i = 0; i < args.length; i++) {
            args[i] = JSON.stringify(args[i]);
        }

        return args;
    }

    /**
     * 将调用参数合并成对象
     *
     * @inner
     * @param {Array} args 调用参数
     * @return {Object}
     */
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

    /**
     * 通过 prompt 对话框进行 Native 调用
     *
     * @inner
     * @param {string} source 要传递的数据字符串
     * @return {string}
     */
    function callPrompt(source) {
        return root.prompt(source);
    }

    /**
     * 通过 location.href 进行 Native 调用
     *
     * @inner
     * @param {string} url 要传递的url字符串
     */
    function callLocation(url) {
        root.location.href = url;
    }

    /**
     * 通过 iframe 进行 Native 调用
     *
     * @inner
     * @param {string} url 要传递的url字符串
     */
    function callIframe(url) {
        var iframe = document.createElement('iframe');
        iframe.src = url;
        document.body.appendChild(iframe);
        document.body.removeChild(iframe);
    }


    /**
     * processor 创建方法集合
     *
     * @inner
     * @type {Object}
     */
    var processorCreators = {
        /**
         * 创建参数检查处理函数
         *
         * @param {Object} description 调用描述对象
         * @return {Function}
         */
        ArgCheck: function (description) {
            return function (args) {
                checkArgs(args, description.args);
                return args;
            };
        },

        /**
         * 创建解码回调函数参数包装的处理函数
         *
         * @param {Object} description 调用描述对象
         * @param {string} option 处理参数
         * @return {Function}
         */
        ArgFuncArgDecode: function (description, option) {
            return option === 'JSON'
                ? wrapDecodeFuncArgs
                : returnRaw;
        },
        
        /**
         * 创建回调函数序列化的处理函数
         *
         * @return {Function}
         */
        ArgFuncEncode: function () {
            return wrapArgFunc;
        },
        
        /**
         * 创建参数序列化的处理函数
         *
         * @param {Object} description 调用描述对象
         * @param {string} option 处理参数
         * @return {Function}
         */
        ArgEncode: function (description, option) {
            return option === 'JSON'
                ? argJSONEncode
                : returnRaw;
        },
        
        /**
         * 创建从调用描述对象中添加额外参数的处理函数
         *
         * @param {Object} description 调用描述对象
         * @param {string} option 处理参数
         * @return {Function}
         */
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
        
        /**
         * 创建参数合并的处理函数
         *
         * @param {Object} description 调用描述对象
         * @param {string} option 处理参数
         * @return {Function}
         */
        ArgCombine: function (description, option) {
            switch (option) {
                case 'URL':
                    var prefix = description.schema + '/' + description.authority + description.path + '?';
                    return function (args) {
                        var result = [];

                        for (var i = 0; i < declaration.length; i++) {
                            var arg = args[i];
                            if (arg != null) {
                                result.push(declaration[i].name + '=' + encodeURIComponent(arg));
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
        
        /**
         * 创建方法调用的处理函数
         *
         * @param {Object} description 调用描述对象
         * @param {string} option 处理参数
         * @return {Function}
         */
        CallMethod: function (description, option) {
            var method;
            function findMethod() {
                if (!method) {
                    var segs = description.method.split('.');
                    method = root;
                    for (var i = 0; i < segs.length; i++) {
                        method = method[segs[i]];
                    }
                }

                return method;
            }

            if (description.args.length < 5) {
                return function (args) {
                    var fn = findMethod;
                    fn(args[0], args[1], args[2], args[3]);
                };
            }

            return function (args) {
                var fn = findMethod;
                fn.apply(root, args);
            };
        },
        
        /**
         * 创建 prompt 调用的处理函数
         *
         * @return {Function}
         */
        CallPrompt: function () {
            return callPrompt;
        },
        
        /**
         * 创建 iframe 调用的处理函数
         *
         * @return {Function}
         */
        CallIframe: function () {
            return callIframe;
        },
        
        /**
         * 创建 location 调用的处理函数
         *
         * @return {Function}
         */
        CallLocation: function () {
            return callLocation;
        },
        
        /**
         * 创建 postMessage 调用的处理函数
         *
         * @param {Object} description 调用描述对象
         * @return {Function}
         */
        CallMessage: function (description) {
            return function (args) {
                root.webkit.messageHandlers[description.handler].postMessage(args);
            };
        },
        
        /**
         * 创建对返回值进行解码的处理函数
         *
         * @param {Object} description 调用描述对象
         * @param {string} option 处理参数
         * @return {Function}
         */
        ReturnDecode: function (description, option) {
            return option === 'JSON'
                ? JSON.parse
                : returnRaw;
        }
    };

    


    function invokeDescription(description) {
        if (description) {
            var proccessors = getProccessors(description);
            for (var i = 0; i < proccessors.length; i++) {
                args = proccessors[i](args);
            }

            return args;
        }
    }

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
        return this.add(invokeDescription(description));
    };

    APIContainer.prototype.map = function (mapAPI) {
        mapAPI = mapAPI || function (name) {
            return name
        };

        var apiObject = {};


        for (var i = 0; i < this.apis.length; i++) {
            var api = this.apis[i];
            var apiName = mapAPIName(mapAPI, api.name);

            if (apiName) {
                apiObject[apiName] = buildAPIMethod(api);
            }
        }

        return apiObject;
    };

    APIContainer.prototype.invoke = function (name, args) {
        return invokeDescription(this.apiIndex[name]);
    };

    function mapAPIName(mapAPI, name) {
        if (typeof mapAPI === 'function') {
            return mapAPI(name);
        }

        return mapAPI[name];
    }

    function buildAPIMethod(description) {
        var proccessors = getProccessors(description);

        return function () {
            var args = Array.prototype.slice.call(arguments);
            for (var i = 0; i < proccessors.length; i++) {
                args = proccessors[i](args);
            }
        };
    }

    var INVOKE_SHORTCUT = {
        'method': [
            'ArgCheck',
            'CallMethod'
        ],

        'method.json': [
            'ArgCheck',
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgEncode:JSON',
            'CallMethod',
            'ReturnDecode:JSON'
        ],

        'prompt.json': [
            'ArgCheck',
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgAdd:name',
            'ArgCombine:JSONString',
            'CallPrompt',
            'ReturnDecode:JSON'
        ],


        'prompt.url': [
            'ArgCheck',
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgEncode:JSON',
            'ArgCombine:URL',
            'CallPrompt',
            'ReturnDecode:JSON'
        ],


        'location': [
            'ArgCheck',
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgEncode:JSON',
            'ArgCombine:URL',
            'CallLocation'
        ],

        'iframe': [
            'ArgCheck',
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgEncode:JSON',
            'ArgCombine:URL',
            'CallIframe'
        ],

        'message': [
            'ArgCheck',
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgAdd:name',
            'ArgCombine:Object',
            'CallMessage'
        ]
    };

    var INVOKE_CALL_MAP = {
        method: 'CallMethod',
        prompt: 'CallPrompt',
        location: 'CallLocation',
        iframe: 'CallIframe',
        message: 'CallMessage'
    };

    var INVOKE_BEFORE_MAP = {
        JSONStringInTurn: [
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgEncode:JSON'
        ],

        JSONString:[
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgAdd:name',
            'ArgCombine:JSONString'
        ],
        
        JSONObject:[
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgAdd:name',
            'ArgCombine:Object'
        ],
        
        URL:[
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgEncode:JSON',
            'ArgCombine:URL'
        ]
    };

    function getProccessors(description) {
        var invoke = description.invoke || [];
        if (!invoke instanceof Array) {
            switch (typeof invoke) {
                case 'string':
                    invoke = INVOKE_SHORTCUT[invoke] || [];
                    break;

                case 'object':
                    invoke = [];

                    if (invoke.check) {
                        invoke.push('ArgCheck');
                    }

                    if (invoke.before) {
                        invoke = invoke.concat(INVOKE_BEFORE_MAP[invoke.before]);
                    }

                    invoke.push(INVOKE_CALL_MAP[invoke.call]);

                    if (invoke.after === 'JSON') {
                        invoke.push('ReturnDecode:JSON');
                    }
                    break;

                default:
                    invoke = [];

            }
        }

        var processors = [];
        for (var i = 0; i < invoke.length; i++) {
            var processName = invoke[i];
            var dotIndex = processName.indexOf('.');
            var option = null;

            if (dotIndex > 0) {
                option = processName.slice(dotIndex + 1);
                processName = processName(0, dotIndex);
            }

            var processor = processorCreators[processName](description, option);
            if (typeof processor === 'function') {
                processors.push(processor)
            }
        }
    }

    var jsNative = new APIContainer();
    jsNative.invokeDescription = invokeDescription;

    root.jsNative = jsNative;

    // For AMD
    if (typeof define === 'function' && define.amd) {
        define('jsNative', [], jsNative);
    }

})(this);