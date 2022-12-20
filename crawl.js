const { spawn } = require('node:child_process');
const fs = require('fs/promises');
const { existsSync } = require('fs');
const path = require('node:path');

const semester = process.env.CAU_SEMESTER;
const year = process.env.CAU_YEAR;

function spawnCommand(command, argvs) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(command, argvs, { shell: true });
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
        await spawnCommand('npx', ['caucrawl',
            '--outFile', 'courses.tmp.' + ext,
            '--type', ext,
            '--semester', semester,
            '--year', year]);
        console.log('');
    }

    console.log('Copying files')
    for (const ext of ['csv', 'json']) {
        const targetName = path.join(__dirname, 'public/courses/courses.' + ext);
        if (existsSync(targetName))
            await fs.rm(targetName);
        await fs.rename('courses.tmp.' + ext, targetName)
    }
    console.log('Writing timestamp');
    await fs.writeFile(path.join(__dirname, 'public/courses/crawlInfo.json'), JSON.stringify({
        crawlledAt: Date.now(),
        year,
        semester
    }), { encoding: 'utf8' });
    console.log('Done');
})();