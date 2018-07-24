



通信接口描述
=========

通信接口描述可能通过通信接口返回，也可能在 JavaScript 中静态维护。通信接口返回的类型可能受限，所以通信接口描述是一个 [JSON](http://json.org/) 对象。

通信接口描述中，基本属性有：

- name
- invoke
- args

与invoke相关的属性有：

- method
- handler
- schema
- authority
- path



```json
{
    "invoke": [
        "CallMethod"
    ],

    "name": "request",
    "method": "biz.request",
    "args": [
        {"name": "url", "value": "string"}
    ]
}
```

name
-------

`可选`

`args` 属性是一个字符串，声明接口的标识。某些调用方式下可能会被作为调用的附加参数传递。



args
--------

`可选`

`args` 属性是一个数组，声明接口的参数列表，其中每项声明是一个包含 `name` 和 `value` 的对象。`value` 的声明方式请参考 [值类型系统](#值类型系统)。

当 `args` 属性不存在时，默认为空数组，意味着该通信接口无调用参数。


```json
{
    "args": [
        {
            "name": "test",
            "value": "string"
        },
        {
            "name": "one",
            "value": {
                "oneOf": ["One", 1, "one"]
            }
        }
    ]
}
```



invoke
-------

`必选`

`invoke` 属性是一个数组或字符串。


当 `invoke` 为数组时，其中每项为字符串，声明调用过程。接口调用过程是一个同步的处理链，`invoke` 数组声明调用过程的每个处理节点。处理节点字符串的格式为：

```
processor-name[:arg]
```

在调用过程中，支持的处理器有：

- [ArgCheck](#argcheck)
- [ArgFuncArgDecode](#argfuncargdecode)
- [ArgFuncEncode](#argfuncencode)
- [ArgEncode](#argencode)
- [ArgAdd](#argadd)
- [ArgCombine](#argcombine)
- [CallMethod](#callMethod)
- [CallPrompt](#callprompt)
- [CallIframe](#calliframe)
- [CallLocation](#calllocation)
- [CallMessage](#callmessage)
- [ReturnDecode](#returndecode)

```json
{
    "invoke": [
        "ArgCheck",
        "CallMethod"
    ]
}
```

当 `invoke` 为字符串时，代表经典调用场景的简写。请参考 [经典调用场景](#经典调用场景)

```json
{
    "invoke": "method"
}
```


过程处理器
--------


### ArgCheck

该处理器根据 [args](#args) 声明，对调用时的参数类型进行检查，不符合时抛出异常。

`无参数`



### ArgFuncArgDecode

有的场景对 **回调函数** 的调用不支持非基础类型。该处理器对 **回调函数** 调用时的参数进行解码。

`参数`：代表解码方式。仅为 **JSON**


### ArgFuncEncode

有的场景对 **回调函数** 的传递不支持 function 类型。该处理器对 **回调函数** 进行管理，并转成全局可调用的函数名。

`无参数`


### ArgEncode

有的场景对 **调用参数** 只支持传递字符串。该处理器对 **调用参数** 进行序列化编码。

`参数`：代表编码方式。仅为 **JSON**


### ArgAdd

将描述对象中的属性，添加到调用参数中。比如使用 prompt 方式调用并传递的是 JSON 时，需要 name 属性标识，native 才知道当前调用的接口是什么。

`参数`：代表要添加到调用参数的属性。值为 **property-name[>arg-name]**


### ArgCombine

有的场景对 **调用参数** 只支持传递一个字符串或一个对象。该处理器对 **调用参数** 进行合并。

`参数`：代表合并方式。值为 **JSON** 或 **URL**

当参数的值为  **URL** 时，该处理器会使用描述对象的 `schema`、`authority`、`path` 字段生成完整的 URL。


### CallMethod

直接通过方法调用。描述对象的 `method` 字段声明方法名。


### CallPrompt

通过 prompt 调用。


### CallIframe

通过 iframe 调用。


### CallLocation

通过 location.href 调用。


### CallMessage

通过 window.webkit.messageHandlers.[handler].postMessage 调用。描述对象的 `handler` 字段声明 handler。


### ReturnDecode

有的场景调用 **返回值** 只支持基础类型。该处理器对 **返回值** 进行解码。

`参数`：代表解码方式。仅为 **JSON**


值类型系统
--------

### 类型定义

值支持的类型定义有下面几种：

- `boolean`
- `string`
- `number`
- `function`
- `Object`
- `Array`
- `*`


### 值类型声明


```json
{
    "type": "string",
    "oneOf": ["One", 1],
    "oneOfType": ["number", "string"],
    "arrayOf": "string",
    "isRequired": true
}
```

值声明的描述是一个对象，对象中可包含 `type`、`oneOf`、`oneOfType`、`arrayOf`、`isRequired` 属性用于描述值类型。

`type`、`oneOf`、`oneOfType`、`arrayOf` 属性只允许同时出现一个。


#### type

`type` 属性声明类型的描述。值为字符串时，通常描述基础类型或泛集合类型。

```json
{
    "type": "string"
}
```

`type` 的值为对象时，类型等同于 Object，并可通过嵌套结构，对内部属性进行描述。

```json
{
    "type": {
        "name": "string",
        "email": "string",
        "sex": "boolean",
        "company": {
            "type": {
                "name": "string",
                "dept": "string"
            },
            "isRequired": true
        }
    }
}
```

#### oneOf

`oneOf` 属性声明值必须为数组中的值之一。值的比较方式为 ===，所以不适合用于描述非基础类型的值。

```json
{
    "oneOf": ["One", 1, "one"]
}
```

#### oneOfType

`oneOf` 属性声明值必须为几种类型之一。

```json
{
    "oneOfType": [
        "string",
        {
            "type": {
                "name": "string",
                "dept": "string"
            }
        }
    ]
}
```

#### arrayOf

`arrayOf` 属性表明值必须是一个数组，并且数组内的每一项都必须是指定类型。

```json
{
    "arrayOf": "string"
}
```


#### isRequired

描述是否必须有值

```json
{
    "type": "string",
    "isRequired": true
}
```

### 值类型快捷声明

完整的写一个 **值类型声明对象** 是很繁冗的。多数时候我们可以用一个简单的字符串描述它。

```
string

// 等同于

{
    "type": "string",
    "isRequired": true
}
```

```
string=

// 等同于

{
    "type": "string"
}
```

```
string|number

// 等同于

{
    
    "oneOfType": [
        "string",
        "number"
    ],
    "isRequired": true
}
```

```
string[]

// 等同于

{
    
    "arrayOf": "string",
    "isRequired": true
}
```


经典调用场景
--------


一些经典调用场景， `invoke` 属性可以使用简写：

- method
- method.json
- prompt.json
- prompt.url
- location
- iframe
- message

可见，简写的基本形式为： `调用方式[.子场景]`。以上简写默认调用前对参数类型进行校验，如果不希望校验，可在前面加上 `nocheck`

- nocheck.method
- nocheck.method.json
- nocheck.prompt.json
- nocheck.prompt.url
- nocheck.location
- nocheck.iframe
- nocheck.message


### method


直接调用的接口声明比较简单：

```json
// 异步
{
    "invoke": [
        "ArgCheck",
        "CallMethod"
    ],
    "name": "request",
    "method": "_mod.request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```

```json
// 同步
{
    "invoke": [
        "ArgCheck",
        "CallMethod"
    ],
    "name": "getStorage",
    "method": "_mod.getStorage",
    "args": [
        {"name": "name", "value": "string"}
    ]
}
```

`简写`: method

```json
// 同步
{
    "invoke": "method",
    "name": "getStorage",
    "method": "_mod.getStorage",
    "args": [
        {"name": "name", "value": "string"}
    ]
}
```


当直接调用的参数和返回值不支持非基础类型时，必须序列化。常见场景为 Android 下 addJavaScriptInterface 注入的方法。


```json
// 异步
{
    "invoke": [
        "ArgCheck",
        "ArgFuncArgDecode:JSON",
        "ArgFuncEncode",
        "ArgEncode:JSON",
        "CallMethod"
    ],
    "name": "request",
    "method": "_mod.request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```


```json
// 同步
{
    "invoke": [
        "ArgCheck",
        "ArgFuncArgDecode:JSON",
        "ArgFuncEncode",
        "ArgEncode:JSON",
        "CallMethod",
        "ReturnDecode:JSON"
    ],
    "name": "getStorage",
    "method": "_mod.getStorage",
    "args": [
        {"name": "name", "value": "string"}
    ]
}
```

`简写`: method.json

```json
// 同步
{
    "invoke": "method.json",
    "name": "getStorage",
    "method": "_mod.getStorage",
    "args": [
        {"name": "name", "value": "string"}
    ]
}
```


### prompt

prompt 调用场景的特点是：

- 只能传递一个字符串，所以参数必须 `合并+序列化`
- 支持同步返回，但是只能返回字符串，所以返回值也必须 `反序列化`


```json
// 同步
{
    "invoke": [
        "ArgCheck",
        "ArgEncode:JSON",
        "ArgAdd:name",
        "ArgCombine:JSON",
        "CallPrompt",
        "ReturnDecode:JSON"
    ],
    "name": "getStorage",
    "args": [
        {"name": "name", "value": "string"}
    ]
}
```

由于调用只能传递一个字符串，我们需要将足够的调用信息编码在这个字符串中。JSON 是常用的形式：


```json
{
    "invoke": [
        "ArgCheck",
        "ArgEncode:JSON",
        "ArgAdd:name",
        "ArgCombine:JSON",
        "CallPrompt",
        "ReturnDecode:JSON"
    ],
    "name": "setStorage",
    "args": [
        {"name": "name", "value": "string"}
        {"name": "value", "value": "*"}
    ]
}
```

```json
{
    "invoke": [
        "ArgCheck",
        "ArgFuncArgDecode:JSON",
        "ArgFuncEncode",
        "ArgEncode:JSON",
        "ArgAdd:name",
        "ArgCombine:JSON",
        "CallPrompt"
    ],
    "name": "request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```

`简写`: prompt.json

```json
{
    "invoke": "prompt.json",
    "name": "request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```




另外一种常见形式是 URL：


```json
{
    "invoke": [
        "ArgCheck",
        "ArgFuncArgDecode:JSON",
        "ArgFuncEncode",
        "ArgEncode:JSON",
        "ArgCombine:URL",
        "CallPrompt",
        "ReturnDecode:JSON"
    ],
    "name": "request",
    "schema": "nothttp",
    "authority": "net",
    "path": "/request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```

`简写`: prompt.url

```json
{
    "invoke": "prompt.url",
    "name": "request",
    "schema": "nothttp",
    "authority": "net",
    "path": "/request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```


### location


location 调用场景的特点是：

- 只能传递一个 URL 字符串，所以参数必须 `合并+序列化`
- 只支持异步，无法同步返回


```json
{
    "invoke": [
        "ArgCheck",
        "ArgFuncArgDecode:JSON",
        "ArgFuncEncode",
        "ArgEncode:JSON",
        "ArgCombine:URL",
        "CallLocation"
    ],
    "name": "request",
    "schema": "nothttp",
    "authority": "net",
    "path": "/request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```

`简写`: location

```json
{
    "invoke": "location",
    "name": "request",
    "schema": "nothttp",
    "authority": "net",
    "path": "/request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```


### iframe


iframe 调用场景的特点和 location 一样：

- 只能传递一个 URL 字符串，所以参数必须 `合并+序列化`
- 只支持异步，无法同步返回



```json
{
    "invoke": [
        "ArgCheck",
        "ArgFuncArgDecode:JSON",
        "ArgFuncEncode",
        "ArgEncode:JSON",
        "ArgCombine:URL",
        "CallIframe"
    ],
    "name": "request",
    "schema": "nothttp",
    "authority": "net",
    "path": "/request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```

`简写`: iframe

```json
{
    "invoke": "iframe",
    "name": "request",
    "schema": "nothttp",
    "authority": "net",
    "path": "/request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```

### postMessage


postMessage 仅 iOS 的 WKWebView 支持，其特点是：

- 仅支持一个参数。好消息是，除了基础类型外，还支持 Object 与 Array，但是不支持 Function
- 只支持异步，无法同步返回

所以，调用的参数还是需要合并，并且类型为 Function 的参数还是需要处理。

```json
{
    "invoke": [
        "ArgCheck",
        "ArgFuncArgDecode:JSON",
        "ArgFuncEncode",
        "ArgCombine",
        "ArgAdd:name",
        "CallMessage"
    ],
    "name": "request",
    "handler": "net",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```

`简写`: message

```json
{
    "invoke": "message",
    "name": "request",
    "handler": "net",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
}
```


