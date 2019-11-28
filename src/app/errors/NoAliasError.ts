export class NoAliasError extends Error {
    constructor(message) {
        super("The following column has no Alias: " + message);
    }
}