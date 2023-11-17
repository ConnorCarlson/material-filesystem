import { MemoryFileSystem } from "../src/MemoryFileSystem";
import { Directory, MemoryFile } from "../src/DirectoryNodes";

describe('file system tests', () => {
    let fileSystem: MemoryFileSystem;
    let mathFolder: Directory;
    let biologyFolder: Directory;
    let mathHomeworkFolder: Directory;
    beforeEach(() => {
        fileSystem = new MemoryFileSystem();
        fileSystem.root.childDirectories.set('math', new Directory(fileSystem.root, 'math'));
        fileSystem.root.childDirectories.set('biology', new Directory(fileSystem.root, 'biology'));
        mathFolder = fileSystem.root.childDirectories.get('math')!;
        biologyFolder = fileSystem.root.childDirectories.get('biology')!;

        mathFolder.childDirectories.set('homework', new Directory(mathFolder, 'homework'));
        biologyFolder.childDirectories.set('homework', new Directory(biologyFolder, 'homework'));

        mathHomeworkFolder = mathFolder.childDirectories.get('homework')!;
        const biologyHomeworkFolder = biologyFolder.childDirectories.get('homework')!;
        mathHomeworkFolder.files.set('assignment1', new MemoryFile(mathHomeworkFolder, 'assignment1', 'assignment1 content'));
        mathHomeworkFolder.files.set('assignment2', new MemoryFile(mathHomeworkFolder, 'assignment2', 'assignment2 content'));
        biologyHomeworkFolder.files.set('assignment1', new MemoryFile(biologyHomeworkFolder, 'assignment1', 'assignment1 content'));

    });

    describe('findDirectory', () => {
        it('can find a sub directory', () => {
            const foundDirectory = (fileSystem as any).findDirectory(['math', 'homework']);
            expect(foundDirectory.name).toBe('homework');
        });

        it('can find a parent directory', () => {
            fileSystem.workingDirectory = mathHomeworkFolder;
            const foundDirectory = (fileSystem as any).findDirectory(['..']);
            expect(foundDirectory.name).toBe('math');
        });

        it('can find a directory starting from root', () => {
            fileSystem.workingDirectory = mathHomeworkFolder;
            const foundDirectory = (fileSystem as any).findDirectory(['', 'biology']);
            expect(foundDirectory.name).toBe('biology');
        });

        it('throws an error if the directory does not exist ', () => {
            expect(() => (fileSystem as any).findDirectory(['chemistry'])).toThrow('Directory does not exist');
        });

        it('creates intermediate directories ', () => {
            const foundDirectory = (fileSystem as any).findDirectory(['chemistry', 'homework'], true);
            expect(foundDirectory.name).toBe('homework');
        });


    });

    describe('changeDirectory', () => {
        it('can change to a sub directory', () => {
            fileSystem.changeDirectory(['math', 'homework']);
            expect(fileSystem.workingDirectory.name).toBe('homework');
        });

        it('can change to a parent directory', () => {
            fileSystem.workingDirectory = mathHomeworkFolder;
            fileSystem.changeDirectory(['..']);
            expect(fileSystem.workingDirectory.name).toBe('math');
        });
    });

    describe('printWorkingDirectory', () => {

        it('can print the working directory at root', () => {
            const directoryString = fileSystem.printWorkingDirectory();
            expect(directoryString).toBe('/');
        });

        it('can print the working directory', () => {
            fileSystem.workingDirectory = mathHomeworkFolder;
            const directoryString = fileSystem.printWorkingDirectory();
            expect(directoryString).toBe('/math/homework');
        });

    });

    describe('makeDirectory', () => {
        it('can make a directory', () => {
            fileSystem.makeDirectory(['math', 'notes']);
            expect(mathFolder.childDirectories.size).toBe(2);
        });

        it('can make a directory with intermediate directories given option to', () => {
            fileSystem.makeDirectory(['chemistry', 'homework'], 'p');

            expect(fileSystem.root.childDirectories.size).toBe(3);
            expect(fileSystem.root.childDirectories.get('chemistry')?.childDirectories.size).toBe(1);
        });

        it('throws an error if a directory already exists with that name', () => {
            expect(() => fileSystem.makeDirectory(['math', 'homework'])).toThrow('File exists');
        });
    });

    describe('getDirectoryContents', () => {
        it('can get directory contents with no path', () => {
            const directoryContents = fileSystem.getDirectoryContents();
            expect(directoryContents).toBe('math biology');
        });

        it('can get directory contents with a path', () => {
            const directoryContents = fileSystem.getDirectoryContents(['math', 'homework']);
            expect(directoryContents).toBe('assignment1 assignment2');
        });
    });

    describe('removeDirectoryNode', () => {
        it('can remove a directory', () => {
            fileSystem.removeDirectoryNode(['math']);
            expect(fileSystem.root.childDirectories.size).toBe(1);
        });

        it('can remove a file', () => {
            fileSystem.removeDirectoryNode(['math', 'homework', 'assignment1']);
            expect(mathHomeworkFolder.files.size).toBe(1);
        });

        it('removes a duplicate file preventing further duplicate file renaming', () => {
            fileSystem.createFile(['math', 'homework', 'assignment1']);
            fileSystem.removeDirectoryNode(['math', 'homework', 'assignment1']);
            fileSystem.createFile(['math', 'homework', 'assignment1']);
            expect(mathHomeworkFolder.files.size).toBe(3);
            expect(fileSystem.getDirectoryContents(['math', 'homework'])).toBe('assignment2 assignment1(1) assignment1');
        });
    });

    describe('createNewFile', () => {
        it('can create a file', () => {
            fileSystem.createFile(['math', 'homework', 'assignment3']);
            expect(mathHomeworkFolder.files.size).toBe(3);
        });

        it('can auto rename new file if the file exists', () => {
            fileSystem.createFile(['math', 'homework', 'assignment1']);
            expect(mathHomeworkFolder.files.size).toBe(3);
            expect(mathHomeworkFolder.files.has('assignment1(1)')).toBeTruthy;
        });
    });

    describe('writeFileContents', () => {
        it('can write file contents', () => {
            fileSystem.writeFileContent(['math', 'homework', 'assignment1'], 'new assignment 1 content');
            expect(mathHomeworkFolder.files.get('assignment1')?.content).toBe('new assignment 1 content');
        });

        it('creates a new file if the file does not exist', () => {
            fileSystem.writeFileContent(['math', 'homework', 'assignment3'], 'new assignment 3 content');
            expect(mathHomeworkFolder.files.get('assignment3')?.content).toBe('new assignment 3 content');
        });
    });

    describe('moveDirectoryNode', () => {
        it('can move a directory', () => {
            fileSystem.makeDirectory(['school']);
            fileSystem.moveDirectoryNode(['math'], ['school']);
            fileSystem.moveDirectoryNode(['biology'], ['school']);
            expect(fileSystem.root.childDirectories.get('school')?.childDirectories.size).toBe(2);
            expect(fileSystem.root.childDirectories.size).toBe(1);
        });

        it('can move a file', () => {
            fileSystem.moveDirectoryNode(['biology', 'homework', 'assignment1'], ['math', 'homework']);
            expect(mathHomeworkFolder.files.size).toBe(3);
            expect(mathHomeworkFolder.files.has('assignment1(1)')).toBeTruthy;
        });

        it('can merge directories if the directory exists', () => {
            fileSystem.moveDirectoryNode(['biology', 'homework'], ['math']);
            expect(mathHomeworkFolder.files.size).toBe(3);
            expect(mathHomeworkFolder.files.has('assignment1(1)')).toBeTruthy;
            expect(biologyFolder.childDirectories.size).toBe(0);
        });
    });

    describe('findDirectoryNode', () => {
        it('can find directories and files that match a name', () => {
            const findResult = fileSystem.findDirectoryNode('homework');
            expect(findResult).toBe('/math/homework /biology/homework');
        });

        it('can find a file from a non-root node', () => {
            fileSystem.workingDirectory = mathHomeworkFolder;
            const findResult = fileSystem.findDirectoryNode('assignment1');
            expect(findResult).toBe('assignment1');
        });
    });
});