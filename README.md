jsNative
---------




jsNative 是一个 JavaScript 与 Native 通信管理的库。其基于 [通信接口描述](doc/description.md)，生成可调用 API。

- [了解为什么设计成这样](doc/design.md)
- [实现的一些约束](doc/spec.md)
- [通信接口描述](doc/description.md)


## 引入


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

通常，对于一个应用场景，我们倾向于在一个地方管理所有的调用 API 。所以 jsNative 是 [APIContainer](##apicontainer) 的一个实例，在这个实例上额外提供了：

- [createContainer](#jsnativecreatecontainer) 方法。在不想用默认 [APIContainer](##apicontainer) 实例时，可以创建自己的 [APIContainer](##apicontainer) 实例
- [invokeAPI](#jsnativeinvokeapi) 方法。可以直接调用 Native API

jsNative 上的其他方法请参考 [APIContainer](##apicontainer) 的文档。


### jsNative.createContainer

### jsNative.invokeAPI


### APIContainer