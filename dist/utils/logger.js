"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const log = (...args) => {
    console.log(new Date().toISOString(), ...args);
};
exports.log = log;
