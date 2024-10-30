"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUpParameter = exports.HttpError = void 0;
// Throw this object to return an HTTP error
class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.HttpError = HttpError;
// Clean up common issues with Copilot parameters
function cleanUpParameter(name, value) {
    let val = value.toLowerCase();
    if (val.toLowerCase().includes("trey") || val.toLowerCase().includes("research")) {
        const newVal = val.replace("trey", "").replace("research", "").trim();
        console.log(`   ❗ Plugin name detected in the ${name} parameter '${val}'; replacing with '${newVal}'.`);
        val = newVal;
    }
    if (val === "<user_name>") {
        console.log(`   ❗ Invalid name '${val}'; replacing with 'avery'.`);
        val = "avery";
    }
    if (name === "role" && val === "consultant") {
        console.log(`   ❗ Invalid role name '${val}'; replacing with ''.`);
        val = "";
    }
    if (val === "null") {
        console.log(`   ❗ Invalid value '${val}'; replacing with ''.`);
        val = "";
    }
    return val;
}
exports.cleanUpParameter = cleanUpParameter;
//# sourceMappingURL=Utilities.js.map