import React, { ForwardedRef, MutableRefObject, Ref, forwardRef } from 'react';

const backColors = ['#a0522d', '#006400', '#708090', '#000080', '#ff0000', '#ffa500', '#ffff00', '#c71585', '#00ff00', '#00ffff',
'#0000ff', '#ff00ff', '#1e90ff', '#98fb98', '#ffdead'];
const blackForeColors = [false, false, false, false, false, true, true, false, true, true, false, false ,false, true, true];

function range(start: number, end: number): number[] {
    const result = [];
    for (let i = start; i <= end; i++)
        result.push(i);
    
    return result;
}

type Class = {
    name: string;
    professor: String;
    schedules: {
        location: string | null;
        times: {
            day: 0|1|2|3|4|5|6;
            timeStartsAt: number;
            timeEndsAt: number;
        }[];
    }[]
}

function getTextWidth(text: string, fontSize: number) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context == null) {
        return text.length * 7; // guess
    }
    context.font = `normal ${fontSize}px sans-serif`;
    const metrics = context.measureText(text);
    return metrics.width;
}

function svgTextWithLineBreak(text: string, x: number, fontSize: number, width: number, height: number): JSX.Element[] {
    const texts = ['']
    for (let i = 0; i < text.length; i++) {
        if (text[i] == '\n') {
            texts.push('')
            continue
        }

        if (getTextWidth(texts[texts.length - 1] + text[i], fontSize) < width) {
            texts[texts.length - 1] += text[i]
        } else {
            texts.push(text[i])
        }
    }

    const maxTspanLen = height / (fontSize * 1.2);
    if (texts.length > maxTspanLen) {
        texts.splice(maxTspanLen, texts.length - maxTspanLen);
    }

    return texts.map((i) => <tspan fontSize={`${fontSize}px`} x={x} dy="1.2em">{i}</tspan>)
}

function fitTspansIntoHeight(tspans: JSX.Element[], height: number) {
    let tmp = 0;
    const fitted = []
    for(let i = 0; i < tspans.length; i++) {
        const tspan = tspans[i];
        tmp += parseInt(/([0-9]+)/.exec(tspan.props["fontSize"])![0]) * 1.3;
        if (tmp > height) {
            return fitted
        } else {
            fitted.push(tspan)
        }
    }

    return fitted
}

function* getClassTimeslots(classes: Class[]) {
    const colHeight = 70; //px

    for (let i = 0; i < classes.length; i++) {
        const cls = classes[i];
        for (const schedule of cls.schedules) {
            for (const time of schedule.times) {
                const startingPeroid = (time.timeStartsAt - 8 * 60) / 60;
                const endingPeroid = (time.timeEndsAt - 8 * 60) / 60;
                const periodLength = endingPeroid - startingPeroid;

                const x = time.day * 70 + 70;
                const y = 40 + colHeight * startingPeroid;
                const height = colHeight * periodLength;

                const tspan = fitTspansIntoHeight(svgTextWithLineBreak(`${cls.name}\n${cls.professor}`, x + 65, 12, 63, height).concat(
                    svgTextWithLineBreak(schedule.location ?? '', x + 65, 10, 63, height)
                ), height)

                yield <g x={x} y={y}>
                    <rect x={x} y={y} height={height} width="70px" fill={backColors[i]} strokeWidth="0.5px"></rect>
                    <text fill={blackForeColors[i] ? 'black' : 'white'} textAnchor='end' x={x + 60} y={y + 5} fontSize="14px" dominantBaseline='hagging'>
                        {tspan}
                    </text>
                </g>
            }
        }
    }
}

const timetable = forwardRef(function (opts: {classes: Class[]}, ref: ForwardedRef<SVGSVGElement>)  {
    const days = ['월','화','수','목','금','토','일'];

    const slots = []
    const timeslotIt = getClassTimeslots(opts.classes)
    while (true) {
        const itResult = timeslotIt.next()
        if (itResult.done) {
            break
        } else {
            slots.push(itResult.value)
        }
    }

    return <svg ref={ref} width={(days.length + 1) * 70} viewBox={`0 0 ${(days.length + 1) * 70} 950`}>
            <g id="days">
                <rect fill='whitesmoke' x={0} y={0} width={70} height={40} strokeWidth="0.5px" stroke='#404040'>
                </rect>
                {days.map((i, idx) => <g key={idx}>
                        <rect fill='whitesmoke' x={(idx + 1) * 70} y={0} width={70} height={40} strokeWidth="0.5px" stroke='#404040'></rect>
                        <text fontSize='14px' fill='black' dominantBaseline="hagging" x={(idx + 1) * 70 + 28} y={25}>
                            {i} 
                        </text>
                    </g>)}
            </g>
            <g id="times">
                {range(0, 12).map((time, idx) => 
                    <g key={idx}>
                        <rect y={40 + 70 * (idx)} x={0} width="70px" height="70px" fill="whitesmoke" strokeWidth="0.5px" stroke='#404040'></rect>
                        <text y={40 + 70 * (idx) + 15} textAnchor='end'>
                            <tspan x={65}>{time + 8}:00</tspan>
                            <tspan x={65} dy={14}>({time}교시)</tspan>
                        </text>
                </g>)}
            </g>
            <rect fill='#e4e4e4' x={70} y={40} width={days.length * 70} height="910px"></rect>
            {slots}
    </svg>
});

export default timetable;