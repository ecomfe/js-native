/**
 * @file js-native 通信管理
 * @author errorrik(errorrik@gmail.com)
 * @author houyu(785798835@qq.com)
 */

(function (root) {

    /**
     * 对数组进行遍历
     *
     * @inner
     * @param {Array} array 要遍历的数组
     * @param {Function} fn 遍历函数
     */
    function each(array, fn) {
        var len = array && array.length || 0;

        for (var i = 0, l = len; i < l; i++) {
            if (fn(array[i], i) === false) {
                break;
            }
        }
    }

    /**
     * 返回原值的方法，调用过程的兜底处理函数
     *
     * @inner
     * @param {*} source 原值
     * @return {*}
     */
    function returnRaw(source) {
        return source;
    }

    /**
     * 对返回值进行 JSON 解码（反序列化）处理的函数
     *
     * @inner
     * @param {*} source 原值
     * @return {*}
     */
    function returnJSONDecode(source) {
        return typeof source === 'string' ? JSON.parse(source) : source;
    }


    /**
     * 参数检查，错误直接抛出异常
     *
     * @inner
     * @param {Array} args 调用参数
     * @param {Array} declarations 参数声明列表
     */
    function checkArgs(args, declarations, apiContainer) {
        each(declarations, function (declaration, i) {
            var errorMsg;
            var value = normalizeValueDeclaration(declaration.value);

            switch (checkValue(args[i], value)) {
                case 1:
                    errorMsg = ' is required.';
                    break;

                case 2:
                    errorMsg = ' type error. must be ' + JSON.stringify(value.type || 'Array');
                    break;

                case 3:
                    errorMsg = ' type error, must be oneOf ' + JSON.stringify(value.oneOf);
                    break;

                case 4:
                    errorMsg = ' type error, must be oneOfType ' + JSON.stringify(value.oneOfType);
                    break;

                case 5:
                    errorMsg = ' type error, must be arrayOf ' + JSON.stringify(value.arrayOf);
                    break;
            }

            if (errorMsg) {
                var title = apiContainer && apiContainer.options.errorTitle || 'jsNative';
                throw new Error('[' + title + ' Argument Error]' + declaration.name + errorMsg);
            }
        });
    }

    /**
     * 对值声明进行标准化处理
     *
     * @inner
     * @param {Object|string} declaration 值声明
     * @return {Object}
     */
    function normalizeValueDeclaration(declaration) {
        if (typeof declaration === 'string') {
            var realDeclaration = {isRequired: true};


            if (/=$/.test(declaration)) {
                realDeclaration.isRequired = false;
                declaration = declaration.slice(0, declaration.length - 1);
            }

            if (/\[\]$/.test(declaration)) {
                realDeclaration.arrayOf = declaration.slice(0, declaration.length - 2);
            }
            else if (declaration.indexOf('|') > 0) {
                realDeclaration.oneOfType = declaration.split('|');
            }
            else {
                realDeclaration.type = declaration;
            }

            return realDeclaration;
        }

        return declaration;
    }


    /**
     * 对参数值进行检查
     *
     * @inner
     * @param {*} value 值
     * @param {Object} declaration 值声明
     * @return {number}
     */
    function checkValue(value, declaration) {
        declaration = normalizeValueDeclaration(declaration);
        if (value == null) {
            return declaration.isRequired && declaration.type !== '*' ? 1 : 0;
        }


        var valid = false;
        switch (typeof declaration.type) {
            case 'string':
                switch (declaration.type) {
                    case 'string':
                    case 'boolean':
                    case 'number':
                    case 'function':
                    case 'object':
                        valid = typeof value === declaration.type;
                        break;

                    case 'Object':
                        valid = typeof value === 'object';
                        break;

                    case 'Array':
                        valid = value instanceof Array;
                        break;

                    case '*':
                        valid = true;
                        break;
                }

                if (!valid) {
                    return 2;
                }
                break;

            case 'object':
                if (value && typeof value === 'object') {
                    valid = true;
                    for (var key in declaration.type) {
                        valid = !checkValue(value[key], declaration.type[key]);

                        if (!valid) {
                            break;
                        }
                    }
                }

                if (!valid) {
                    return 2;
                }
                break;

            default:

                if (declaration.oneOf) {

                    each(declaration.oneOf, function (expectValue) {
                        valid = expectValue === value;
                        return !valid;
                    });

                    if (!valid) {
                        return 3;
                    }

                }
                else if (declaration.oneOfType) {

                    each(declaration.oneOfType, function (expectType) {
                        valid = !checkValue(value, expectType);
                        return !valid;
                    });

                    if (!valid) {
                        return 4;
                    }

                }
                else if (declaration.arrayOf) {

                    if (value instanceof Array) {
                        valid = true;
                        each(value, function (item) {
                            return (valid = !checkValue(item, declaration.arrayOf));
                        });

                        if (!valid) {
                            return 5;
                        }
                    }
                    else {
                        return 2;
                    }

                }
        }

        return 0;
    }

    /**
     * 对调用参数中的所有回调函数，进行参数解码（反序列化）包装
     *
     * @inner
     * @param {Array} args 调用参数
     * @return {Array}
     */
    function wrapDecodeFuncArgs(args) {
        each(args, function (arg, i) {
            if (typeof arg === 'function') {
                args[i] = wrapDecodeFuncArg(arg);
            }
        });

        return args;
    }

    /**
     * 对回调函数的参数进行解码（反序列化）包装
     *
     * @inner
     * @param {Function} fn 回调函数
     * @return {Function}
     */
    function wrapDecodeFuncArg(fn) {
        return function (arg) {
            fn(typeof arg === 'string' ? JSON.parse(arg) : arg);
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
        each(args, function (arg, i) {
            if (typeof arg === 'function') {
                args[i] = wrapFunc(arg);
            }
        });

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
        each(args, function (arg, i) {
            args[i] = JSON.stringify(arg);
        });

        return args;
    }

    /**
     * 将调用参数合并成对象
     *
     * @inner
     * @param {Array} args 调用参数
     * @param {Array} declarations 参数声明列表
     * @return {Object}
     */
    function argCombine(args, declarations) {
        var result = {};
        each(declarations, function (declaration, i) {
            var arg = args[i];
            if (arg != null) {
                result[declaration.name] = arg;
            }
        });

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
     * 映射调用对象描述中的名称
     *
     * @inner
     * @param {Object|Function} mapAPI 调用描述对象名称的映射表或映射函数
     * @param {string} name 调用描述对象中的名称
     * @return {string}
     */
    function mapAPIName(mapAPI, name) {
        if (typeof mapAPI === 'function') {
            return mapAPI(name);
        }

        return mapAPI[name];
    }

    /**
     * 调用描述对象的 invoke 属性为字符串时的快捷映射表
     *
     * @inner
     * @const
     * @type {Object}
     */
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

    /**
     * 调用描述对象的 invoke 属性为 Object时，call 字段对应的映射表
     *
     * @inner
     * @const
     * @type {Object}
     */
    var INVOKE_CALL_MAP = {
        method: 'CallMethod',
        prompt: 'CallPrompt',
        location: 'CallLocation',
        iframe: 'CallIframe',
        message: 'CallMessage'
    };

    /**
     * 调用描述对象的 invoke 属性为 Object时，before 字段对应的映射表
     *
     * @inner
     * @const
     * @type {Object}
     */
    var INVOKE_BEFORE_MAP = {
        JSONStringInTurn: [
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgEncode:JSON'
        ],

        JSONString: [
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgAdd:name',
            'ArgCombine:JSONString'
        ],

        JSONObject: [
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgAdd:name',
            'ArgCombine:Object'
        ],

        URL: [
            'ArgFuncArgDecode:JSON',
            'ArgFuncEncode',
            'ArgEncode:JSON',
            'ArgCombine:URL'
        ]
    };

    /**
     * 对调用描述对象进行标准化处理
     *
     * @inner
     * @param {Object} description 调用描述对象
     * @return {Object}
     */
    function normalizeDescription(description) {
        return {
            name: description.name,
            args: (description.args || []).slice(0),
            invoke: normalizeInvoke(description.invoke),
            method: description.method,
            scheme: description.scheme || description.schema,
            authority: description.authority,
            path: description.path,
            handler: description.handler
        };
    }

    /**
     * 对 description 中的 invoke 属性进行标准化处理
     *
     * @inner
     * @param {Array|Object|string} invoke description的invoke属性
     * @return {Array?}
     */
    function normalizeInvoke(invoke) {
        if (invoke instanceof Array) {
            return invoke;
        }

        switch (typeof invoke) {
            case 'string':
                return INVOKE_SHORTCUT[invoke];

            case 'object':
                var result = [];

                if (invoke.check) {
                    result.push('ArgCheck');
                }

                if (invoke.before) {
                    result = result.concat(INVOKE_BEFORE_MAP[invoke.before]);
                }

                result.push(INVOKE_CALL_MAP[invoke.call]);

                if (invoke.after === 'JSON') {
                    result.push('ReturnDecode:JSON');
                }

                return result;

        }
    }

    function APIContainer(options) {
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
            ArgCheck: function (description, option, apiContainer) {
                return function (args) {
                    checkArgs(args, description.args, apiContainer);
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
                    value: '*'
                });

                var value = description[option];
                return function (args) {
                    args[argLen] = value;
                    return args;
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
                        var prefix = description.scheme + '://' + description.authority + description.path;
                        return function (args) {
                            var result = [];

                            each(description.args, function (declaration, i) {
                                var arg = args[i];
                                if (arg != null) {
                                    result.push(declaration.name + '=' + encodeURIComponent(arg));
                                }
                            });

                            var queryStr = result.join('&');

                            return queryStr ? prefix + '?' + queryStr : prefix;
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
                var methodOwner;
                var methodName;
                function findMethod() {
                    if (!methodOwner) {
                        var segs = description.method.split('.');
                        var lastIndex = segs.length - 1;

                        methodName = segs[lastIndex];
                        methodOwner = root;
                        for (var i = 0; i < lastIndex; i++) {
                            methodOwner = methodOwner[segs[i]];
                        }
                    }
                }

                return function (args) {
                    findMethod();

                    switch (description.args.length) {
                        case 0:
                            return methodOwner[methodName]();
                        case 1:
                            return methodOwner[methodName](args[0]);
                        case 2:
                            return methodOwner[methodName](args[0], args[1]);
                        case 3:
                            return methodOwner[methodName](args[0], args[1], args[2]);
                    }

                    return methodOwner[methodName].apply(methodOwner, args);
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
                    ? returnJSONDecode
                    : returnRaw;
            }
        };

        var apiContainer = {
            options: {
                errorTitle: 'jsNative'
            },

            apis: [],
            apisLen: 0,
            apiIndex: {},

            /**
             * 配置参数，设置的参数将被合并到现有参数中
             *
             * @param {Object} options 参数对象
             * @param {string=} options.errorTitle 显示报错信息的标题
             * @param {string=} options.namingConflict 名字冲突时的处理策略
             * @return {APIContainer}
             */
            config: function (options) {
                options = options || {};
                // 再多就不能这么干了
                this.options.errorTitle = options.errorTitle || this.options.errorTitle;
                this.options.namingConflict = options.namingConflict || this.options.namingConflict;

                return this;
            },

            /**
             * 添加调用API
             *
             * @param {Object|Array} description 调用描述对象
             * @return {APIContainer}
             */
            add: function (description) {
                if (description instanceof Array) {
                    for (var i = 0; i < description.length; i++) {
                        this.add(description[i]);
                    }
                }
                else if (typeof description === 'object') {
                    var name = description.name;

                    if (this.apiIndex[name] != null) {
                        switch (this.options.namingConflict) {
                            /* jshint ignore:start */
                            case 'override':
                                this.apis[this.apiIndex[name]] = normalizeDescription(description);

                            case 'ignore':
                                break;
                            /* jshint ignore:end */

                            default:
                                throw new Error('[' + this.options.errorTitle + '] API exists: ' + name);
                        }
                    }
                    else {
                        var realDesc = normalizeDescription(description);

                        this.apiIndex[name] = this.apisLen;
                        this.apis[this.apisLen++] = realDesc;
                    }
                }

                return this;
            },

            /**
             * 从一次 Native 的调用结果中添加调用API
             *
             * @param {Object} description 调用描述对象
             * @return {APIContainer}
             */
            fromNative: function (description) {
                return this.add(invokeDescription(normalizeDescription(description)));
            },


            /**
             * 通过描述对象的 name 属性进行调用
             *
             * @param {string} name 调用描述对象名
             * @param {Array=} args 调用参数
             * @return {*}
             */
            invoke: function (name, args) {
                return invokeDescription(this.apis[this.apiIndex[name]], args);
            },

            /**
             * 生成一个对象，其上的方法是 API 容器对象中调用描述对象编译成的，可被直接调用的函数
             *
             * @param {Object|Function} mapAPI 调用描述对象名称的映射表或映射函数
             * @return {Object}
             */
            map: function (mapAPI) {
                mapAPI = mapAPI || function (name) {
                    return name;
                };

                var apiObject = {};


                for (var i = 0; i < this.apis.length; i++) {
                    var api = this.apis[i];
                    var apiName = mapAPIName(mapAPI, api.name);

                    if (apiName && api.invoke) {
                        apiObject[apiName] = buildAPIMethod(api, this);
                    }
                }

                return apiObject;
            },

            /**
             * 通过调用描述对象进行调用
             *
             * @param {Object} description 调用描述对象
             * @param {Array} args 调用参数
             * @return {*}
             */
            invokeAPI: function (description, args) {
                return invokeDescription(normalizeDescription(description), args);
            },

            /**
             * 开发者补充processorsCreators的自定义集(TIPS:不能刷掉内置的processorCreators)
             *
             * @param {string} name 注册的processorCreator名称
             * @param {Function} 需要注册的processorCreator，此函数返回值需要是一个函数
             * @return {APIContainer}
             */
            addProcessorCreator: function (name, processorCreator) {
                if (processorCreators[name]) {
                    throw new Error('[' + this.options.errorTitle + '] processorCreators exists: ' + name);
                }
                processorCreators[name] = processorCreator;
                return this;
            }
        };

        apiContainer.config(options);
        return apiContainer;

        /**
         * 生成调用过程处理函数的列表
         *
         * @inner
         * @param {Object} description 调用描述对象
         * @return {Function[]}
         */
        function getProcessors(description) {
            var processors = [];

            if (!description.invoke) {
                throw new Error('[' + apiContainer.options.errorTitle + '] invoke undefined: ' + description.name);
            }

            each(description.invoke, function (processName) {
                var dotIndex = processName.indexOf(':');
                var option;

                if (dotIndex > 0) {
                    option = processName.slice(dotIndex + 1);
                    processName = processName.slice(0, dotIndex);
                }

                var processor = processorCreators[processName](description, option, apiContainer);
                if (typeof processor === 'function') {
                    processors.push(processor);
                }
            });

            return processors;
        }

        /**
         * 通过调用描述对象进行调用
         *
         * @inner
         * @param {Object} description 调用描述对象
         * @param {Array} args 调用参数
         * @return {*} 处理完成结果
         */
        function invokeDescription(description, args) {
            if (description) {
                args = args || [];

                each(getProcessors(description), function (processor) {
                    args = processor(args);
                });

                return args;
            }
        }

        /**
         * 把调用描述对象编译成可被直接调用的函数
         *
         * @inner
         * @param {Object} description 调用描述对象
         * @return {Function}
         */
        function buildAPIMethod(description) {
            var processors = getProcessors(description);

            function process(args) {
                each(processors, function (processor) {
                    args = processor(args);
                });

                return args;
            }

            return function () {
                return process(Array.prototype.slice.call(arguments, 0, description.args.length));
            };
        }
    }

    // export object ===========

    /**
     * 默认的 API Container 实例
     *
     * @type {APIContainer}
     */
    var jsNative = new APIContainer();

    /**
     * 创建 API Container
     *
     * @param {Object=} options 创建的参数
     * @return {APIContainer}
     */
    jsNative.createContainer = function (options) {
        return new APIContainer(options);
    };

    // export ==============
    root.jsNative = jsNative;

    // For AMD
    if (typeof define === 'function' && define.amd) {
        define('jsNative', [], jsNative);
    }

    // for Commonjs
    if (typeof exports !== "undefined") {
        exports.jsNative = jsNative;
    }

})(
    typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
            ? global
            : this
);

// for es6 module
export default jsNative;