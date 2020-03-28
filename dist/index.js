/**
 * @see https://github.com/angular/angular-cli/issues/5190
 */
const path = require('path');
const colors = require('colors/safe');
const fs = require('fs');
const argv = require('yargs').argv;
let rootPath = path.join('..', '..', '..', '..');
if (argv.hasOwnProperty('root')) {
    rootPath = argv.root;
}

const projectLocations = [];

// If root path is absolute, ignore other paths
if (path.isAbsolute(rootPath)) {
    projectLocations.push(rootPath);
} else {
    projectLocations.push(path.join(__dirname, rootPath));

    if (argv.hasOwnProperty('pnpm')) {
        // PNPM has a different folder structure. We have jump up a few levels to find package.json
        projectLocations.unshift(
          path.join(__dirname, '..', '..', '..', '..', '..', '..', rootPath)
        );
    }
}

// Find package.json
let packageFile = '';
let projectFolder = '';
for (const location of projectLocations) {
    packageFile = path.join(location, 'package.json');
    try {
        if (fs.existsSync(packageFile)) {
            projectFolder = location;
            break;
        }
    } catch (e) {
        // Ignore errors
    }
}

if (!projectFolder.length) {
    console.log('[TsAppVersion] ' + colors.yellow('Cannot find package.json in root path. Skipping...'));
    return;
}

const outputFile = argv.hasOwnProperty('file') ? argv.file : path.join('src', '_versions.ts');
const versionFile = path.join(projectFolder, outputFile);

// pull version from package.json
const appVersion = require(packageFile).version;

console.log('[TsAppVersion] ' + colors.green('Application version (from package.json): ') + colors.yellow(appVersion));
let src = `interface TsAppVersion {
    version: string;
    versionLong?: string;
    versionDate: string;
    gitCommitHash?: string;
    gitCommitDate?: string;
    gitTag?: string;
}
const obj: TsAppVersion = {
    version: '${appVersion}',
    versionDate: '${new Date().toISOString()}'
};
`;

let enableGit = false;
let gitFolder = projectFolder;
if (argv.hasOwnProperty('git')) {
    gitFolder = path.resolve(projectFolder, argv.git);
    if (path.isAbsolute(argv.git)) {
        gitFolder = argv.git;
    }
}
if (fs.existsSync(path.join(gitFolder, '.git'))) {
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
            src += `obj.gitCommitHash = '${info.hash}';\n`;
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
                    src += `obj.gitCommitDate = '${gitDateString}';\n`;
                }
            } catch (e) {
                console.log(e);
            }
        }
        console.log('[TsAppVersion] ' + colors.green('Long Git version: ') + colors.yellow(versionWithHash));
        src += `obj.versionLong = '${versionWithHash}';\n`;
        if (info.hasOwnProperty('tag')) {
            console.log('[TsAppVersion] ' + colors.green('Git tag: ') + colors.yellow(info.tag));
            src += `obj.gitTag = '${info.tag}';\n`;
        }
    } catch(e) {
        if (new RegExp(/Not a git repository/).test(e.message)) {
            console.log('[TsAppVersion] ' + colors.red('Not a Git repository.'));
            return;
        }
        console.log('[TsAppVersion] ' + colors.red(e.message));
    }
}

src += `export default obj;
`;

console.log('[TsAppVersion] ' + colors.green('Writing version module to ') + colors.yellow(versionFile));
fs.writeFile(versionFile, src, function (err) {
    if (err) {
        return console.log('[TsAppVersion] ' + colors.red(err));
    }
    console.log('[TsAppVersion] ' + colors.green('File written.'));
});
