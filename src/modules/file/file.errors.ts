export class FileError extends Error {

    constructor(message: string) {
        super(message);

        this.name = "FileError";
    }
}

export class InvalidFileError extends FileError {

    constructor(message: string) {
        super(message);

        this.name = "InvalidFileError";
    }
}