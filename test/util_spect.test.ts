import { parseCommand } from "../src/utils";

describe('util tests', () => {
    describe('command parser', () => {
        it('can parse a change directory command', () => {
            expect(parseCommand('cd math/homework')).toMatchObject({ action: 'cd', srcPath: ['math', 'homework'], destPath: undefined });
        })

        it('can parse a change directory command with root', () => {
            expect(parseCommand('cd /math/homework')).toMatchObject({ action: 'cd', srcPath: ['', 'math', 'homework'], destPath: undefined });
        })

        it('can parse a make directory command', () => {
            expect(parseCommand('mkdir math/homework')).toMatchObject({ action: 'mkdir', srcPath: ['math', 'homework'], destPath: undefined });
        })

        it('can parse a make directory command with option', () => {
            expect(parseCommand('mkdir -p math/homework')).toMatchObject({ action: 'mkdir', option: 'p', srcPath: ['math', 'homework'] });
        })

        it('can parse a get current working directory command', () => {
            expect(parseCommand('pwd')).toMatchObject({ action: 'pwd' });
        })

        it('can parse a get directory contents command with no path', () => {
            expect(parseCommand('ls')).toMatchObject({ action: 'ls' });
        })

        it('can parse a get directory contents command with a path', () => {
            expect(parseCommand('ls math')).toMatchObject({ action: 'ls', srcPath: ['math'], destPath: undefined });
        })

        it('can parse a remove directory command', () => {
            expect(parseCommand('rm math')).toMatchObject({ action: 'rm', srcPath: ['math'], destPath: undefined });
        })

        it('can parse a create file command', () => {
            expect(parseCommand('mkfile file')).toMatchObject({ action: 'mkfile', srcPath: ['file'], destPath: undefined });
        })

        it('can parse a write file contents command', () => {
            expect(parseCommand('write file "file contents"')).toMatchObject({ action: 'write', srcPath: ['file'], content: 'file contents' });
        })

        it('can parse a get file contents command', () => {
            expect(parseCommand('read file')).toMatchObject({ action: 'read', srcPath: ['file'], destPath: undefined });
        })

        it('can parse a move file command', () => {
            expect(parseCommand('mv math/homework assignments')).toMatchObject({ action: 'mv', srcPath: ['math', 'homework'], destPath: ['assignments'] });
        })

        it('can find directory/file command', () => {
            expect(parseCommand('find math')).toMatchObject({ action: 'find', srcPath: ['math'], destPath: undefined });
        })
    })
});