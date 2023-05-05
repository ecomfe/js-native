jsNative
---------

[![npm version](https://img.shields.io/npm/v/js-native.svg?style=flat-square)](https://www.npmjs.com/package/js-native)
[![GitHub license](https://img.shields.io/github/license/ecomfe/js-native.svg?style=flat-square)](https://github.com/ecomfe/js-native/blob/master/LICENSE)
[![codecov](https://img.shields.io/codecov/c/github/ecomfe/js-native/master.svg?style=flat-square)](https://codecov.io/gh/ecomfe/js-native)
[![CircleCI](https://circleci.com/gh/ecomfe/js-native.svg?style=svg)](https://circleci.com/gh/ecomfe/js-native)



jsNative 是一个 JavaScript 与 Native 通信管理的库。其基于 [通信接口描述](doc/description.md)，生成可调用 API。

- [了解为什么设计成这样](doc/design.md)
- [实现的一些约束](doc/spec.md)
- [通信接口描述](doc/description.md)


## 引入

### 下载

`NPM:`

```
$ npm i js-native --save
```

`保存:`

[请点击右键另存为](https://unpkg.com/js-native@latest)


### 引用

```html
<!-- 引用通过 NPM 下载的本地文件 -->
<script src="node_modules/js-native/index.js"></script>

<!-- 通过 CDN 引用 -->
<script src="https://unpkg.com/js-native@latest"></script>
```


## 使用

通过接口描述可以直接调用。


```js
let apiList = jsNative.invokeAPI({
    "invoke": "method.json",
    "name": "na.getAPIs",
    "method": "_na.getAPIs"
});
```


jsNative 是一个默认的 api 容器对象，通过 `add` 方法可以添加接口描述。

```js
jsNative.add({
    "invoke": "method.json",
    "name": "net.request",
    "method": "_naNet.request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
});
```

api 容器对象上，可以使用 `invoke` 方法调用 api。

```js
jsNative.invoke('net.request', ['my-url', 'GET', data => {}]);
```

api 容器对象上，通过 `map` 方法可以生成一个对象，对象上包含接口直接调用的方法。

```js
let mod = jsNative
    .add({
        "invoke": "method.json",
        "name": "net.request",
        "method": "_naNet.request",
        "args": [
            {"name": "url", "value": "string"},
            {"name": "method", "value": "string"},
            {"name": "onsuccess", "value": "function"}
        ]
    })
    .map({
        'net.request': 'fetch'
    });

mod.fetch('my-url', 'GET', data => {});
```

api 容器对象上，可以使用 `fromNative` 方法直接从一个 **返回所有接口描述信息的接口** 获取接口并添加。

```js
let mod = jsNative
    .fromNative({
        "invoke": "method",
        "name": "na.getAPIs",
        "method": "_na.getAPIs"
    })
    .map(name => name.slice(name.indexOf('.') + 1));
```


当你不想使用默认的 api 容器对象，或者需要多个 api 容器对象时，可以使用 `createContainer` 方法创建新的 api 容器对象。

```js
let apiContainer = jsNative.createContainer();
```

新的 api 容器对象上拥有 `add` 、`fromNative`、`invoke`、`map` 方法，你可以正常使用它。

```js
let mod = jsNative
    .createContainer()
    .add({
        "invoke": "method.json",
        "name": "net.request",
        "method": "_naNet.request",
        "args": [
            {"name": "url", "value": "string"},
            {"name": "method", "value": "string"},
            {"name": "onsuccess", "value": "function"}
        ]
    })
    .map({
        'net.request': 'fetch'
    });

mod.fetch('my-url', 'GET', data => {});
```

## API

### jsNative

通常，对于一个应用场景，我们倾向于在一个地方管理所有的 Native 通信接口 。所以 jsNative 是 [APIContainer](#apicontainer) 的一个实例，在这个实例上额外提供了：

- [createContainer](#jsnativecreatecontainer) 方法。在不想用默认 [APIContainer](#apicontainer) 实例时，可以创建自己的 [APIContainer](#apicontainer) 实例
- [invokeAPI](#jsnativeinvokeapi) 方法。可以直接调用 Native 通信接口

jsNative 上的其他属性和方法请参考 [APIContainer](#apicontainer) 的文档。


#### jsNative.createContainer

`说明`

创建 [APIContainer](#apicontainer) 实例。

`参数`

- `{Object}` options 参数对象
- `{string=}` options.errorTitle 显示报错信息的标题
- `{string=}` options.namingConflict 名字冲突时的处理策略

详细请参考 [config](#config) 方法

`返回`

[APIContainer](#apicontainer) 实例。

`示例`

```js
let apiContainer = jsNative.createContainer();
```

#### jsNative.invokeAPI

`说明`

通过[通信接口描述](doc/description.md)，直接调用。

`参数`

- `{Object} description` [通信接口描述](doc/description.md)对象
- `{Array=} args` 调用参数

`返回`

`{*}` 调用结果

`示例`

```js
let apiList = jsNative.invokeAPI(
    {
        "invoke": "method.json",
        "name": "net.request",
        "method": "_naNet.request",
        "args": [
            {"name": "url", "value": "string"},
            {"name": "method", "value": "string"},
            {"name": "onsuccess", "value": "function"}
        ]
    },
    [
        'https://yourdomain.com/path',
        'get',
        content => {
            console.log(content);
        }
    ]
);
```


### APIContainer

通信接口容器类。用于通信接口的管理功能，包括多种注册方式、调用、编译出可被直接调用函数组成的对象等。


#### add

`说明`

添加 Native 通信接口描述

`参数`

- `{Object|Array}` description [通信接口描述](doc/description.md)对象，或多个对象组成的数组

`返回`

`{APIContainer}` this

`示例`

```js
apiContainer.add({
    "invoke": "method.json",
    "name": "net.request",
    "method": "_naNet.request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
});
```

#### addProcessorCreator

`说明`

新增 processorCreator ，新增的 processorCreator 可以在描述的 invoke 中进行调用(但不可以冲掉内置的 processorCreator )

`参数`

- `{string}` name 注册的 processorCreator 名称
- `{Function}` processorCreator 的创建函数，需要返回真正的processor

其中 processorCreator 接受三个参数：

- description: 当前调用能力的description
- option: 调用能力时，invoke配置的参数（如：ReturnDecode:JSON 中的JSON）
- apiContainer: 调用能力发生的container对象

processorCreator 的返回值接受调用能力时真正传入的参数

`返回`

`{APIContainer}` this

`示例`

```js
apis.addProcessorCreator(
    'ArgAddToken',
    function (description, option, apiContainer) {
        return function (args) {
            return true;
        }
    }
);
```

#### addInvokeShortcut

`说明`

新增调用场景简写，新增的场景同内置场景使用方式一样(但不可以冲掉内置的场景 )

`参数`

- `{string}` name 注册的场景名称
- `{Function}` processorCreator 需要注册场景的invokes，是一个由invoke字符串组成的数组

`返回`

`{APIContainer}` this

`示例`

```js
apis.addInvokeShortcut(
    'myMethod.json',
    [
        "ArgCheck",
        "CallMethod",
        "ReturnDecode:JSON"
    ]
);
```

#### config

`说明`

配置参数，设置的参数将被合并到现有参数中

`参数`

- `{Object}` options 参数对象
- `{string=}` options.errorTitle 显示报错信息的标题
- `{string=}` options.namingConflict 名字冲突时的处理策略

namingConflict 的取值可以是：

- error: 抛出错误
- ignore: 保留现有api
- override: 覆盖现有api

`返回`

`{APIContainer}` this

`示例`

```js
apiContainer.config({
    namingConflict: 'ignore'
});
```


#### fromNative

`说明`

从 `返回所有接口描述信息的接口` 调用的结果，添加调用API。该接口 Native 上的实现必须遵循[如下约束](doc/spec.md#强制-返回所有接口描述信息的接口必须是同步的并遵循如下定义)。

`参数`

- `{Object}` description 要调用的[通信接口描述](doc/description.md)对象

`返回`

`{APIContainer}` this

`示例`

```js
apiContainer.fromNative({
    "invoke": "method",
    "name": "na.getAPIs",
    "method": "_na.getAPIs"
});
```

#### invoke

`说明`

通过描述对象的 name 属性进行调用。

`参数`

- `{string} name` 调用描述对象的 name
- `{Array=} args` 调用参数

`返回`

`{*}` 调用结果

`示例`

```js
apiContainer
    .add({
        "invoke": "method.json",
        "name": "net.request",
        "method": "_naNet.request",
        "args": [
            {"name": "url", "value": "string"},
            {"name": "method", "value": "string"},
            {"name": "onsuccess", "value": "function"}
        ]
    })
    .invoke(
        "net.request",
        [
            'https://yourdomain.com/path',
            'get',
            content => {
                console.log(content);
            }
        ]
    );
```

#### map

`说明`

生成一个对象，其上的方法是 API 容器对象中调用描述对象编译成的，可被直接调用的函数

`参数`

- `{Object|Function}` mapAPI 调用描述对象名称的映射表或映射函数

`返回`

`{Object}` 生成的对象

`示例`

```js
apiContainer.add({
    "invoke": "method.json",
    "name": "net.request",
    "method": "_naNet.request",
    "args": [
        {"name": "url", "value": "string"},
        {"name": "method", "value": "string"},
        {"name": "onsuccess", "value": "function"}
    ]
});

// 通过 Object map。mod 对象上包含 fetch 方法，可直接调用
let mod = apiContainer.map({
    'net.request': 'fetch'
});
mod.fetch('https://yourdomain.com/path', 'GET', data => {});

// 通过 function map。mod2 对象上包含 request 方法，可直接调用
let mod2 = apiContainer.map(name => name.slice(name.indexOf('.') + 1));
mod2.request('https://yourdomain.com/path', 'GET', data => {});
```

#### setExternalDescriptionProps

`说明`

设置额外的 description 属性列表。

若设置了额外的 description 属性列表，不在列表中的属性将被忽略。该接口应仅用于性能优化，不应改变默认行为。

`参数`

- `{Array}` props 额外的description属性列表

`返回`

无

`示例`

```js
apis.setExternalDescriptionProps(['myProp']);

apis.addProcessorCreator(
    'ReadMyProp',
    function (description) {
        return function () {
            return description.myProp;
        }
    }
);
```

## License

jsNative is [MIT licensed](./LICENSE).

