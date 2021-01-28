## 无埋点前端库
---

### 引入方式

```js
// 1、通过npm包的方式引入
tnpm install tracker --save

import Tracker from 'tracker';
import 'tracker/heatmap/style';

// 或者
const Tracker = require('tracker').default;
require('tracker/heatmap/style');

// 2、通过cdn的方式引入
<link rel="stylesheet" href="//xx.com/libs/tracker.min.css">
<script src="//xx.com/libs/tracker.min.js"></script>
```

### 使用方式

```js
Tracker
    .config({
        appKey: 'xxx', // 此处需要替换成你申请的appKey
        BossId: 'xxx',
        Pwd: 'xxx',
        useClass: true, // 获取domPath时使用class
        per: 0.1, // 上报频率
        debug: false,
    })
    .setContent({
        pageType: 'index',
    })
    .install();

// 也可以主动发送数据
Tracker
    .send({
        pageType: 'index',
        trackingType: 'pageload',
    });

// 如果是SPA，当路由信息改变时，可以进行如下操作
Tracker
    .setContent({
        pageType: 'detail', // pageType用来区分页面，不过目前同一项目数据聚合策略是根据url来区分
    })
    .send({
        trackingType: 'pagelaod',
    });

// 通过发送trackingType为'pageload'的数据，可以统计当前页面PV
Tracker
    .send({
        trackingType: 'pageload',
    });
```
