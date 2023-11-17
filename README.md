The In Memory File System is a simple implementation of a basic file system with in-memory storage. It provides common file/directory operations like creating, removing, moving, reading, and writing.

## How to run
### Download dependencies
`yarn`

### Run program
`yarn start`

### Run tests
`yarn test`

## Commands

`cd {path}` - Change the current working directory in the file system.

`pwd` - Return the path of the current working directory.

`mkdir [-p create intermediate directories] {path}` - Create a new directory.

`ls {path}` - List contents (files and directories) of a directory.

`rm {path}` - Remove a file or directory.

`mkfile {path}` - Create a new file. If a file already exists with the same name, will auto-rename the new file.

`mv {source_directory_path} {destination_path}` - Move a file or directory. If a file already exists with the same name, will auto-rename the new file. If a directory already exists with the same name, directories will merge.

`find {name}` - Find a file or directory recursively.

`write {path} "{content}"` - Write content to a file.

`read {path}` - Get content of a file.

`exit` - Exit program.