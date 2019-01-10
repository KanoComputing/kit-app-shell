import { IConfigure } from '@kano/kit-app-shell-core/lib/types';

function createQuestion(p, cfg) {
    // Load the initial value from the current config if exists
    // TODO: Maybe create a util function that would be provided by the CLI to do this
    return Object.assign({}, p, {
        initial: cfg[p.name] || p.initial,
    });
}

const iosConfigure : IConfigure = {
    enquire(prompt, cfg) {
        return prompt([
            createQuestion({
                type: 'input',
                name: 'developmentTeam',
                message: 'Development Team ID',
                validate: (input) => {
                    if (!input.length) {
                        return true;
                    }
                    if (input.length !== 10) {
                        return 'Development Team ID must be 10 characters long';
                    }
                    return true;
                },
            }, cfg),
            createQuestion({
                type: 'input',
                name: 'codeSignIdentity',
                message: 'Code Sign Identity',
                initial: 'iPhone Developer',
            }, cfg),
        ]);
    },
};

export default iosConfigure;
