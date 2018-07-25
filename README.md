
jsNative 是一个 JavaScript 与 Native 通信管理的库。其基于 [通信接口描述](doc/description.md)，生成可调用 API。

- [了解为什么设计成这样](doc/design.md)
- [实现的一些约束](doc/spec.md)
- [通信接口描述](doc/description.md)


## 引入


## 使用

通过接口描述可以直接调用。


```js
let apiList = jsNative.invoke({
    "invoke": "method.json",
    "name": "api.getList",
    "method": "_api.getList"
});
```


jsNative 调用后得到一个 api 容器对象，该对象可以添加接口描述。

```js
let apiContainer = jsNative()
    .add({
        "invoke": "method.json",
        "name": "request",
        "method": "_mod.request",
        "args": [
            {"name": "url", "value": "string"},
            {"name": "method", "value": "string"},
            {"name": "onsuccess", "value": "function"}
        ]
    });
```

api 容器可以使用 `invoke` 方法调用 api。

```js
apiContainer.invoke('request', 'my-url', 'GET', data => {});
```

api 容器通过 `map` 方法可以生成一个对象，对象上包含接口直接调用的方法。

```js
let mod = jsNative()
    .add({
        "invoke": "method.json",
        "name": "request",
        "method": "_mod.request",
        "args": [
            {"name": "url", "value": "string"},
            {"name": "method", "value": "string"},
            {"name": "onsuccess", "value": "function"}
        ]
    })
    .map({
        request: 'fetch'
    });

mod.fetch('my-url', 'GET', data => {});
```

api 容器可以使用 `fromNative` 方法直接从一个 **返回所有接口描述信息的接口** 获取接口并添加。

```js
let mod = jsNative()
    .fromNative({
        "invoke": [
            "CallMethod"
        ],
        "name": "api.getList",
        "method": "_api.getList"
    })
    .map(name => name.slice(name.indexOf('.') + 1));
```




## API

### jsNative


### jsNative.invoke