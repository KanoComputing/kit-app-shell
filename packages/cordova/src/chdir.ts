export function chdir(p) {
    process.chdir.call(process, p);
}
