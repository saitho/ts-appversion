const { exec } = require('child_process');
'use strict';

/* Blackbox test for the gitDescribe and gitDescribeSync functions
 * using operations on a real git repository.
 * Requires a git binary available in the executable path.
 * The test-repo directory must be writable.
 */

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const should = require('chai').should();
const expect = require('chai').expect;
const assert = require('chai').assert;
const TestRepo = require('./lib/test-repo');

const repoDir = path.join(__dirname, 'test-repo');
const repo = new TestRepo(repoDir);

before(function() {
    repo.clean();
});

after(function() {
    //repo.clean();
});

describe('appversion', function() {
    it('should skip when no package.json is found.', function(done) {
        exec('node index.js --root=./test/test-repo --file=version-test.ts', (err, stdout, stderr) => {
            if (err) {
                done('Test failed: Could not execute command.');
                return;
            }
            if (stderr) {
                done(stderr);
                return;
            }
            expect(stdout).to.contains('Cannot find package.json in root path. Skipping...');
            done();
        });
    });

    it('should throw deprecation message when using --force-git', function(done) {
        exec('node index.js --force-git', (err, stdout, stderr) => {
            if (err) {
                done('Test failed: Could not execute command.');
                return;
            }
            if (stderr) {
                done(stderr);
                return;
            }
            expect(stdout).to.contains('deprecated');
            done();
        });
    });

    it('should succeed with default settings and without a Git repository', function(done) {
        fs.mkdirSync(path.join(repoDir, 'src'));
        fs.writeFileSync(path.join(repoDir, 'package.json'), '{"version": "1.0.0"}');
        exec('node index.js --root=./test/test-repo', (err, stdout, stderr) => {
            if (err) {
                done('Test failed: Could not execute command.');
                return;
            }
            if (stderr) {
                done(stderr);
                return;
            }
            expect(stdout).to.match(/Writing version strings to/);
            const outputFile = path.join(repoDir, 'src', '_versions.ts');
            if (!fs.existsSync(outputFile)) {
                done('File ' + outputFile + ' not found.');
                return;
            }
            const fileContents = fs.readFileSync(outputFile, 'utf8');
            expect(fileContents).to.contains('const version = \'1.0.0\'');
            expect(fileContents).not.to.contains('const versionLong = \'1.0.0-g');
            done();
        });
    });

    it('should succeed with default settings', function(done) {
        repo.init();
        fs.mkdirSync(path.join(repoDir, 'src'));
        fs.writeFileSync(path.join(repoDir, 'package.json'), '{"version": "1.0.0"}');
        exec('node index.js --root=./test/test-repo', (err, stdout, stderr) => {
            if (err) {
                done('Test failed: Could not execute command.');
                return;
            }
            if (stderr) {
                done(stderr);
                return;
            }
            expect(stdout).to.match(/Writing version strings to/);
            const outputFile = path.join(repoDir, 'src', '_versions.ts');
            if (!fs.existsSync(outputFile)) {
                done('File ' + outputFile + ' not found.');
                return;
            }
            const fileContents = fs.readFileSync(outputFile, 'utf8');
            expect(fileContents).to.contains('const version = \'1.0.0\'');
            expect(fileContents).to.contains('const versionLong = \'1.0.0-g');
            done();
        });
    });


    it('should succeed with different file output', function(done) {
        repo.init();
        fs.writeFileSync(path.join(repoDir, 'package.json'), '{"version": "1.0.0"}');
        exec('node index.js --root=./test/test-repo --file=version-test.ts', (err, stdout, stderr) => {
            if (err) {
                done('Test failed: Could not execute command.');
                return;
            }
            if (stderr) {
                done(stderr);
                return;
            }
            expect(stdout).to.match(/Writing version strings to/);
            const outputFile = path.join(repoDir, 'version-test.ts');
            if (!fs.existsSync(outputFile)) {
                done('File ' + outputFile + ' not found.');
                return;
            }
            const fileContents = fs.readFileSync(outputFile, 'utf8');
            expect(fileContents).to.contains('const version = \'1.0.0\'');
            expect(fileContents).to.contains('const versionLong = \'1.0.0-g');
            done();
        });
    });

    it('should succeed when .git directory is not in root', function(done) {
        repo.init();
        fs.mkdirSync(path.join(repoDir, 'application'));
        fs.mkdirSync(path.join(repoDir, 'application', 'src'));
        fs.writeFileSync(path.join(repoDir, 'application', 'package.json'), '{"version": "1.0.0"}');
        exec('node index.js --root=./test/test-repo/application --git=..', (err, stdout, stderr) => {
            if (err) {
                done('Test failed: Could not execute command.');
                return;
            }
            if (stderr) {
                done(stderr);
                return;
            }
            const outputFile = path.join(repoDir, 'application', 'src', '_versions.ts');
            if (!fs.existsSync(outputFile)) {
                done('File ' + outputFile + ' not found.');
                return;
            }
            const fileContents = fs.readFileSync(outputFile, 'utf8');
            expect(fileContents).to.contains('const version = \'1.0.0\'');
            expect(fileContents).to.contains('const versionLong = \'1.0.0-g');
            done();
        });
    });
});

