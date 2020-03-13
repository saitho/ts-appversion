/**
 * @see https://github.com/angular/angular-cli/issues/5190
 */
const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const argv = require('yargs').argv;
let rootPath = path.join('..', '..', '..');
if (argv.hasOwnProperty('root')) {
    rootPath = argv.root;
}
let projectFolder = path.join(__dirname, rootPath);
if (path.isAbsolute(rootPath)) {
    projectFolder = rootPath;
}
const packageFile = path.join(projectFolder, 'package.json');
let gitFolder = projectFolder;

// TODO: remove with v2
if (argv.hasOwnProperty('force-git')) {
    console.log('[TsAppVersion] ' + colors.blue('Deprecation notice: ') + colors.red('The use of --force-git is will be removed with version 2. Use --git instead to point to the folder where the .git folder resides.'));
}

if (!fs.existsSync(packageFile)) {
    console.log('[TsAppVersion] ' + colors.yellow('Cannot find package.json in root path. Skipping...'));
    return;
}

const outputFile = argv.hasOwnProperty('file') ? argv.file : path.join('src', '_versions.ts');
const versionFile = path.join(projectFolder, outputFile);

// pull version from package.json
const appVersion = require(packageFile).version;

console.log('[TsAppVersion] ' + colors.green('Application version (from package.json): ') + colors.yellow(appVersion));
let src = 'export const version = \'' + appVersion + '\';\n';

let enableGit = false;
if (argv.hasOwnProperty('git')) {

    const pathChunks = path.resolve(argv.git).split(path.sep);
    if (pathChunks.length) {
        const lastChunk = pathChunks.pop();
        if (lastChunk === '.git') {
            console.log('[TsAppVersion] ' + colors.blue('Deprecation notice: ') + colors.red('--git is now supposed to point to the directory where the .git folder resides in, instead of the .git folder itself.'));
            argv.git = pathChunks.join(path.sep);
        }
    }

    gitFolder = path.resolve(projectFolder, argv.git);
    if (path.isAbsolute(argv.git)) {
        gitFolder = argv.git;
    }
}
if (argv.hasOwnProperty('force-git')) {
    // TODO: remove with v2
    // this option is required e.g. when the repository in question is a sub repository
    enableGit = true;
    console.log('[TsAppVersion] Git repository forced. Getting current commit information.');
} else if (fs.existsSync(path.join(gitFolder, '.git'))) {
    enableGit = true;
    console.log('[TsAppVersion] Git repository detected. Getting current commit information.');
}

if (enableGit) {
    const git = require('git-describe');
    try {
        const info = git.gitDescribeSync(gitFolder, { longSemver: true });
        let versionWithHash = appVersion;
        if (info.hasOwnProperty('hash')) {
            versionWithHash = versionWithHash + '-' + info.hash;
            src += 'export const gitCommitHash = \'' + info.hash + '\';\n';
            console.log('[TsAppVersion] ' + colors.green('Git Commit hash: ') + colors.yellow(info.hash));

            // Get date of commit
            try {
                const gitCommitInfo = require('git-commit-info');
                const gitCommit = gitCommitInfo({
                    cwd: gitFolder,
                    commit: info.hash.substr(1),
                });
                if (gitCommit.hasOwnProperty('date')) {
                    const gitDateString = new Date(gitCommit.date).toISOString();
                    console.log('[TsAppVersion] ' + colors.green('Git Commit date: ') + colors.yellow(gitDateString));
                    src += 'export const gitCommitDate = \'' + gitDateString + '\';\n';
                }
            } catch (e) {
                console.log(e);
            }
        }
        console.log('[TsAppVersion] ' + colors.green('Long Git version: ') + colors.yellow(versionWithHash));
        src += 'export const versionLong = \'' + versionWithHash + '\';\n';
        if (info.hasOwnProperty('tag')) {
            console.log('[TsAppVersion] ' + colors.green('Git tag: ') + colors.yellow(info.tag));
            src += 'export const gitTag = \'' + info.tag + '\';\n';
        }
    } catch(e) {
        if (new RegExp(/Not a git repository/).test(e.message)) {
            console.log('[TsAppVersion] ' + colors.red('Not a Git repository.'));
            return;
        }
        console.log('[TsAppVersion] ' + colors.red(e.message));
    }
}

src += 'export const versionDate = \'' + new Date().toISOString() + '\';\n';

console.log('[TsAppVersion] ' + colors.green('Writing version module to ') + colors.yellow(versionFile));
fs.writeFile(versionFile, src, function (err) {
    if (err) {
        return console.log('[TsAppVersion] ' + colors.red(err));
    }
    console.log('[TsAppVersion] ' + colors.green('File written.'));
});
