/**
 * npm run deploy
 *     deploy `build` content and push to gh-pages branch
 *
 * npm run deploy -- --no-push
 *     deploy `build`, but do not push to gh-pages branch
 */

'use strict';

const ghpages = require('gh-pages');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

let push = true;
if (args.length > 0) {
    push = !args.some(x => x == "--no-push");
}

let hash;
try {
    hash = execSync("git rev-parse HEAD", { encoding: 'utf-8' });
} catch (error) {
    console.error(`Failed to get commit hash: ${error.message}`);
    return;
}
ghpages.publish('build', {
    nojekyll: true,
    message: `Update for ${hash}`,
    push,
}, function(error) {
    if (error === undefined) {
        console.log("deployed");
    }
    else {
        console.error(`Error: ${error}`);
    }
});
