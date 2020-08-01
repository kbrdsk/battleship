module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        "jest/globals": true,
    },
    extends: "eslint:recommended",
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    parserOptions: {
        ecmaVersion: 11,
        sourceType: "module",
    },
    rules: {
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/valid-expect": "error",
    },
    plugins: ["jest"],
};
