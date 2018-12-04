const fs = require('fs');

const ISSUE_PATH = '/etc/issue';
const KANO_OS_ISSUE_NAME = 'Kanux';
const KANO_OS_PLATFORM_NAME = 'kano';

function getKanoOSInfo() {
    const etcIssueRegExp = /^(.+) (.+) ([\d\.?]+) (.+) \\l/;
    try {
        const issue = fs.readFileSync(ISSUE_PATH).toString();
        const matched = issue.match(etcIssueRegExp);
        if (matched && matched[1] === KANO_OS_ISSUE_NAME) {
            return {
                platform: KANO_OS_PLATFORM_NAME,
                release: matched[3],
                name: matched[4],
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

module.exports = {
    getKanoOSInfo,
};
