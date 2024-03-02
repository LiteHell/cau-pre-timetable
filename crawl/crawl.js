const { spawn } = require('node:child_process');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const path = require('node:path');

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

(async () => {
    const [curYear, curSemester] = await getCurrentSemester()
    console.log(`Current Year-Semester: ${curYear}-${curSemester}`)
    const [year, semester] = getNextSemesterOf(curYear, curSemester)
    console.log(`Year-Semester: ${year}-${semester}`);
    for (const ext of ['json', 'csv']) {
        console.log(`Crawlling in ${ext} format`)
        await spawnCommand('node', ['/app/node_modules/cau.ac.kr/dist/crawller',
            '--outFile', 'courses.tmp.' + ext,
            '--type', ext,
            '--semester', semester,
            '--year', year]);
        console.log('');
    }

    console.log('Copying files')
    for (const ext of ['csv', 'json']) {
        const source = 'courses.tmp.' + ext
        const debugTargetName = path.join(__dirname, 'public/courses/courses.' + ext);
        const prodTargetName = path.join(__dirname, 'build/courses/courses.' + ext);
        if (existsSync(debugTargetName))
            await fs.rm(debugTargetName);
        await fs.copyFile(source, debugTargetName)
        await fs.copyFile(source, prodTargetName)
        await fs.rm(source);
    }
    console.log('Writing timestamp');
    const crawlInfo = JSON.stringify({
        crawlledAt: Date.now(),
        year,
        semester
    });
    await fs.writeFile(path.join(__dirname, 'public/courses/crawlInfo.json'), crawlInfo, { encoding: 'utf8' });
    await fs.writeFile(path.join(__dirname, 'build/courses/crawlInfo.json'), crawlInfo, { encoding: 'utf8' });
    console.log('Done');
})();