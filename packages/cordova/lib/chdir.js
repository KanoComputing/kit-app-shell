module.exports = {
    chdir(p) {
        process.chdir.call(process, p);
    },
};
