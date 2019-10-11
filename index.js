/**
 * @see https://github.com/angular/angular-cli/issues/5190
 */
const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const argv = require('yargs').argv;
let rootPath = path.join('..', '..');
if (argv.hasOwnProperty('root')) {
    rootPath = argv.root;
}
const packageFile = path.join(__dirname, rootPath, 'package.json');
let gitFolder = path.join(__dirname, rootPath);

// TODO: remove with v2
if (argv.hasOwnProperty('force-git')) {
    console.log('[NgAppVersion] ' + colors.blue('Deprecation notice: ') + colors.red('The use of --force-git is will be removed with version 2. Use --git instead to point to the folder where the .git folder resides.'));
}

if (!fs.existsSync(packageFile)) {
    console.log('[NgAppVersion] ' + colors.yellow('Cannot find package.json in root path. Skipping...'));
    return;
}

let versionFile = path.join(__dirname, rootPath, 'src', '_versions.ts');
if (argv.hasOwnProperty('file')) {
    versionFile = path.join(__dirname, rootPath, argv.file);
}

// pull version from package.json
const appVersion = require(packageFile).version;

console.log('[NgAppVersion] ' + colors.green('Application version (from package.json): ') + colors.yellow(appVersion));
let src = 'export const version = \'' + appVersion + '\';\n';

let enableGit = false;
if (argv.hasOwnProperty('git')) {

    var pathChunks = path.resolve(argv.git).split(path.sep);
    if (pathChunks.length) {
        const lastChunk = pathChunks.pop();
        if (lastChunk === '.git') {
            console.log('[NgAppVersion] ' + colors.blue('Deprecation notice: ') + colors.red('--git is now supposed to point to the directory where the .git folder resides in, instead of the .git folder itself.'));
            argv.git = pathChunks.join(path.sep);
        }
    }

    gitFolder = path.resolve(__dirname, argv.git);
}
if (argv.hasOwnProperty('force-git')) {
    // TODO: remove with v2
    // this option is required e.g. when the repository in question is a sub repository
    enableGit = true;
    console.log('[NgAppVersion] Git repository forced. Getting current commit information.');
} else if (fs.existsSync(gitFolder)) {
    enableGit = true;
    console.log('[NgAppVersion] Git repository detected. Getting current commit information.');
}

if (enableGit) {
    const git = require('git-describe');
    try {
        const info = git.gitDescribeSync(gitFolder, { longSemver: true });
        let versionWithHash = appVersion;
        if (info.hasOwnProperty('hash')) {
            versionWithHash = versionWithHash + '-' + info.hash;
            src += 'export const gitCommitHash = \'' + info.hash + '\';\n';
            console.log('[NgAppVersion] ' + colors.green('Git Commit hash: ') + colors.yellow(info.hash));
        }
        if (info.hasOwnProperty('tag')) {
            console.log('[NgAppVersion] ' + colors.green('Git tag: ') + colors.yellow(info.tag));
            src += 'export const gitTag = \'' + info.tag + '\';\n';
        }
        console.log('[NgAppVersion] ' + colors.green('Long Git version: ') + colors.yellow(versionWithHash));
        src += 'export const gitVersionLong = \'' + versionWithHash + '\';\n';

        console.log('[NgAppVersion] ' + colors.blue('Deprecation notice: ') + colors.grey('Using the variable "versionLong" is deprecated. Use "gitVersionLong" instead.'));
        src += '// DEPRECATION: versionLong is deprecated - use gitVersionLong instead\n';
        src += 'export const versionLong = gitVersionLong;\n';
    } catch(e) {
        if (new RegExp(/Not a git repository/).test(e.message)) {
            console.log('[NgAppVersion] ' + colors.red('Not a Git repository.'));
            return;
        }
        console.log('[NgAppVersion] ' + colors.red(e.message));
    }
}

src += 'export const versionDate = \'' + new Date().toISOString() + '\';\n';

console.log('[NgAppVersion] ' + colors.green('Writing version module to ') + colors.yellow(versionFile));
fs.writeFile(versionFile, src, function (err) {
    if (err) {
        return console.log('[NgAppVersion] ' + colors.red(err));
    }
    console.log('[NgAppVersion] ' + colors.green('File written.'));
});
