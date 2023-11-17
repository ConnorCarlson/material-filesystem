/**
 * This class represents an abstract class for both Directory and MemoryFile classes.
 * It has shared properties of both Directory and MemoryFile, which are name and parent.
 */
export class DirectoryNode {
    /**
     * Name of the directory or file.
     */
    name: String;

    /**
     * Parent directory of the current directory or file.
     */    
    parent: Directory | null;

    /**
     * @param parent - Parent directory of the current directory or file.
     * @param name - Name of the directory or file.
     */
    constructor(parent: Directory | null, name: String) {
        this.name = name;
        this.parent = parent;
        
    }
}

/**
 * This class extends DirectoryNode and represents a file in the memory.
 * It additional has one more property 'content' which contains the contents of the file.
 */
export class MemoryFile extends DirectoryNode {
    /**
     * Contents of the file.
     */
    content: String;

    /**
     * @param parent - Parent directory of the current file.
     * @param name - Name of the file.
     * @param content - Contents of the file.
     */
    constructor(parent: Directory, name: String, content?: String) {
        super(parent, name);
        this.content = content ?? '';
    }
}

/**
 * This class extends DirectoryNode and represents a directory in in-memory file system.
 * It has additional properties for handling child directories, files and handling duplicate file names in the same directory.
 */
export class Directory extends DirectoryNode {

    /**
     * Map to store child directories with directory name as key and directory object as value.
     */
    childDirectories: Map<String, Directory>;

    /**
     * Map to store files with file name as key and file object as value.
     */
    files: Map<String, MemoryFile>;

    /**
     * Map to handle duplicate file names in the same directory.
     * It stores the count of duplicate file names for each file in the directory.
     */
    duplicateFileCount: Map<String, number>;

    /**
     * @param parent - Parent directory of the current directory.
     * @param name - Name of the directory.
     */
    constructor(parent: Directory | null, name: String) {
        super(parent, name);
        this.childDirectories = new Map();
        this.files = new Map();
        this.duplicateFileCount = new Map();
    }
}