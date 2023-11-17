import * as readline from 'readline';
import { MemoryFileSystem } from './MemoryFileSystem';
import { ParsedCommand, parseCommand } from './utils';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const memoryFileSystem = new MemoryFileSystem();

getUserInput();

function executeCommand(command: String) {
    let parsedCommand;
    try {
        parsedCommand = parseCommand(command);
    } catch {
        throw new Error('Error parsing command');
    }
    const { action, srcPath, destPath, content, option } = parsedCommand as ParsedCommand;
    switch (action) {
        case 'cd':
            memoryFileSystem.changeDirectory(srcPath!);
            break;
        case 'pwd':
            console.log(memoryFileSystem.printWorkingDirectory());
            break;
        case 'mkdir':
            memoryFileSystem.makeDirectory(srcPath!, option);
            break;
        case 'ls':
            console.log(memoryFileSystem.getDirectoryContents(srcPath));
            break;
        case 'rm':
            memoryFileSystem.removeDirectoryNode(srcPath!);
            break;
        case 'mkfile':
            memoryFileSystem.createFile(srcPath!);
            break;
        case 'write':
            memoryFileSystem.writeFileContent(srcPath!, content!);
            break;
        case 'read':
            console.log(memoryFileSystem.getFileContent(srcPath!));
            break;
        case 'mv':
            memoryFileSystem.moveDirectoryNode(srcPath!, destPath!);
            break;
        case 'find':
            console.log(memoryFileSystem.findDirectoryNode(srcPath![0]));
            break;
    }
}

function getUserInput() {
    rl.question("command: ", function (command) {
        if (command == "exit") {
            rl.close();
        } else {
            try {
                executeCommand(command)
            } catch (error) {
                console.log((error as Error).message);
            }
            getUserInput();
        }
    });
}