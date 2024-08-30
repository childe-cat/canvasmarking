# CanvasMarking
### canvas轻量图片标注功能
## 1.引入CanvasMarking.js文件
```js
<script src="CanvasMarking.js"></script>
```

## 2.调用方法
```js
const canvas = new CanvasMarking('canvasId',options);
```

## 3.内置函数
```js
/**
 * 获取所有标注点信息
 */
canvas.getMarkers();

/**
 * 删除所有标记信息
 */
canvas.deleteAll();

/**
 * param {string} value 值
 * param {string} name? 标记点名称,默认为uuid,可选自定义marker.options中任意值
 */
canvas.deleteMarker({value, name});//删除指定标注点
```

## 4. `options` 参数

### 必填参数

- **imageUrl**: `string`  
  指定标注所用的图片地址。


- **markers**: `array`  
  包含一个或多个标记点的经纬度信息。

### 选填参数
- **imageLoadWay**: `string`
  图片加载的方式，默认为 "none"，可选值：
    - **none**: 图片居中显示，大小超出canvas大小时，等比例缩小，直到图片能完全显示
    - **fill**: 图片平铺canvas画框

- **markerType**: `string`  
  标注的类型，默认为 "circle"，可选值：
    - **circle**: 圆形标记点
    - **triangle**: 圆形标记点
    - **square**: 正方形标记点


- **markerColor**: `string`  
  标注的颜色。


- **markerRadius**: `number`  
  标注的半径大小。


- **markerLineWidth**: `number`  
  标注边框的线宽。


- **hasText**: `boolean`  
  标注是否包含文字，默认为 `false`。


- **textDirection**: `string`  
  文字的方向，默认为 "right"。 


- **autoScaleMarker**: `boolean`  
  标记是否跟随图片缩放，默认为 `false`。 


- **clickMethod**: `function`  
  点击标注时触发的额外事件处理方法或函数，用以设置标注信息。

### 示例用法
```js
function handleMarkerClick(marker) {
    marker.name = 'Marker Name';
    marker.uuid = '1234567890';
    marker.option = {}
}
let markers = [];
let imageUrl = '';
const options = {
    imageUrl: imageUrl,
    markers: markers,
    clickMethod: handleMarkerClick
    }
```
    
