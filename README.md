# LuoguPaintBoard

开源、免费、易用而且强大的洛谷冬日绘版脚本

## 亮点

1. 异步编写+多进程，效率足够高（到底怎么个高效率我也不清楚）。
2. 通过 HTTP 实现实时添加 token，而且可以实现公网访问，避免手动添加的麻烦。
3. 自动删除无效 token，在 token 被挤占时将会进行多线程争夺 token 使用权。
4. 方便的图片管理功能，一键管理所有图片，自动生成计划，可以预览计划。
5. 日志功能，将会记录脚本运行情况。

注意，洛谷目前并没有开放接口以及前端代码，因此在正式上线时脚本极可能需要修改。在 <https://oj.hikari.owo.fit/paintBoard> 测试通过。

## 使用方法/Usage

1. 通过 `git clone` 、直接下载仓库 zip 等方法得到仓库。

2. 安装 nodejs（在 v13.14.0 及以上测试通过）以及 python3。

3. 安装 nodejs 依赖，执行 `npm install` 或分别通过 `npm install <包名>` 安装：

   ```json
   {
       "body-parser": "^1.19.1",
       "express": "^4.17.2",
       "node-fetch": "2.6.6",
       "qs": "^6.10.2"
     }
   ```

   node-fetch 版本必须是 2.6.6 及以下，安装特定版本的包可以通过 `npm install node-fetch@2.6.6` 完成。

4. 安装 python 依赖，执行 `pip install pillow` 或 `python -m pip install pillow`。

5. 请看功能介绍。

## 功能介绍

### 计划管理

计划存放在 `plan.json` 中，接受以 `[[x,y,color],...]` 形式存放的计划。

计划预览存放在 `preview.js` 中，接受以`var board=[[x,y,color],...]`形式存放的计划。 也就是说你可以把 `plan.json` 的内容复制过来并在前面加上 `var board=`。使用浏览器打开 `preview.html` 可以查看当前计划的预览。

使用 `python ImageToData.py` 将会将 `Pics` 文件夹中的图片同时生成为 `plan.json` 和 `preview.js`，我们推荐通过这种方式生成计划。

### 图片管理

注意，本脚本并不能直接将原始图片转换为计划，而只能将已经处理为 32 位 .bmp 文件的图像转换为计划。如何处理图像参见：[处理图像](#处理图像)。

要想将某一图片加入计划，首先将其复制到 `Pics` 文件夹，随后打开 `Pics` 文件夹的 `maps.json`，以以下形式，将图片信息添加在数组末尾：

```json
{
    "path":"<图片文件名>",
    "x":<图片左上角x坐标>,
    "y":<图片左上角y坐标>,
    "skip":<是否跳过该图片(true/false)>
}
```

如果想从计划中删除某一图片，将该图片信息的 `skip` 属性设为 `true` 即可。

随后执行 `python ImageToData.py` 生成计划。

### token管理

注意，本脚本将会修改 `token.json` 文件，因此做好备份，如果意外发生，在启用日志服务的前提下，可以到 `paintboard.log` 中恢复 token。

要想将某一 token 加入 token 库中，打开 `token.json`，以以下形式，将 token 添加在数组末尾：

```json
"<token>"
```

脚本开始运行时将会自动加载 `token.json` 中的 token。

在 token 无效时，脚本将会自动删除 token，以避免占用资源。

如果启用了 HTTP 服务，也可以通过访问 HTTP 页面来在线地添加 token。

### 日志服务

如果启用日志服务，`paintboard.log` 中将会记录脚本运行情况。

不建议关闭，但这可能占用较多资源导致效率问题。

### HTTP服务

如果启用 HTTP 服务，脚本将会创建一个子进程用于执行 HTTP 服务器，以提供实时 token 添加以及方便的 token 收集服务。

HTTP 页面将会运行在 `httpserver.js` 的 `Options.port` 端口上，本地可以通过 `localhost:<port>` 或 `127.0.0.1:<port>` 访问，如果脚本运行在云服务器上，则可以访问服务器的 `port` 端口访问。

服务器将会返回 `index.html`，可以对其进行修改。

接受 token 的接口为 `/post`，格式为 FormData `token=<token>`。

注意，尽管脚本会自动删除无效 token，但服务器的安全措施仍然极其简陋，因此这可能带来严重的安全问题，请酌情使用。

### 多线程服务

考虑到在一些情况下 token 会共用，并导致严重的挤占问题，如果启用多线程服务，在发生 token 挤占时脚本将会启动一个子进程专门抢占某一 token 的使用权。

### 脚本设置

```js
main.js
Options={
    URL:"<冬日绘版URL/不要带上末尾斜杠>",
    Delay1:<token冷却延时/ms>,
    Delay2:<绘版、计划更新延时/ms>,
    Length:<绘版宽度/像素>,
    Height:<绘版高度/像素>,
    Colors:<颜色数/32>,
    Mode:<计划执行模式/0为顺序执行，1为随机执行>,
    Log:<日志服务/(true/false)>,
    Http:<HTTP服务/(true/false)>,
    Battle:<多线程服务/(true/false)>
};
```

```js
httpserver.js
Options={
    port:<服务器端口/8888>
};
```

```js
battle.js
Options={
    URL:"<冬日绘版URL/不要带上末尾斜杠>",
    Delay:<token重试延时/ms>
}
```



### 处理图像

于以下两项中选择一项：

#### GIMP

1. 将 `LuoguPaintBoard.gpl` 复制到 `GIMP安装路径\share\gimp\2.0\palettes`。
2. 用 GIMP 打开原始图片。
3. 图像 → 缩放图像。
4. 图像 → 模式 → 索引，Use custom palette：LuoguPaintBoard，**不要** 勾选“从颜色表中移除无用和重复的颜色”。“递色”选项可以自己试试看哪种效果比较好。
5. 文件 → 导出为 → 选一个路径 → 选择文件类型：**bmp** → 导出。

#### PS

1. 将`LuoguPaintBoard.irs` 复制到 `Photoshop安装路径\Presets\Optimized Settings`。
2. 用 Photoshop 打开原始图片。
3. 缩放图像。
4. Ctrl+Shift+Alt+S, 然后 Preset 选择 LuoguPaintBoard, Dither 自行选择。
5. 导出为 bmp 即可。