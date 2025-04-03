var CanvasMarking = /** @class */ (function () {
    /**
     * 画笔类
     * @param canvasId canvas的id
     * @param options 配置项，可选项包括图片地址、画笔类型、画笔颜色
     */
    function CanvasMarking(canvasId, options) {
        this.scale = 1;
        this.lastX = 0;
        this.lastY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.clickFlag = true;
        this.draggingFlag = false;
        this.isLine = false;
        this.todaySMarker = null;
        this.timeInterval = null;
        this.animationFrameId = null;
        this.casualMarkerId = null;
        this.casualMarker = null;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        if (!this.canvas) {
            throw new Error('canvasId错误,未找到canvas元素');
        }
        if (!options.markers) {
            throw new Error('markers不能为空');
        }
        this.imageUrl = options.imageUrl;
        this.markers = options.markers;
        this.artMethod = options.artMethod || 'single';
        if (this.artMethod === 'downDrag') {
            this.casualMarker = {
                positionOld: [0, 0],
                positionNew: [0, 0]
            };
        }
        this.markerType = options.markerType || 'circleHollow';
        this.markerColor = options.markerColor || '#FF0000';
        this.markerRadius = [options.markerRadius || 4];
        this.markerLineWidth = options.markerLineWidth || 2;
        this.hasText = options.hasText || false;
        this.textDirection = options.textDirection || 'right';
        this.autoScaleMarker = options.autoScaleMarker || false;
        this.isScale = options.isScale || true;
        this.isDragging = options.isScale || true;
        this.imageLoadWay = options.imageLoadWay || 'none';
        this.draggingButton = options.draggingButton || 'both';
        this.clickMethod = options.clickMethod;
        this.drawWidth = 0;
        this.drawHeight = 0;
        this.loadImage();
    }
    /**
     * 注册事件
     */
    CanvasMarking.prototype.initEvent = function () {
        this.canvas.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        });
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        if (this.isScale) {
            this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        }
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        if (this.isDragging) {
            this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        }
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseout', this.handleMouseOut.bind(this));
    };
    /**
     * 加载图片
     */
    CanvasMarking.prototype.loadImage = function () {
        var _this = this;
        this.image = new Image();
        this.image.onload = function () {
            if (_this.imageLoadWay === 'none') {
                // 获取 canvas 的显示大小
                var rect = _this.canvas.getBoundingClientRect();
                var canvasWidth = rect.width;
                var canvasHeight = rect.height;
                // 将 canvas 的 width 和 height 设置为与 CSS 定义的大小一致
                _this.canvas.width = canvasWidth;
                _this.canvas.height = canvasHeight;
                // 获取图片的原始宽高
                var imgWidth = _this.image.width;
                var imgHeight = _this.image.height;
                // 计算图片的缩放比例
                var scaleX = canvasWidth / imgWidth;
                var scaleY = canvasHeight / imgHeight;
                var scale = Math.min(scaleX, scaleY);
                // 根据缩放比例设置图片在 canvas 中的宽高
                _this.drawWidth = imgWidth * scale;
                _this.drawHeight = imgHeight * scale;
                // 计算偏移量，使图片居中显示
                _this.offsetX = (canvasWidth - _this.drawWidth) / 2;
                _this.offsetY = (canvasHeight - _this.drawHeight) / 2;
            }
            else if (_this.imageLoadWay === 'fill') {
                _this.canvas.width = _this.image.width;
                _this.canvas.height = _this.image.height;
                _this.drawWidth = _this.canvas.width;
                _this.drawHeight = _this.canvas.height;
            }
            _this.drawImage();
            _this.initEvent();
        };
        this.image.src = this.imageUrl + '?p=' + Math.random().toString().replace('.', '');
    };
    /**
     * 绘制图片
     */
    CanvasMarking.prototype.drawImage = function () {
        var _this = this;
        var _a, _b;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var width = this.drawWidth * this.scale;
        var height = this.drawHeight * this.scale;
        (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.drawImage(this.image, this.offsetX, this.offsetY, width, height);
        this.markers.forEach(function (marker) {
            _this.drawMarker(marker);
        });
    };
    /**
     * 绘制标注
     * @param marker 标注对象
     * @param exportCtx
     */
    CanvasMarking.prototype.drawMarker = function (marker, exportCtx) {
        var _this = this;
        var ctx = exportCtx || this.ctx;
        ctx.lineWidth = marker.markerLineWidth;
        ctx.strokeStyle = marker.markerColor;
        ctx.fillStyle = marker.markerColor;
        ctx.beginPath();
        var x = marker.position[0][0] * this.scale + this.offsetX;
        var y = marker.position[0][1] * this.scale + this.offsetY;
        var r = this.autoScaleMarker ? marker.markerRadius[0] * this.scale : marker.markerRadius[0];
        var r2 = this.autoScaleMarker ? marker.markerRadius[1] * this.scale : marker.markerRadius[1];
        //画笔类型
        switch (marker.markerType) {
            case 'circleHollow':
                if (this.artMethod === 'single') {
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                }
                else if (this.artMethod === 'downDrag') {
                    ctx.ellipse(x, y, r, r2, 0, 0, Math.PI * 2);
                }
                break;
            case 'triangleHollow':
                if (this.artMethod === 'single') {
                    ctx.moveTo(x, y - r);
                    ctx.lineTo(x - r, y + r);
                    ctx.lineTo(x + r, y + r);
                }
                else if (this.artMethod === 'downDrag') {
                    marker.position.forEach(function (p, i) {
                        if (i === 0) {
                            ctx.moveTo(p[0] * _this.scale + _this.offsetX, p[1] * _this.scale + _this.offsetY);
                        }
                        else {
                            ctx.lineTo(p[0] * _this.scale + _this.offsetX, p[1] * _this.scale + _this.offsetY);
                        }
                    });
                }
                break;
            case 'squareHollow':
                if (this.artMethod === 'single') {
                    ctx.rect(x - r, y - r, r * 2, r * 2);
                }
                else if (this.artMethod === 'downDrag') {
                    ctx.rect(x, y, r, r2);
                }
                break;
            case 'circleSolid':
                if (this.artMethod === 'single') {
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                }
                else if (this.artMethod === 'downDrag') {
                    ctx.ellipse(x, y, r, r2, 0, 0, Math.PI * 2);
                }
                ctx.fill();
                break;
            case 'triangleSolid':
                if (this.artMethod === 'single') {
                    ctx.moveTo(x, y - r);
                    ctx.lineTo(x - r, y + r);
                    ctx.lineTo(x + r, y + r);
                }
                else if (this.artMethod === 'downDrag') {
                    marker.position.forEach(function (p, i) {
                        if (i === 0) {
                            ctx.moveTo(p[0] * _this.scale + _this.offsetX, p[1] * _this.scale + _this.offsetY);
                        }
                        else {
                            ctx.lineTo(p[0] * _this.scale + _this.offsetX, p[1] * _this.scale + _this.offsetY);
                        }
                    });
                }
                ctx.fill();
                break;
            case 'squareSolid':
                if (this.artMethod === 'single') {
                    ctx.rect(x - r, y - r, r * 2, r * 2);
                }
                else if (this.artMethod === 'downDrag') {
                    ctx.rect(x, y, r, r2);
                }
                ctx.fill();
                break;
            case 'line':
                //未完成,点连成线即可
                break;
            default:
                ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.stroke();
        if (this.hasText) {
            ctx.font = '12px Georgia';
            var markerName = '';
            ctx.fillText(marker.name || markerName, x + r + 6, y + r);
            //文字方向
            switch (this.textDirection) {
                case 'right':
                    ctx.fillText(marker.name || markerName, x + r + 6, y + r);
                    break;
                case 'left':
                    ctx.fillText(marker.name || markerName, x - r - 6 - ctx.measureText(marker.name || '').width, y + r);
                    break;
                case 'top':
                    ctx.fillText(marker.name || markerName, x + r + 6, y - r);
                    break;
                case 'bottom':
                    ctx.fillText(marker.name || markerName, x + r + 6, y + r + 12);
                    break;
                default:
                    ctx.fillText(marker.name || markerName, x + r + 6, y + r);
            }
        }
    };
    /**
     * 计算缩放后的坐标
     * @param e
     */
    CanvasMarking.prototype.getScalePosition = function (e) {
        var rect = this.canvas.getBoundingClientRect();
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        var x = ((e.clientX - rect.left) * scaleX - this.offsetX) / this.scale;
        var y = ((e.clientY - rect.top) * scaleY - this.offsetY) / this.scale;
        return { x: x, y: y };
    };
    /**
     * 鼠标点击监听事件，新增一个标注
     * @param e
     */
    CanvasMarking.prototype.handleClick = function (e) {
        var _a;
        if (e.target === this.canvas && this.clickFlag) {
            var _b = this.getScalePosition(e), x = _b.x, y = _b.y;
            //直线绘制逻辑（先重置当前标记点，再存储点击的坐标点，右键点击结束绘制）
            if (this.markerType === 'line') {
                if (!this.isLine) {
                    this.restMarker();
                    this.isLine = true;
                }
                (_a = this.todaySMarker) === null || _a === void 0 ? void 0 : _a.position.push([x, y]);
                this.drawMarker(this.todaySMarker);
                if (e.button === 2) {
                    this.isLine = false;
                    this.markers.push(this.todaySMarker);
                    this.drawImage();
                }
                return;
            }
            var position = [[x, y]];
            var newMarker = {
                position: position,
                uuid: this.generateUUID(),
                name: '',
                markerType: this.markerType,
                markerRadius: this.markerRadius,
                markerColor: this.markerColor,
                markerLineWidth: this.markerLineWidth,
                artMethod: 'single',
                options: {}
            };
            this.clickMethod && this.clickMethod(newMarker);
            // if(this.markers.findIndex((marker) => marker.uuid === newMarker.uuid)>=0){
            //     throw new Error('uuid重复')
            // }
            this.markers.push(newMarker);
            this.drawImage();
        }
    };
    /**
     * 鼠标滚轮监听事件，缩放canvas图像
     */
    CanvasMarking.prototype.handleWheel = function (e) {
        if (e.target === this.canvas) {
            e.preventDefault();
            var rect = this.canvas.getBoundingClientRect();
            var mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            var mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            var preScale = this.scale;
            if (e.deltaY < 0) {
                this.scale *= 1.1;
            }
            else {
                this.scale /= 1.1;
            }
            var scaleChange = this.scale / preScale;
            this.offsetX -= (mouseX - this.offsetX) * (scaleChange - 1);
            this.offsetY -= (mouseY - this.offsetY) * (scaleChange - 1);
            this.drawImage();
        }
    };
    /**
     * 鼠标按下监听事件，获取按下鼠标位置
     */
    CanvasMarking.prototype.handleMouseDown = function (e) {
        switch (this.draggingButton) {
            case 'both':
                this.draggingFlag = true;
                break;
            case 'left':
                this.draggingFlag = e.buttons === 1;
                break;
            case 'right':
                this.draggingFlag = e.buttons === 2;
                break;
        }
        //拖拽生成标注，获取初始位置
        if (!this.draggingFlag && this.artMethod === 'downDrag') {
            var _a = this.getScalePosition(e), x = _a.x, y = _a.y;
            this.casualMarker = {
                positionOld: [x, y],
                positionNew: [x, y]
            };
        }
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    };
    /**
     * 鼠标移动监听事件，拖动canvas图像
     */
    CanvasMarking.prototype.handleMouseMove = function (e) {
        var _this = this;
        //每次只执行一次帧渲染，减少性能开销
        //正常拖拽的帧渲染
        var draggingAnimate = function () {
            if (_this.animationFrameId !== null) {
                cancelAnimationFrame(_this.animationFrameId);
            }
            // 使用requestAnimationFrame来绘制图像
            _this.animationFrameId = requestAnimationFrame(function () {
                _this.drawImage();
                _this.animationFrameId = null; // 重置动画帧ID
            });
        };
        //绘制直线时鼠标移动的帧渲染
        var moveAnimate = function () {
            if (_this.animationFrameId !== null) {
                cancelAnimationFrame(_this.animationFrameId);
            }
            _this.animationFrameId = requestAnimationFrame(function () {
                _this.drawMarker(_this.todaySMarker);
                _this.animationFrameId = null; // 重置动画帧ID
            });
        };
        if (this.isLine) {
            moveAnimate();
            return;
        }
        //拖拽图片时确保图片和标注正确设置
        if (this.draggingFlag) {
            this.clickFlag = false;
            var x = e.clientX - this.lastX;
            var y = e.clientY - this.lastY;
            this.offsetX += x;
            this.offsetY += y;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            draggingAnimate();
        }
        else {
            //拖拽生成标注
            if (this.artMethod === 'downDrag' && ((this.draggingButton === 'left' && e.buttons === 2) || (this.draggingButton === 'right' && e.buttons === 1))) {
                this.clickFlag = false;
                var _a = this.getScalePosition(e), x = _a.x, y = _a.y;
                //获取鼠标当前落点
                this.casualMarker.positionNew = [x, y];
                if (x < this.casualMarker.positionOld[0] || y < this.casualMarker.positionOld[1]) {
                    throw new Error('坐标错误,结束点坐标不应该小于开始点坐标');
                }
                var position_1 = [[this.casualMarker.positionOld[0], this.casualMarker.positionOld[1]]];
                var markerRadius_1 = [(this.casualMarker.positionNew[0] - this.casualMarker.positionOld[0]), (this.casualMarker.positionNew[1] - this.casualMarker.positionOld[1])];
                if (this.markerType === 'triangleHollow' || this.markerType === 'triangleSolid') {
                    var xr = this.casualMarker.positionNew[0] - this.casualMarker.positionOld[0];
                    position_1.push([this.casualMarker.positionNew[0], this.casualMarker.positionNew[1]]);
                    position_1.push([this.casualMarker.positionOld[0] - xr, this.casualMarker.positionNew[1]]);
                }
                //配置标注
                if (this.casualMarkerId === null) {
                    this.casualMarkerId = this.generateUUID();
                    var newMarker = {
                        position: position_1,
                        uuid: this.casualMarkerId,
                        name: '',
                        markerType: this.markerType,
                        artMethod: 'downDrag',
                        markerRadius: markerRadius_1,
                        markerColor: this.markerColor,
                        markerLineWidth: this.markerLineWidth,
                        options: {}
                    };
                    this.markers.push(newMarker);
                }
                else {
                    this.markers.forEach(function (marker) {
                        if (marker.uuid === _this.casualMarkerId) {
                            marker.position = position_1;
                            marker.markerRadius = markerRadius_1;
                        }
                    });
                }
                this.drawImage();
            }
        }
    };
    /**
     * 鼠标抬起监听事件，允许点击
     */
    CanvasMarking.prototype.handleMouseUp = function () {
        var _this = this;
        this.draggingFlag = false;
        if (this.casualMarkerId != null) {
            this.clickMethod && this.clickMethod(this.markers.filter(function (marker) { return marker.uuid === _this.casualMarkerId; })[0]);
            this.drawImage();
            this.casualMarkerId = null;
        }
        setTimeout(function () {
            _this.clickFlag = true;
        }, 1);
    };
    /**
     * 鼠标移出监听事件，停止拖拽
     */
    CanvasMarking.prototype.handleMouseOut = function () {
        this.draggingFlag = false;
    };
    /**
     * 删除所有标注
     */
    CanvasMarking.prototype.deleteAll = function () {
        this.markers = [];
        this.drawImage();
    };
    /**
     * 删除指定标注
     */
    CanvasMarking.prototype.deleteMarker = function (_a) {
        var name = _a.name, value = _a.value;
        this.markers = this.markers.filter(function (marker) {
            return name ? marker.options[name] !== value : marker.uuid !== value;
        });
        this.drawImage();
    };
    /**
     * 获取所有标注
     */
    CanvasMarking.prototype.getMarkers = function () {
        return this.markers;
    };
    /**
     * 导出图片
     * @param exportMode 导出模式，可选值：'hasImage'、'noImage'，默认为'hasImage'
     */
    CanvasMarking.prototype.exportImage = function (exportMode) {
        var _this = this;
        if (exportMode === 'noImage') {
            var newCanvas = document.createElement('canvas');
            newCanvas.width = this.canvas.width;
            newCanvas.height = this.canvas.height;
            var newCtx_1 = newCanvas.getContext('2d');
            this.markers.forEach(function (marker) {
                _this.drawMarker(marker, newCtx_1);
            });
            return newCanvas.toDataURL("image/png");
        }
        return this.canvas.toDataURL("image/png");
    };
    /**
     * 导出绘制区域图片
     */
    CanvasMarking.prototype.exportDrawImage = function (rect) {
        var tempCanvas = document.createElement('canvas');
        var tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;
        tempCanvas.style.border = '2px solid red';
        var x = rect.x * this.scale + this.offsetX;
        var y = rect.y * this.scale + this.offsetY;
        tempCtx.drawImage(this.canvas, x, y, rect.width * this.scale, rect.height * this.scale, 0, 0, rect.width, rect.height);
        return tempCanvas.toDataURL('image/png');
    };
    /**
     * 重置当前标注(todaySMarker为当前执行绘画（绘制线条和自由绘画，其他标记不使用todaySMarker）时的标记，每次绘画时需要重置)
     */
    CanvasMarking.prototype.restMarker = function () {
        this.todaySMarker = {
            position: [],
            uuid: this.generateUUID(),
            name: 'newMarker',
            markerType: this.markerType,
            markerRadius: this.markerRadius,
            markerColor: this.markerColor,
            markerLineWidth: this.markerLineWidth,
            artMethod: this.artMethod,
            options: {}
        };
    };
    /**
     * 生成uuid
     */
    CanvasMarking.prototype.generateUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };
    return CanvasMarking;
}());
