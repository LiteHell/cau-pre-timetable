import Timetable, { Class } from ".";
import ReactDOM from 'react-dom/client';
import domToImage from 'dom-to-image';
import cropImage from "./cropImage";

export default function timetableToImage(classes: Class[], onRendered: (result: string) => void): void {
    const rootDom = document.createElement('div');
    const secondRoot = document.createElement('div');
    rootDom.appendChild(secondRoot);
    const timetable = Timetable({ classes });
    rootDom.className = "for-timetable-image-creation"
    rootDom.style.display = '';
    document.querySelectorAll('link, style').forEach(i => rootDom.appendChild(i.cloneNode(true)));
    const root = ReactDOM.createRoot(secondRoot);
    root.render(timetable);
    setTimeout(async () => {
        const imageDataUri = await domToImage.toPng(rootDom, {
            width: 600,
            height: 1000
        });

        onRendered(cropImage(imageDataUri));
    }, 50);
}