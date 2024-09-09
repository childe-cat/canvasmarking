# CanvasMarking
### canvas轻量图片标注功能，暂时只支持圆形，正方形，三角形标记点
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


- **artMethod**: `string`
  绘画方式,默认为 "single""，可选值：
    - **single**: 单击进行标注
    - **downDrag**: 鼠标按住拖拽进行标注，拖拽结束后，自动完成标注，按键与draggingButton取反，draggingButton为both时，强制single模式


- **markerType**: `string`  
  标注的类型，默认为 "circle"，可选值：
    - **circleHollow**: 圆形空心标记点,single模式为正圆，artMethod为downDrag时可绘制椭圆
    - **triangleHollow**: 三角形空心标记点，single模式为等边三角形，artMethod为downDrag时可绘制等腰三角形
    - **squareHollow**: 方形空心标记点，single模式为正方形，artMethod为downDrag时可绘制长方形
  - **circleSolid**: 圆形实心标记点
  - **triangleSolid**: 三角形实心标记点
  - **squareSolid**: 方形实心标记点


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


- **isScale**: `boolean`  
  是否开启滚落缩放，默认为 `true`。


- **isDragging**: `boolean`  
  是否开启移动拖拽，默认为 `true`。


- **draggingButton**: `boolean`  
  拖拽按键，默认为 `both`，鼠标左右键都可以拖拽图片，可选值：
  - **both**: 双键
  - **left**: 左键
  - **right**: 右键


- **clickMethod**: `function`  
  点击标注时触发的额外事件处理方法或函数，用以设置标注信息。

### 示例用法
```js
/**
 * 点击标注时触发的额外事件处理方法或函数，用以设置标注信息。
 * 可以给 marker 修改属性，如 name, uuid, option 等。
 * @param marker
 */
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
    
