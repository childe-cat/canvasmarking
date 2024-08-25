/**
 * 画笔类
 * @param imageUrl 图片地址
 * @param hasText 是否有文字
 * @param textDirection 文字方向
 * @param markers 标注列表
 */
interface Options {
    imageUrl: string;
    hasText: boolean;
    textDirection: string;
    markers: Array<marker>;
}

interface marker {
    x: number;
    y: number;
    guid: string;
    name: string | null;
    markerType: string | "circle";
    markerColor: string | "#FF0000";
    markerRadius: number | 12;
    markerLineWidth: number | 1;
    options: any
}

class CanvasMarking {
    private imageUrl: string;

    private scale: number = 1;
    private lastX: number = 0;
    private lastY: number = 0;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private radius: number = 1;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private image: HTMLImageElement;
    private hasText: boolean;
    private textDirection : string;
    private markers: Array<marker>;

    /**
     * 画笔类
     * @param canvasId canvas的id
     * @param options 配置项，可选项包括图片地址、画笔类型、画笔颜色
     */
    constructor(canvasId: string, options: Options) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.imageUrl = options.imageUrl;
        this.hasText = options.hasText || false;
        this.textDirection = options.textDirection || 'right';
        this.markers = options.markers;
        this.image = new Image() as HTMLImageElement;
        this.image.onload = () => {
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;
            if (this.canvas && this.ctx) {
                this.drawImage();
            } else {
                console.error('canvasId错误,未找到canvas元素.');
            }
        }
        this.image.src = this.imageUrl;
    }

    drawImage(): void {
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height)
        const width =this.image.width * this.scale;
        const height =this.image.height * this.scale;
        this.ctx?.drawImage(this.image, this.offsetX, this.offsetY, width, height);
        this.markers.forEach((marker) => {
            this.drawMarker(marker)
        });
    }

    //绘制标注
    drawMarker(marker: marker){
        this.ctx.lineWidth = marker.markerLineWidth;
        this.ctx.strokeStyle = marker.markerColor;
        this.ctx.beginPath()
        switch (marker.markerType) {
            case 'circle':
                this.ctx.arc(marker.x, marker.y, marker.markerRadius, 0, Math.PI * 2);
                break;
            case 'triangle':
                this.ctx.moveTo(marker.x, marker.y - marker.markerRadius);
                this.ctx.lineTo(marker.x - marker.markerRadius, marker.y + marker.markerRadius);
                this.ctx.lineTo(marker.x + marker.markerRadius, marker.y + marker.markerRadius);
                break;
            case 'square':
                this.ctx.rect(marker.x - marker.markerRadius, marker.y - marker.markerRadius, marker.markerRadius * 2, marker.markerRadius * 2)
                break;
            default:
                this.ctx.arc(marker.x, marker.y, marker.markerRadius, 0, Math.PI * 2);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        if(this.hasText){
            this.ctx.font = '12px Georgia';
            const markerName = ''
            this.ctx.fillText(marker.name || markerName, marker.x + marker.markerRadius + 6, marker.y + marker.markerRadius);
            switch (this.textDirection) {
                case 'right':
                    this.ctx.fillText(marker.name || markerName, marker.x + marker.markerRadius + 6, marker.y + marker.markerRadius);
                    break;
                case 'left':
                    this.ctx.fillText(marker.name || markerName, marker.x - marker.markerRadius - 6 - this.ctx.measureText(marker.name || '').width, marker.y + marker.markerRadius);
                    break;
                case 'top':
                    this.ctx.fillText(marker.name || markerName, marker.x + marker.markerRadius + 6, marker.y - marker.markerRadius)
                    break;
                case 'bottom':
                    this.ctx.fillText(marker.name || markerName, marker.x + marker.markerRadius + 6, marker.y + marker.markerRadius + 12)
                    break;
                    default:
                        this.ctx.fillText(marker.name || markerName, marker.x + marker.markerRadius + 6, marker.y + marker.markerRadius);
            }
        }
    }

}

