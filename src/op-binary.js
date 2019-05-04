import { opcodes, OVERFLOW, REGISTER_SHORTHAND, VALUE_8, VALUE_16, VALUE_32, PARAMETER_BYTE_TABLE } from "./opcodes.js";

const UNSIGNED_START = 0;
function create_bytecode(operations) {
    let byteCount = 0;
    for(let i = 0;i<operations.length;i++) {
        const operation = operations[i];
        if(!operation.type) {
            throw Error(`Operation is missing a type`);
        }
        byteCount += operation.type.stride;
    }

    const assemblyBytes = new ArrayBuffer(byteCount);
    const assemblyWriter = new DataView(assemblyBytes);

    let byteIndex = 0;
    for(let i = 0;i<operations.length;i++) {
        const operation = operations[i];
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
                    case VALUE_32:
                        if(value >= OVERFLOW[parameterToken]) {
                            throw Error(`Integer overflow for type '${parameterToken}'`);
                        }
                        assemblyWriter[`setUint${PARAMETER_BYTE_TABLE[parameterToken]*8}`](byteIndex,value);
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
