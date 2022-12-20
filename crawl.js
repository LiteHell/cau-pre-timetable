const { spawn } = require('node:child_process');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const path = require('node:path');

const semester = process.env.CAU_SEMESTER;
const year = process.env.CAU_YEAR;

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