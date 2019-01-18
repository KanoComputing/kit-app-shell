import { ICheck, ICheckResult, CheckResultSatus } from '../check';

const node : ICheck = {
    run: () => {
        const result : ICheckResult = {
            status: CheckResultSatus.Success,
            title: 'Node',
            message: process.version,
        };
        return Promise.resolve(result);
    },
    children: [],
};

export default node;
