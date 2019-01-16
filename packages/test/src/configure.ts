import * as symbols from 'log-symbols';

// All the prompt for all the providers, by provider key
const PROMPTS = {
    browserstack: [{
        type: 'input',
        name: 'user',
        message: 'Browserstack username',
    }, {
        type: 'input',
        name: 'key',
        message: 'Browserstack API key',
    }],
    kobiton: [{
        type: 'input',
        name: 'user',
        message: 'Kobiton username',
    }, {
        type: 'input',
        name: 'key',
        message: 'Kobiton API key',
    }],
    saucelabs: [{
        type: 'input',
        name: 'user',
        message: 'SauceLabs username',
    }, {
        type: 'input',
        name: 'key',
        message: 'SauceLabs API key',
    }],
    bitbar: [{
        type: 'input',
        name: 'key',
        message: 'Bitbar API key',
    }],
};

function createQuestions(id, cfg) {
    const prompts = PROMPTS[id];
    return prompts.map((p) => Object.assign({}, p, {
        // Initial value is the value already in the config or the one defined in the question
        initial: cfg[id] ? cfg[id][p.name] || p.initial : p.initial,
    }));
}

export default {
    enquire(prompt, cfg) {
        function choice(message, name) {
            return {
                name,
                message: `${message}${cfg[name] ? ` ${symbols.success}` : ''}`,
            };
        }
        return prompt({
            type: 'select',
            name: 'provider',
            message: 'Choose a provider to configure, providers already confiured will appear with a checkmark',
            choices: [
                choice('Browserstack', 'browserstack'),
                choice('Bitbar', 'bitbar'),
                choice('Kobiton', 'kobiton'),
                choice('Saucelabs', 'saucelabs'),
            ],
        }).then((answers) => {
            if (!answers.provider) {
                return null;
            }
            return prompt(createQuestions(answers.provider, cfg))
                .then((ans) => ({
                    [answers.provider]: ans,
                }));
        });
    },
};
