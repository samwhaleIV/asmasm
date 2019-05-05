import { opcodes, OVERFLOW, REGISTER_SHORTHAND, VALUE_8, VALUE_16, VALUE_32, PARAMETER_BYTE_TABLE } from "./opcodes.js";
import { COMPILER_HELPER_SYMBOL, op_gen_comp_type } from "./op-gen.js";

const UNSIGNED_START = 0;
function create_bytecode(operations) {
    const jumpLookup = {};
    const subroutineLookup = {};
    const flatOperations = [];
    let byteCount = 0;
    let runningOffset = 0;
    for(let i = 0;i<operations.length;i++) {
        const operation = operations[i];
        if(operation.sym) {
            if(operation.sym === COMPILER_HELPER_SYMBOL) {
                switch(operation.type) {
                    case op_gen_comp_type.JUMP_LABEL:
                    case op_gen_comp_type.SUBROUTINE_LABEL:
                        const isJump = operation.type === op_gen_comp_type.JUMP_LABEL;
                        const lookupTable = isJump ? jumpLookup : subroutineLookup;
                        if(lookupTable[operation.name]) {
                            throw Error(`Duplicate ${isJump?"jump":"subroutine"} label '${operation.name}'`);  
                        } else {
                            lookupTable[operation.name] = i + runningOffset;
                            runningOffset--;
                        }
                        break;
                    case op_gen_comp_type.SUBROUTINE_LINK:
                    case op_gen_comp_type.JUMP_LINK:
                        throw Error("Links are invalid as operation substitutions. You must use a label");
                    default:
                        throw Error("Expected a valid operation substitution. Jump labels and subroutine labels are the only valid types");
                }
                continue;
            } else {
                throw Error("Operations are not expected to have a sym property unless it is the compiler helper symbol");
            }
        }
        if(!operation.type) {
            throw Error(`Operation is missing a type`);
        }
        byteCount += operation.type.stride;
        flatOperations.push(operation);
    }
    const assemblyBytes = new ArrayBuffer(byteCount);
    const assemblyWriter = new DataView(assemblyBytes);
    let byteIndex = 0;
    for(let i = 0;i<flatOperations.length;i++) {
        const operation = flatOperations[i];
        const opcodeIndex = opcodes[operation.type.key].index;
        if(opcodeIndex < UNSIGNED_START || opcodeIndex >= OVERFLOW[VALUE_8]) {
            throw Error(
                "Opcode type is out of the unsigned 8 bit integer range.\n" +
                "a.k.a: You're fucked. I don't know how, and this doesn't make much sense, " +
                "but if you can cause this error in the first place " +
                "you probably can figure out how to fix it, too."
            );
        }
        assemblyWriter.setUint8(byteIndex,opcodeIndex);
        byteIndex += 1;
        if(operation.type.parameterSize) {
            for(let i = 0;i<operation.type.parameterSchema.length;i++) {
                const valueKey = `value${i+1}`;
                const value = operation.payload[valueKey];
                const parameterToken = operation.type.parameterSchema[i];
                if(value < UNSIGNED_START) {
                    throw Error("Invalid integer. All numbers in assembly must be unsigned");
                }
                switch(parameterToken) {
                    case REGISTER_SHORTHAND:
                        const registerLookupResult = opcodes.registerLookup[value];
                        if(!registerLookupResult) {
                            throw Error(`Register shorthand '${value}' is not a valid register/a register that exists`);
                        }
                        assemblyWriter.setUint8(byteIndex,registerLookupResult.index);
                        break;
                    case VALUE_8:
                    case VALUE_16:
                        if(value >= OVERFLOW[parameterToken]) {
                            throw Error(`Integer overflow for type '${parameterToken}'`);
                        }
                        assemblyWriter[`setUint${PARAMETER_BYTE_TABLE[parameterToken]*8}`](byteIndex,value);
                        break;
                    case VALUE_32:
                        if(typeof value === "object") {
                            if(value.sym === COMPILER_HELPER_SYMBOL) {
                                switch(value.type) {
                                    case op_gen_comp_type.JUMP_LABEL:
                                    case op_gen_comp_type.SUBROUTINE_LABEL:
                                        throw Error("Labels are only valid as operation substitions, not as values. You must use links as 4 byte value replacements");
                                    case op_gen_comp_type.JUMP_LINK:
                                    case op_gen_comp_type.SUBROUTINE_LINK:
                                        const isJump = value.type === op_gen_comp_type.JUMP_LINK;
                                        const lookupTable = isJump ? jumpLookup : subroutineLookup;
                                        const lookupResult = lookupTable[value.name];
                                        if(lookupResult) {
                                            if(lookupResult >= OVERFLOW[parameterToken]) {
                                                throw Error(`Integer overflow for type '${parameterToken} (this value came from a ${isJump?"jump":"subroutine"} link)'`);
                                            }
                                            assemblyWriter.setUint32(byteIndex,lookupResult);
                                            break;
                                        } else {
                                            throw Error(`${isJump?"Jump":"Subroutine"} label '${value.name}' not found in assembly`);
                                        }
                                    default:
                                        throw Error("Expected a valid compiler helper type. Only links are supported, exclusively for 4 byte value replacements");
                                }
                                break;
                            } else {
                                throw Error("Expected 32 bit value, not an object. Only objects containing the compiler helper symbol are parsed");
                            }
                        }
                        if(value >= OVERFLOW[parameterToken]) {
                            throw Error(`Integer overflow for type '${parameterToken}'`);
                        }
                        assemblyWriter.setUint32(byteIndex,value);
                        break;
                    default:
                        throw Error(`Unrecognized parameter '${parameterToken}' in opcode definition`);
                }
                byteIndex += PARAMETER_BYTE_TABLE[parameterToken];
            }
        }
    }
    return assemblyBytes;
}
export default create_bytecode;
