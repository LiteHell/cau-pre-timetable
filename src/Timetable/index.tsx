import classnames from 'classnames';
import React from 'react';
import styles from './timetable.module.css';

const backColors = ['#a0522d', '#006400', '#708090', '#000080', '#ff0000', '#ffa500', '#ffff00', '#c71585', '#00ff00', '#00ffff',
'#0000ff', '#ff00ff', '#1e90ff', '#98fb98', '#ffdead'];
const blackForeColors = [false, false, false, false, false, true, true, false, true, true, false, false ,false, true, true];

function range(start: number, end: number): number[] {
    const result = [];
    for (let i = start; i <= end; i++)
        result.push(i);
    
    return result;
}

export type Class = {
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

function getMatchedCol(classes: Class[], day: number, classPeriod: number) {
    const startsAt = classPeriod * 60 + 8 * 60;
    const endsAt = startsAt + 60;
    const colHeight = 5; // em

    for (let i = 0; i < classes.length; i++) {
        const cls = classes[i];
        for (const schedule of cls.schedules) {
            for (const time of schedule.times) {
                if (time.timeStartsAt > endsAt || time.timeEndsAt < startsAt || time.day !== day)
                    continue;

                const firstPart = time.timeStartsAt >= startsAt;
                const beforeStart = time.timeStartsAt <= startsAt ? 0 : time.timeStartsAt - startsAt;
                const classLen = (time.timeEndsAt <= endsAt ? time.timeEndsAt : endsAt) - (time.timeStartsAt >= startsAt ? time.timeStartsAt : startsAt);
                const afterEnd = time.timeEndsAt >= endsAt ? 0 : endsAt - time.timeEndsAt;
                console.log(beforeStart, classLen, afterEnd);

                if (classLen === 0)
                    continue;

                return <div className={styles.timeslot}>
                    {beforeStart > 0 && <div className={styles.placeholder} style={{height: (colHeight * (beforeStart / 60)) + 'em'}}></div>}
                    {
                    <div className={styles.timeslotItem} style={{height: 
                        (beforeStart === 0 && afterEnd === 0 ? colHeight : colHeight * (classLen / 60)) + 'em',
                    background: backColors[i],
                    border: '1px solid ' + backColors[i],
                    color: blackForeColors[i] ? 'black': ' white'
                }}
                        >{firstPart && <div className={styles.classDescription}>
                            {cls.name}
                            <div className={styles.smaller}>{cls.professor}
                            <br></br>
                            {schedule.location}</div></div>}</div>
                    } 
                    {afterEnd > 0 && <div className={styles.placeholder} style={{height: (colHeight * (afterEnd / 60)) + 'em'}}></div>} 
                </div>
            }
        }
    }

    return <div className={classnames(styles.timeslot, styles.empty)}></div>
}

function timetable(opts: {classes: Class[]}) {
    const days = ['월','화','수','목','금','토','일'];
    return <div className={styles.timetable}>
        <div className={styles.days}>
            <div className={styles.placeholder}></div>
            {days.map(i => <div className={styles.day}>{i}</div>)}
        </div>
        {range(0, 12).map(time => 
            <div className={styles.timeslotRow}>
                <div className={styles.timeslotRowDescription}>{time + 8}:00<br></br>({time}교시)</div>
                {range(0, 6).map(day => getMatchedCol(opts.classes, day, time))}
            </div>
        )}
    </div>
}

export default timetable;