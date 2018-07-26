
本文档规定了对 Native 和 JavaScript 实现的约束


## Native

#### 【强制】 Native 必须提供返回所有接口描述信息的接口

所有 JavaScript 和 Native 通信的接口对于 JavaScript 应该是可感知的，统一管理、兼容性处理等都依赖于此。

#### 【强制】 接口描述信息必须包含 `name` 属性做为标识

`name` 标识主要作用是声明接口在当前环境的唯一性。在 prmopt、postMessage 等调用场景下，可能需要回传到 Native 进行路由。


#### 【建议】 接口描述信息的 `name` 属性采用 `.` 分隔的 namespace 格式

可读性更好


#### 【强制】 接口标识在调用时如果需要回传，回传参数名称为 `_name`

避免与接口参数产生冲突。


#### 【强制】 接口参数命名不允许以下划线 `_` 开头

避免与需要回传的参数产生冲突。


#### 【强制】 在环境中注入对象，以 `_na` 开头

避免与当前环境中已有的成员产生冲突。


#### 【强制】 返回所有接口描述信息的接口必须是同步的，并遵循如下定义

获取所有接口描述，对应用来说是环境初始前置工作。同步意味着 **返回所有接口描述信息的接口** 必须是 `注入环境的对象方法` 或 `prompt`。

- 对于 `注入环境的对象方法`，`method` 必须为 `_na.getAPIs`
- 对于 `prompt`，`name` 必须为 `na.getAPIs`



## JavaScript

#### 【强制】 禁止在 Native 提供的对象上添加、修改或删除方法

Android WebView addJavaScriptInterface 或 JS Engine 的场景下，Native 可以直接在环境中注入接口。

不允许通过 JavaScript 修改它们。


#### 【建议】 不要直接调用 Native 提供的对象上的方法

原因如下：

- 部分场景对类型的支持有限，需要先经过编码处理
- 当调用参数的类型不正确时，可能导致 App 崩溃
- 无法对调用进行管理，比如统计等

这个项目对调用进行包装的意义，就是解决这些问题。除非调用时能保证绝对信任，否则不要直接调用
