const { spawn } = require('node:child_process');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const path = require('node:path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createReadStream } = require('node:fs');

async function getCurrentSemester() {
    const res = await fetch('https://mportal.cau.ac.kr/std/usk/sUskSif001/selectCurYear.ajax', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: "{}"
    });

    const data = await res.json()
    return [parseInt(data.year[0].year), data.year[0].shtm];
}

function getNextSemesterOf(year, semester) {
    switch(semester) {
        case '1':
            return [year, 'S'];
        case 'S':
            return [year, '2'];
        case '2':
            return [year, 'W'];
        case 'W':
            return [year + 1, '1'];
    }
}

function spawnCommand(command, argvs) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, argvs);
        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
        childProcess.on('close', code => {
            if (code === 0)
                resolve(code);
            else
                reject(code);
        })
    });
}

exports.handler = async () => {
    const [curYear, curSemester] = await getCurrentSemester()
    console.log(`Current Year-Semester: ${curYear}-${curSemester}`)
    const [year, semester] = getNextSemesterOf(curYear, curSemester)
    console.log(`Year-Semester: ${year}-${semester}`);
    for (const ext of ['json', 'csv']) {
        console.log(`Crawlling in ${ext} format`)
        await spawnCommand('node', ['node_modules/cau.ac.kr/dist/crawller',
            '--outFile', '/tmp/courses.tmp.' + ext,
            '--type', ext,
            '--semester', semester,
            '--year', year]);
        console.log('');
    }

    console.log('Getting timestamp');
    const crawlInfo = JSON.stringify({
        crawlledAt: Date.now(),
        year,
        semester
    });

    const s3 = new S3Client();
    console.log('Uploading files')
    for (const ext of ['csv', 'json']) {
        const source = '/tmp/courses.tmp.' + ext
        const stream = createReadStream(source);
        const contentType = ext === 'json' ? 'application/json' : 'text/csv'
        await s3.send(new PutObjectCommand({
            Bucket: 'pre-timetable.puang.network',
            Key: 'courses/courses.' + ext,
            Body: stream,
            ContentType: contentType,
            Metadata: {
                'Content-Type': contentType
            }
        }));
    }

    console.log('Uploading timestamp');
    await s3.send(new PutObjectCommand({
        Bucket: 'pre-timetable.puang.network',
        Key: 'courses/crawlInfo.json',
        Body: crawlInfo,
        ContentType: 'application/json',
        Metadata: {
            'Content-Type': 'application/json'
        }
    }));

    console.log('Done');
};