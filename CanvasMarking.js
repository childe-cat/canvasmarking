"use strict";
class CanvasMarking {
    /**
     * 画笔类
     * @param canvasId canvas的id
     * @param options 配置项，可选项包括图片地址、画笔类型、画笔颜色
     */
    constructor(canvasId, options) {
        this.scale = 1;
        this.lastX = 0;
        this.lastY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.clickFlag = true;
        this.draggingFlag = false;
        this.animationFrameId = null;
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
        this.markerType = options.markerType || 'circle';
        this.markerColor = options.markerColor || '#FF0000';
        this.markerRadius = options.markerRadius || 4;
        this.markerLineWidth = options.markerLineWidth || 2;
        this.hasText = options.hasText || false;
        this.textDirection = options.textDirection || 'right';
        this.autoScaleMarker = options.autoScaleMarker || false;
        this.imageLoadWay = options.imageLoadWay || 'none';
        this.clickMethod = options.clickMethod;
        this.drawWidth = 0;
        this.drawHeight = 0;
        this.loadImage();
    }
    /**
     * 注册事件
     */
    initEvent() {
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseout', this.handleMouseOut.bind(this));
    }
    /**
     * 加载图片
     */
    loadImage() {
        this.image = new Image();
        this.image.onload = () => {
            if (this.imageLoadWay === 'none') {
                // 获取 canvas 的显示大小
                const rect = this.canvas.getBoundingClientRect();
                const canvasWidth = rect.width;
                const canvasHeight = rect.height;
                // 将 canvas 的 width 和 height 设置为与 CSS 定义的大小一致
                this.canvas.width = canvasWidth;
                this.canvas.height = canvasHeight;
                // 获取图片的原始宽高
                const imgWidth = this.image.width;
                const imgHeight = this.image.height;
                // 计算图片的缩放比例
                const scaleX = canvasWidth / imgWidth;
                const scaleY = canvasHeight / imgHeight;
                const scale = Math.min(scaleX, scaleY);
                // 根据缩放比例设置图片在 canvas 中的宽高
                this.drawWidth = imgWidth * scale;
                this.drawHeight = imgHeight * scale;
                // 计算偏移量，使图片居中显示
                this.offsetX = (canvasWidth - this.drawWidth) / 2;
                this.offsetY = (canvasHeight - this.drawHeight) / 2;
            }
            else if (this.imageLoadWay === 'fill') {
                this.canvas.width = this.image.width;
                this.canvas.height = this.image.height;
                this.drawWidth = this.canvas.width;
                this.drawHeight = this.canvas.height;
            }
            this.drawImage();
            this.initEvent();
        };
        this.image.src = this.imageUrl + '?p=' + Math.random().toString().replace('.', '');
    }
    /**
     * 绘制图片
     */
    drawImage() {
        var _a, _b;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const width = this.drawWidth * this.scale;
        const height = this.drawHeight * this.scale;
        (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.drawImage(this.image, this.offsetX, this.offsetY, width, height);
        this.markers.forEach((marker) => {
            this.drawMarker(marker);
        });
    }
    /**
     * 绘制标注
     * @param marker 标注对象
     */
    drawMarker(marker) {
        this.ctx.lineWidth = marker.markerLineWidth;
        this.ctx.strokeStyle = marker.markerColor;
        this.ctx.beginPath();
        const x = marker.x * this.scale + this.offsetX;
        const y = marker.y * this.scale + this.offsetY;
        const r = this.autoScaleMarker ? marker.markerRadius * this.scale : marker.markerRadius;
        //画笔类型
        switch (marker.markerType) {
            case 'circle':
                this.ctx.arc(x, y, r, 0, Math.PI * 2);
                break;
            case 'triangle':
                this.ctx.moveTo(x, y - r);
                this.ctx.lineTo(x - r, y + r);
                this.ctx.lineTo(x + r, y + r);
                break;
            case 'square':
                this.ctx.rect(x - r, y - r, r * 2, r * 2);
                break;
            default:
                this.ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        if (this.hasText) {
            this.ctx.font = '12px Georgia';
            const markerName = '';
            this.ctx.fillText(marker.name || markerName, x + r + 6, y + r);
            //文字方向
            switch (this.textDirection) {
                case 'right':
                    this.ctx.fillText(marker.name || markerName, x + r + 6, y + r);
                    break;
                case 'left':
                    this.ctx.fillText(marker.name || markerName, x - r - 6 - this.ctx.measureText(marker.name || '').width, y + r);
                    break;
                case 'top':
                    this.ctx.fillText(marker.name || markerName, x + r + 6, y - r);
                    break;
                case 'bottom':
                    this.ctx.fillText(marker.name || markerName, x + r + 6, y + r + 12);
                    break;
                default:
                    this.ctx.fillText(marker.name || markerName, x + r + 6, y + r);
            }
        }
    }
    /**
     * 鼠标点击监听事件，新增一个标注
     * @param e
     */
    handleClick(e) {
        if (e.target === this.canvas && this.clickFlag) {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = ((e.clientX - rect.left) * scaleX - this.offsetX) / this.scale;
            const y = ((e.clientY - rect.top) * scaleY - this.offsetY) / this.scale;
            const newMarker = {
                x,
                y,
                uuid: '',
                name: '',
                markerType: this.markerType,
                markerRadius: this.markerRadius,
                markerColor: this.markerColor,
                markerLineWidth: this.markerLineWidth,
                options: {}
            };
            this.clickMethod && this.clickMethod(newMarker);
            this.markers.push(newMarker);
            this.drawImage();
        }
    }
    /**
     * 鼠标滚轮监听事件，缩放canvas图像
     */
    handleWheel(e) {
        if (e.target === this.canvas) {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            const preScale = this.scale;
            if (e.deltaY < 0) {
                this.scale *= 1.1;
            }
            else {
                this.scale /= 1.1;
            }
            const scaleChange = this.scale / preScale;
            this.offsetX -= (mouseX - this.offsetX) * (scaleChange - 1);
            this.offsetY -= (mouseY - this.offsetY) * (scaleChange - 1);
            this.drawImage();
        }
    }
    /**
     * 鼠标按下监听事件，获取按下鼠标位置
     */
    handleMouseDown(e) {
        this.draggingFlag = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }
    /**
     * 鼠标移动监听事件，拖动canvas图像
     */
    handleMouseMove(e) {
        if (this.draggingFlag) {
            this.clickFlag = false;
            const x = e.clientX - this.lastX;
            const y = e.clientY - this.lastY;
            this.offsetX += x;
            this.offsetY += y;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            if (this.animationFrameId !== null) {
                cancelAnimationFrame(this.animationFrameId);
            }
            // 使用requestAnimationFrame来绘制图像
            this.animationFrameId = requestAnimationFrame(() => {
                this.drawImage();
                this.animationFrameId = null; // 重置动画帧ID
            });
        }
    }
    /**
     * 鼠标抬起监听事件，允许点击
     */
    handleMouseUp() {
        this.draggingFlag = false;
        setTimeout(() => {
            this.clickFlag = true;
        }, 1);
    }
    /**
     * 鼠标移出监听事件，停止拖拽
     */
    handleMouseOut() {
        this.draggingFlag = false;
    }
    /**
     * 删除所有标注
     */
    deleteAll() {
        this.markers = [];
        this.drawImage();
    }
    /**
     * 删除指定标注
     */
    deleteMarker({ name, value }) {
        this.markers = this.markers.filter(marker => {
            return name ? marker.options[name] !== value : marker.uuid !== value;
        });
        this.drawImage();
    }
    /**
     * 获取所有标注
     */
    getMarkers() {
        return this.markers;
    }
}
