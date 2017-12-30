/**
 * @see https://github.com/angular/angular-cli/issues/5190
 */
const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const argv = require('yargs').argv;
const packageFile = __dirname + '/../../package.json';
const gitFolder = __dirname + '/../../.git/';

if (!fs.existsSync(packageFile)) {
    console.log('[NgAppVersion] ' + colors.yellow('Cannot find packages.json in root path. Skipping...'));
    return;
}

const appVersion = require(packageFile).version;

let versionFile = __dirname + '/../../src/_versions.ts';
if (argv.hasOwnProperty('file')) {
    versionFile = __dirname + '/../../' + argv.file;
}

console.log(colors.cyan('\nWriting version strings to ' + versionFile));
const versionFilePath = path.join(versionFile);

let src = 'export const version = \'' + appVersion + '\';\n';

if (fs.existsSync(gitFolder)) {
    console.log('[NgAppVersion] Git repository detected. Getting current commit information.');
    const git = require('git-describe');
    try {
        const info = git.gitDescribeSync({ longSemver: true });
        let versionWithHash = appVersion;
        if (info.hasOwnProperty('hash')) {
            versionWithHash = versionWithHash + '-' + info.hash;
        }
        src += 'export const versionLong = \'' + versionWithHash + '\';\n';
    } catch(e) {
        if (new RegExp(/Not a git repository/).test(e.message)) {
            console.log('[NgAppVersion] ' + colors.red('Not a Git repository.'));
            return;
        }
        console.log('[NgAppVersion] ' + colors.red(e.message));
    }
}

// ensure version module pulls value from package.json
console.log('[NgAppVersion] ' + colors.green('Updating application version ') + colors.yellow(appVersion));
console.log('[NgAppVersion] ' + colors.green('Writing version module to ') + colors.yellow(versionFilePath));
fs.writeFile(versionFilePath, src, { flat: 'w' }, function (err) {
    if (err) {
        return console.log('[NgAppVersion] ' + colors.red(err));
    }
    console.log('[NgAppVersion] ' + colors.green('File written.'));
});
