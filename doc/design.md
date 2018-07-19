
## 设计目标

在 Hybird 等跨平台的 APP 视图方案中，不可避免涉及到 JavaScript 和 Native 的通信。而在不同的视图方案、同一种方案在不同平台下，JavaScript 和 Native 的通信方式都可能不同。

本设计希望能够抹平不同场景下 JavaScript 和 Native 通信的差异性，使其对应用上层透明。


## 环境差异

JavaScript 和 Native 通信的场景可能有下面这么多种：

- AddJavaScriptInterface (Android WebView)
- prompt (Android WebView、iOS WebView)
- location.href (Android WebView、iOS WebView)
- iframe (Android WebView、iOS WebView)
- postMessage (iOS WKWebView)
- JSEngine API 注入 (Android、iOS)

这么多场景有不同的机制，导致 JavaScript 和 Native 通信存在一些差异性：

- 有的场景不支持同步，只支持异步
- 参数类型的支持不同。很多场景不支持复杂对象传输，需要序列化；有的场景仅支持原始对象
- 支持同步的场景中，返回值的类型支持不同
- 不同的场景下，序列化的方式不同

同时，应用上层代码可能同时运行在 Native 和标准浏览器中，其需要对是否支持某种 Native 的调用操作有感知。

另外，由于 Native 端接收不支持类型的参数时，有可能会 crash，在 JavaScript 端可能需要进行类型校验。


## 设计原则


### JavaScript 端通过通信接口描述，生成调用 API

通过接口描述生成 API 的好处是：

- 避免重复编码
- 适应通信方式变更。通信方式变更时，无需更改JS层代码
- 适应在不同端下使用不同的通信方式
- 更灵活，可做到前向兼容性

通信接口需要描述如下信息：

- 调用方式
- 序列化方式
- 同步异步
- 参数类型
- 同步情况的返回值类型
- 异步情况的回调参数类型
- 是否需要参数校验


### 对 Native 端的路由方式有一定的约束

避免混乱的管理


### 对 JavaScript API 的生成有一定约束

JSEngine API 和通过描述生成的 API 实际上都是可被应用上层调用的。其边界应被明确，避免不必要的困扰


### 固定基本的、必须提供的通信接口

理想化来说，所有的接口对应用上层应可被感知。所以，我们要求 Native 端应该提供相应的接口。

对于未提供相应接口的遗留系统，如果需要前向兼容，应该在 JavaScript 端手工维护描述。




