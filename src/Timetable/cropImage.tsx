import trimCanvas from "trim-canvas";

export default function cropImage(imageDataUri: string): string {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = imageDataUri;
    canvas.width = 1000;
    canvas.height = 1000;
    context?.drawImage(img, 0, 0);
    
    trimCanvas(canvas);
    return canvas.toDataURL('image/png');

}