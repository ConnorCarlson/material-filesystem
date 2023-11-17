/**
 * Function to parse a file path.
 * It splits the string path into an array using '/' as a separator.
 * @param {string} path - The file path as a string.
 * @returns {string[]} - The file path as an array of directories.
 */
function parsePath(path: String): String[] {
    const parsedPath = path.split('/');
    if(parsedPath.length > 1 && parsedPath[parsedPath.length-1] == '') {
        parsedPath.pop();
    }
    return parsedPath;
}

/**
 * Interface for a parsed command including command action and its parameters.
 * @typedef {Object} ParsedCommand
 * @property {string} action - Command action such as 'cd', 'ls', etc.
 * @property {string} [option] - Option for the command, if any.
 * @property {string} [content] - Content for the command, if applicable (like for 'write' command).
 * @property {string[]} [srcPath] - Source path in case of commands like 'move', 'copy', etc.
 * @property {string[]} [destPath] - Destination path in case of commands like 'move', 'copy', etc.
 */
export interface ParsedCommand {
    action: String;
    option?: String;
    content?: String;
    srcPath?: String[];
    destPath?: String[];
}

/**
 * Function to parse a raw command string into a ParsedCommand object.
 * It splits the command string into an array and uses the parts to set the ParsedCommand properties.
 * @param {string} command - Raw command string input by user.
 * @returns {ParsedCommand} - Parsed command object with action and its parameters.
 */
export function parseCommand(command: String): ParsedCommand {
    const commandArray = command.split(' ');
    const action = commandArray[0];
    let result: ParsedCommand = {action}
    if(commandArray.length === 1) {
        return result;
    }
    const contentRegex = command.match(/"(.*?)"/);
    const content = contentRegex ? contentRegex[1] : undefined;

    if(content) {
        return {
            ...result,
            content,
            srcPath: parsePath(commandArray[1]),
        }
    }
    const option = (commandArray.length > 1 && commandArray[1].charAt(0) === '-') ? commandArray[1].charAt(1) : undefined;

    if(option) {
        return {
            ...result,
            option,
            srcPath: parsePath(commandArray[2]),
        } 
    }

    const destPath = commandArray.length > 2 ? parsePath(commandArray[2]) : undefined;
    const srcPath = parsePath(commandArray[1]);

    return {
        ...result,
        destPath,
        srcPath
    }

}