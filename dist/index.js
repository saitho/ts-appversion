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

    // if loaded from node_modules folder, step back a few levels
    if (__dirname.match('/.*node_modules\/@saithodev\/ts-appversion.*/')) {
        projectLocations.unshift(
          path.join(__dirname, '..', '..', '..', '..', rootPath)
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
const pkg = require(packageFile); 
const appVersion = pkg.version;
const appName = pkg.name;
const appDescription = pkg.description;

console.log('[TsAppVersion] ' + colors.green('Application version (from package.json): ') + colors.yellow(appVersion));
console.log('[TsAppVersion] ' + colors.green('Application name (from package.json): ') + colors.yellow(appName));

let src = `export interface TsAppVersion {
    version: string;
    name: string;
    description?: string;
    versionLong?: string;
    versionDate: string;
    gitCommitHash?: string;
    gitCommitDate?: string;
    gitTag?: string;
};
export const versions: TsAppVersion = {
    version: '${appVersion}',
    name: '${appName}',
    versionDate: '${new Date().toISOString()}',
`;
if (appDescription !== undefined && appDescription !== '') {
    console.log('[TsAppVersion] ' + colors.green('Application description (from package.json): ') + colors.yellow(appDescription));
    src += `    description: '${appDescription}',\n`;
}

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
            src += `    gitCommitHash: '${info.hash}',\n`;
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
                    src += `    gitCommitDate: '${gitDateString}',\n`;
                }
            } catch (e) {
                console.log(e);
            }
        }
        console.log('[TsAppVersion] ' + colors.green('Long Git version: ') + colors.yellow(versionWithHash));
        src += `    versionLong: '${versionWithHash}',\n`;
        if (info.hasOwnProperty('tag')) {
            console.log('[TsAppVersion] ' + colors.green('Git tag: ') + colors.yellow(info.tag));
            src += `    gitTag: '${info.tag}',\n`;
        }
    } catch(e) {
        if (new RegExp(/Not a git repository/).test(e.message)) {
            console.log('[TsAppVersion] ' + colors.red('Not a Git repository.'));
            return;
        }
        console.log('[TsAppVersion] ' + colors.red(e.message));
    }
}

src += `};
export default versions;
`;

console.log('[TsAppVersion] ' + colors.green('Writing version module to ') + colors.yellow(versionFile));
fs.writeFile(versionFile, src, function (err) {
    if (err) {
        return console.log('[TsAppVersion] ' + colors.red(err));
    }
    console.log('[TsAppVersion] ' + colors.green('File written.'));
});
