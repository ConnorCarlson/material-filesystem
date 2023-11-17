import { Directory, MemoryFile } from "./DirectoryNodes";

/**
 * This class implements a basic file system with in-memory storage.
 * It provides common file/directory operations like creating, removing, moving, reading, and writing.
 */
export class MemoryFileSystem {
    /**
     * The root directory of the file system.
     * Type: Object of class Directory
     */
    root: Directory;

    /**
     * The current/working directory in the file system.
     * Type: Object of class Directory
     */
    workingDirectory: Directory;

    /**
     * The constructor initializes the root directory and sets it as the working directory.
     */
    constructor() {
        this.root = new Directory(null, '');
        this.workingDirectory = this.root;
    }

    /**
     * Method to change the current working directory in the file system.
     * @param {string[]} path - Relative or absolute path to the new directory.
     */
    public changeDirectory(path: String[]) {
        const newDirectory = this.findDirectory(path);
        this.workingDirectory = newDirectory;
    }

    /**
     * Method to return the path of the current working directory.
     * @returns {string} - The path of the current working directory.
     */
    public printWorkingDirectory(): String {
        let result = '';
        let currentDirectory = this.workingDirectory;

        if(currentDirectory.name === '') {
            return '/';
        }

        while(currentDirectory.name !== '') {
            result = '/' + currentDirectory.name + result;
            currentDirectory = currentDirectory.parent!;
        }
        
        return result;
    }

    /**
     * Method to create a new directory.
     * @param {string[]} path - Relative or absolute path to the new directory.
     * @param {string} [option] - Optional parameter. If 'p' is passed, it creates intermediate directories as needed.
     */
    public makeDirectory(path: String[], option?: String) {

        const newDirectory = path.pop()!;
        const newDirectoryParent = this.findDirectory(path, option === 'p');

        if(newDirectoryParent.childDirectories.has(newDirectory) || newDirectoryParent.files.has(newDirectory)) {
            throw new Error('File exists');
        }
        newDirectoryParent.childDirectories.set(newDirectory, new Directory(newDirectoryParent, newDirectory));
    }

    /**
     * Method to list contents (files and directories) of a directory.
     * @param {string[]} path - Relative or absolute path to the directory.
     * @returns {string} - List of contents (files and directories) as a string.
     */
    public getDirectoryContents(path?: String[]): String {
        let result = '';

        const currentDirectory = path ? this.findDirectory(path) : this.workingDirectory;

        currentDirectory.childDirectories.forEach(directory => {
            result += directory.name + ' ';
        })

        currentDirectory.files.forEach(file => {
            result += file.name + ' ';
        })

        return result.slice(0, -1);
    }

    /**
     * Method to remove a file or directory.
     * @param {string[]} path - Relative or absolute path to the file or directory to be removed.
     */
    public removeDirectoryNode(path: String[]) {
        const directoryNodeToRemove = path.pop()!;
        const parentDirectory = this.findDirectory(path);

        if(!parentDirectory.childDirectories.has(directoryNodeToRemove) && !parentDirectory.files.has(directoryNodeToRemove)) {
            throw new Error('Directory or file does not exist');
        }
        if(parentDirectory.childDirectories.has(directoryNodeToRemove)) {
            parentDirectory.childDirectories.delete(directoryNodeToRemove);
        } else {
            parentDirectory.files.delete(directoryNodeToRemove);
        }
    }

    /**
     * Method to create a new file.
     * @param {string[]} path - Relative or absolute path to the new file.
     */
    public createFile(path: String[]) {
        let newFileName = path.pop()!;
        const parentDirectory = this.findDirectory(path);
        
        newFileName = this.renameDuplicateFile(parentDirectory, newFileName);

        parentDirectory.files.set(newFileName, new MemoryFile(parentDirectory, newFileName));
    }

    /**
     * Method to move a file or directory.
     * @param {string[]} srcPath - Source path of the file or directory to be moved.
     * @param {[string]} destPath - Destination path where the file or directory has to be moved.
     */
    public moveDirectoryNode(srcPath: String[], destDirectory: String[]) {
        let nodeToMove = srcPath.pop()!;
        const parentDirectoryOfNode = this.findDirectory(srcPath);
        const parentDirectoryOfDest = this.findDirectory(destDirectory);

        if(parentDirectoryOfNode.files.has(nodeToMove)) {
            const newFileName = this.renameDuplicateFile(parentDirectoryOfDest, nodeToMove);
            const file = parentDirectoryOfNode.files.get(nodeToMove)!;
            file.parent = parentDirectoryOfDest;
            file.name = newFileName;

            parentDirectoryOfDest.files.set(newFileName, file);
            parentDirectoryOfNode.files.delete(nodeToMove);
        } else if(parentDirectoryOfNode.childDirectories.has(nodeToMove)) {
            if(parentDirectoryOfDest.childDirectories.has(nodeToMove)) {
                this.mergeDirectories(parentDirectoryOfNode.childDirectories.get(nodeToMove)!, 
                parentDirectoryOfDest.childDirectories.get(nodeToMove)!);
            } else {
                const directoryToMove = parentDirectoryOfNode.childDirectories.get(nodeToMove)!;
                directoryToMove.parent = parentDirectoryOfDest;
                parentDirectoryOfDest.childDirectories.set(directoryToMove.name, directoryToMove);
            }
            parentDirectoryOfNode.childDirectories.delete(nodeToMove);
        } else {
            throw new Error('Source file not found');
        }
    }   

    /**
     * Method to merge contents of a source directory into a destination directory.
     * @private
     * @param srcDirectory - Source directory object which contains files/directories.
     * @param destDirectory - Destination directory object where files/directories need to be moved. 
     */
    private mergeDirectories(srcDirectory: Directory, destDirectory: Directory) {
        srcDirectory.childDirectories.forEach(directory => {
            if(destDirectory.childDirectories.has(directory.name)) {
                this.mergeDirectories(directory, destDirectory.childDirectories.get(directory.name)!);
            } else {
                directory.parent = destDirectory;
                destDirectory.childDirectories.set(directory.name, directory);
            }
        });

        srcDirectory.files.forEach(file => {
            const newFileName = this.renameDuplicateFile(destDirectory, file.name);
            file.name = newFileName;
            file.parent = destDirectory;
            destDirectory.files.set(file.name, file);
        });
    }

    /**
     * Method to find a file or directory recursively.
     * @param {string} name - Name of the file or directory to find.
     * @returns {string} - List of paths where file/directory with such name is located.
     */
    public findDirectoryNode(name: String) {
        const resultArray: String[] = []
        this.findDirectoryNodeHelper(name, this.workingDirectory, this.workingDirectory.name === '' ? '/' : '', resultArray);
        let result = '';

        resultArray.forEach(path => {
            result += path + ' ';
        })

        return result.slice(0, -1);
    }

    /**
     * Recursive helper method to find a directory or file within the given directory.
     * @private
     * @param nameToFind - Name of the directory/file to find.
     * @param currentDirectory - Current directory object in which we are looking for the directory/file. 
     * @param currentPath - Path traversed till now from the initial directory.  
     * @param result - Array to store the result paths where the directory/file is found.
     */
    private findDirectoryNodeHelper(nameToFind: String, currentDirectory: Directory, currentPath: String, result: String[]) {
        if(currentDirectory.childDirectories.has(nameToFind) || currentDirectory.files.has(nameToFind)) {
            result.push(`${currentPath}${nameToFind}`);
        }
        currentDirectory.childDirectories.forEach(directory => {
            this.findDirectoryNodeHelper(nameToFind, directory, `${currentPath}${directory.name}/`, result);
        });
        
    }

    /**
     * Method to write content to a file.
     * @param {string[]} path - Absolute or relative path to the file.
     * @param {string} content - Content to be written to the file.
     */
    public writeFileContent(path: String[], content: String) {
        const fileName = path.pop()!;
        const parentDirectory = this.findDirectory(path);

        if(!parentDirectory.files.has(fileName)) {
            parentDirectory.files.set(fileName, new MemoryFile(parentDirectory, fileName));
        }
        parentDirectory.files.get(fileName)!.content = content;
    }

    /**
     * Method to get content of a file.
     * @param {string[]} path - Absolute or relative path to the file.
     * @returns {string} - Content present in the file.
     */
    public getFileContent(path: String[]): String {
        const fileName = path.pop()!;
        const parentDirectory = this.findDirectory(path);
        if(!parentDirectory.files.has(fileName)) {
            throw new Error(`No file exists with name ${fileName}`);
        }
        return parentDirectory.files.get(fileName)!.content;
    }

    /**
     * Method to rename a file if there is another file/directory with the same name in the same directory.
     * @private
     * @param parent - Parent directory of the file that needs to be renamed.
     * @param name - Original name of the file.
     * @returns {string} - New name for the file.
     */
    private renameDuplicateFile(parent: Directory, name: String): String {
        const duplicateFileCount = parent.duplicateFileCount.get(name);
        if(duplicateFileCount) {
            parent.duplicateFileCount.set(name, duplicateFileCount + 1)
            return name + '(' + (duplicateFileCount + 1) + ')';
        } else if (parent.files.has(name) || parent.childDirectories.has(name)) {
            parent.duplicateFileCount.set(name, 1);
            return name + '(' + 1 + ')';
        }

        return name;
    }

    /**
     * Method to navigate to a directory according to the given path.
     * @private
     * @param path - Relative or absolute path of the directory to navigate.
     * @param createIntermediateDirectories - Boolean variable stating whether to create directories along the path if they don't exist.
     * @returns {Directory} - The directory object for the given path.
     */
    private findDirectory(path: String[], createIntermediateDirectories?: boolean): Directory {
        let currentDirectory = this.workingDirectory;

        if(path.length === 0) {
            return currentDirectory;
        }

        if(path[0] === '') {
            currentDirectory = this.root;
            path.shift();
        }
        
        path.forEach(item => {
            if(item === '..') {
                currentDirectory = currentDirectory.parent!;
            } else if (currentDirectory.childDirectories.has(item)) {
                currentDirectory = currentDirectory.childDirectories.get(item)!;
            } else if (createIntermediateDirectories) {
                currentDirectory.childDirectories.set(item, new Directory(currentDirectory, item));
                currentDirectory = currentDirectory.childDirectories.get(item)!;
            } else {
                throw new Error('Directory does not exist');
            }
        })
        return currentDirectory;
    }

}