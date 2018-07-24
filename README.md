

```js
let mod = jsNative()
    .add({
        "invoke": [
            "CallMethod"
        ],
        "name": "request",
        "method": "biz.request",
        "args": [
            {"name": "url", "value": "string"}
        ]
    })
    .map({
        request: 'fetch'
    });
```


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


```js
let apiList = jsNative.invoke({
    "invoke": [
        "CallMethod"
    ],
    "name": "api.getList",
    "method": "_api.getList"
});
```
