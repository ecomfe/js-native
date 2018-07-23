



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
        {"name": "url", type: "string"}
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

`args` 属性是一个数组，声明接口的参数列表，其中每项声明是一个包含 `name` 和 `type` 的对象。`type` 的声明方式请参考 [值类型系统](#值类型系统)。

当 `args` 属性不存在时，默认为空数组，意味着该通信接口无调用参数。


```json
{
    "args": [
        {
            "name": "test", 
            "type": "string"
        },
        {
            "name": "one",
            "type" : {
                oneOf": ["One", 1, "one"]
            }
        }
    ]
}
```



invoke
-------

`必选`

`invoke` 属性是一个数组，其中每项为字符串，声明调用过程。接口调用过程是一个同步的处理链，`invoke` 数组声明调用过程的每个处理节点。


处理节点字符串的格式为：

```
processor-name[:arg]
```

在调用过程中，支持的处理器有：

- ArgCheck
- ArgFuncArgDecode
- ArgFuncEncode
- ArgEncode
- ArgAdd
- ArgCombine
- CallMethod
- CallPrompt
- CallIframe
- CallLocation
- CallMessage
- ReturnDecode


详细请参考 [过程处理器](#过程处理器)。




过程处理器
--------


### ArgCheck


### ArgFuncArgDecode


### ArgFuncEncode


### ArgEncode


### ArgAdd


### ArgCombine


### CallMethod


### CallPrompt


### CallIframe


### CallLocation


### CallMessage


### ReturnDecode



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

### call


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
        {"name": "url", type: "string"},
        {"name": "method", type: "string"},
        {"name": "onsuccess", type: "function"}
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
        {"name": "name", type: "string"}
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
        {"name": "url", type: "string"},
        {"name": "method", type: "string"},
        {"name": "onsuccess", type: "function"}
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
        {"name": "name", type: "string"}
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
        {"name": "name", type: "string"}
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
        {"name": "name", type: "string"}
        {"name": "value", type: "*"}
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
        {"name": "url", type: "string"},
        {"name": "method", type: "string"},
        {"name": "onsuccess", type: "function"}
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
        "CallPrompt"
    ],
    "name": "request",
    "schema": "nothttp",
    "authority": "net",
    "path": "/request",
    "args": [
        {"name": "url", type: "string"},
        {"name": "method", type: "string"},
        {"name": "onsuccess", type: "function"}
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
        {"name": "url", type: "string"},
        {"name": "method", type: "string"},
        {"name": "onsuccess", type: "function"}
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
        {"name": "url", type: "string"},
        {"name": "method", type: "string"},
        {"name": "onsuccess", type: "function"}
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
        {"name": "url", type: "string"},
        {"name": "method", type: "string"},
        {"name": "onsuccess", type: "function"}
    ]
}
```


