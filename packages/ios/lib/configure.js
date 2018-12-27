module.exports = {
    enquire(prompt) {
        return prompt([{
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
        }, {
            type: 'input',
            name: 'codeSignIdentity',
            message: 'Code Sign Identity',
            initial: 'iPhone Developer',
        }]);
    },
};
