"use strict";
import { opcodes, OVERFLOW_VALUES, REGISTER_SHORTHAND, VALUE_8, VALUE_16, VALUE_32, PARAMETER_BYTE_TABLE } from "./opcodes.js";
import create_bytecode from "./op-binary.js";
import VirtualMemory from "./virtual-memory.js";
import VirtualRegisters from "./virtual-registers.js";
import { left_shift, right_shift, not, and, or, xor } from "./bindec.js";

const INCOMPATIBLE_CROSS_REGISTER_SIZE =
"Register A is smaller than register B. The size of register B must be less than or equal to that of register A";

const REGISTER_SIZE_MISMATCH =
"Register A's size must be equal to the that of Register B's";

const INVALID_JUMP_REGISTER = 
"Jump and move registers must contain 32 bit/4 byte coordinates";

const ILLEGAL_ASSEMBLY_SYNTAX = "Illegal assembly syntax. This parameter schema is not expected for this operation";

const EXPECTED_8_BIT_REGISTER = "Expected an 8 bit register";
const EXPECTED_16_BIT_REGISTER = "Expected a 16 bit register";
const EXPECTED_32_BIT_REGISTER = "Expected a 32 bit register";

const JUMP_DIRECTIVE = 0;
const RETURN_DIRECTIVE = 1;
const CALL_DIRECTIVE = 2;

const regSizeOffset = 1;
const r1Value = 0;
const r2Value = 2;
const cmpValue = 4;
const jmpValue = 6;

const r1Size = r1Value + regSizeOffset;
const r2Size = r2Value + regSizeOffset;
const cmpSize = cmpValue + regSizeOffset;
const jmpSize = jmpValue + regSizeOffset;

const BYTE_1 = 1;
const BYTE_2 = 2;
const BYTE_4 = 4;

const defaultInputMethod = function() {
    return 0;
}
const defaultOutputMethod = function(value) {
    console.log(value);
}

let inputMethod = defaultInputMethod;
let outputMethod = defaultOutputMethod;

function validate_registers_1_2(reg) {
    if(reg[r1Size] < reg[r2Size]) {
        throw Error(INCOMPATIBLE_CROSS_REGISTER_SIZE);
    }
}
function validate_registers_1_2_size_matched(reg) {
    if(reg[r1Size] !== reg[r2Size]) {
        throw Error(REGISTER_SIZE_MISMATCH);
    }
}
const comparisons = [
    function equal(a,b){return a == b},
    function notEqual(a,b){return a != b},
    function lessThan(a,b){return a < b},
    function greaterThan(a,b){return a > b},
    function greaterThanOrEqual(a,b){return a >= b},
    function lessThanOrEqual(a,b){return a <= b},
    function isZero(a){return a == 0},
    function isNotZero(a){return a != 0},
    function isFull(a,_,size){return a == OVERFLOW_VALUES[size]-1},
    function isNotFull(a,_,size){return a != OVERFLOW_VALUES[size]-1}
];
function preload_bytes_8(reg,mem,prm) {
    const address = mem.allocate_8(size);
    reg[prm[0]] = address;
    reg[prm[0]+regSizeOffset] = BYTE_4;
    return address;
}
function preload_bytes_16(reg,mem,prm) {
    const address = mem.allocate_16(size);
    reg[prm[0]] = address;
    reg[prm[0]+regSizeOffset] = BYTE_4;
    return address;
}
function preload_bytes_32(reg,mem,prm) {
    const address = mem.allocate_32(size);
    reg[prm[0]] = address;
    reg[prm[0]+regSizeOffset] = BYTE_4;
    return address;
}
const instructionProcessors = [
    function add(reg) {
        validate_registers_1_2(reg);
        let value = reg[r1Value] + reg[r2Value];
        const overflowPoint = OVERFLOW_VALUES[reg[r1Size]];
        if(value >= overflowPoint) {
            value = value - overflowPoint;
        }
        reg[r1Value] = value;
    },
    function subtract(reg) {
        validate_registers_1_2(reg);
        let value = reg[r1Value] - reg[r2Value];
        if(value < 0) {
            value = OVERFLOW_VALUES[reg[r1Size]] - value;
        }
        reg[r1Value] = value;
    },
    function multiply(reg) {
        validate_registers_1_2(reg);
        reg[r1Value] = (reg[r1Value] * reg[r2Value]) % OVERFLOW_VALUES[reg[r1Size]];
    },
    function divide(reg) {
        validate_registers_1_2(reg);
        reg[r1Value] = Math.floor(reg[r1Value] / reg[r2Value]);
    }, 
    function modulus(reg) {
        validate_registers_1_2(reg);
        reg[r1Value] = reg[r1Value] % reg[r2Value];
    },
    function bitwise_and(reg) {
        validate_registers_1_2_size_matched(reg);
        reg[r1Value] = and(reg[r1Value],reg[r2Value],reg[r1Size]);
    },
    function bitwise_or(reg) {
        validate_registers_1_2_size_matched(reg);
        reg[r1Value] = or(reg[r1Value],reg[r2Value],reg[r1Size]);
    },
    function bitwise_xor(reg) {
        validate_registers_1_2_size_matched(reg);
        reg[r1Value] = xor(reg[r1Value],reg[r2Value],reg[r1Size]);
    },
    function bitwise_not(reg) {
        reg[r1Value] = not(reg[r1Value],reg[r1Size]);
    },
    function bitwise_left_shift(reg) {
        validate_registers_1_2_size_matched(reg);
        reg[r1Value] = left_shift(reg[r1Value],reg[r2Value],reg[r1Size]);
    },
    function bitwise_right_shift(reg) {
        validate_registers_1_2_size_matched(reg);
        reg[r1Value] = right_shift(reg[r1Value],reg[r2Value],reg[r1Size]);
    },
    function load_bytes_8(reg,mem,prm) {
        const address = preload_bytes_8(reg,mem,prm);
        const value = prm[1];
        mem.set_8(address,value);
    },
    function load_bytes_16(reg,mem,prm) {
        const address = preload_bytes_16(reg,mem,prm);
        const value = prm[1];
        mem.set_16(address,value);
    },
    function load_bytes_32(reg,mem,prm) {
        const address = preload_bytes_32(reg,mem,prm);
        const value = prm[1];
        mem.set_32(address,value);
    },
    function preload_bytes_8(reg,mem,prm) {
        preload_bytes_8(reg,mem,prm);
    },
    function preload_bytes_16(reg,mem,prm) {
        preload_bytes_16(reg,mem,prm);
    },
    function preload_bytes_32(reg,mem,prm) {
        preload_bytes_32(reg,mem,prm);
    },
    function preload_memory_block(reg,mem) {
        const address = mem.allocate(reg[r1Value]);
        reg[r2Value] = address;
        reg[r2Size] = BYTE_4;
    },
    function free_memory_8(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free_8(reg[prm[0]]);
    },
    function free_memory_16(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free_16(reg[prm[0]]);
    },
    function free_memory_32(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free_32(reg[prm[0]]);
    },
    function free_memory_block(reg,mem) {
        if(reg[r2Size] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free(reg[r2Value],reg[r1Value]);
    },
    function copy_register(reg,_,prm) {
        reg[prm[1]] = reg[prm[0]];
        reg[prm[1]+regSizeOffset] = reg[prm[0]+regSizeOffset];
    },
    function swap_register(reg,_,prm) {
        const tmpValue = reg[prm[0]];
        const tmpSize = reg[prm[0]+regSizeOffset];
        reg[prm[0]] = reg[prm[1]];
        reg[prm[0]+regSizeOffset] = reg[prm[1]+regSizeOffset];
        reg[prm[1]] = tmpValue;
        reg[prm[1]+regSizeOffset] = tmpSize;
    },
    function set_address_8(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        if(reg[prm[1]+regSizeOffset] !== BYTE_1) {
            throw Error(EXPECTED_8_BIT_REGISTER);
        }
        mem.set_8(reg[prm[0]],reg[prm[1]]);
    },
    function set_address_16(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        if(reg[prm[1]+regSizeOffset] !== BYTE_2) {
            throw Error(EXPECTED_16_BIT_REGISTER);
        }
        mem.set_16(reg[prm[0]],reg[prm[1]]);
    },
    function set_address_32(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        if(reg[prm[1]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.set_32(reg[prm[0]],reg[prm[1]]);
    },
    function get_from_address_8(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        reg[prm[1]] = mem.get_8(reg[prm[0]]);
        reg[prm[1]+regSizeOffset] = BYTE_1;
    },
    function get_from_address_16(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        reg[prm[1]] = mem.get_16(reg[prm[0]]);
        reg[prm[1]+regSizeOffset] = BYTE_2;
    },
    function get_from_address_32(reg,mem,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        reg[prm[1]] = mem.get_32(reg[prm[0]]);
        reg[prm[1]+regSizeOffset] = BYTE_4;
    },
    function set_register_8(reg,_,prm) {
        reg[prm[0]] = prm[1];
        reg[prm[0]+regSizeOffset] = BYTE_1;
    },
    function set_register_16(reg,_,prm) {
        reg[prm[0]] = prm[1];
        reg[prm[0]+regSizeOffset] = BYTE_2;
    },
    function set_register_32(reg,_,prm) {
        reg[prm[0]] = prm[1];
        reg[prm[0]+regSizeOffset] = BYTE_4;
    },
    function compare(reg) {
        if(reg[cmpSize] !== BYTE_1) {
            throw Error(EXPECTED_8_BIT_REGISTER);
        }
        reg[cmpValue] = comparisons[reg[cmpValue]](
            reg[r1Value],
            reg[r2Value],
            reg[r1Size]
        ) ? 1 : 0;
    },
    function jump(reg) {
        if(reg[jmpSize] !== BYTE_4) {
            throw Error(INVALID_JUMP_REGISTER);
        }
        return {
            type: JUMP_DIRECTIVE,
            value: reg[jmpValue]
        };
    },
    function conditional_jump(reg) {
        if(reg[jmpSize] !== BYTE_4) {
            throw Error(INVALID_JUMP_REGISTER);
        }
        if(reg[cmpValue] >= 1) {
            return {
                type: JUMP_DIRECTIVE,
                value: reg[jmpValue]
            };
        }
    },
    function dummy(){
        return undefined;
    },
    function subroutine_call(reg,_,prm) {
        if(reg[prm[0]+regSizeOffset] !== BYTE_4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        return {
            type: CALL_DIRECTIVE,
            value: reg[prm[0]]
        };
    },
    function subroutine_return() {
        return {
            type: RETURN_DIRECTIVE
        };
    },
    function input_stream(reg) {
        reg[r1Value] = inputMethod();
        reg[r1Size] = BYTE_1;
    },
    function output_stream(reg) {
        outputMethod(reg[r1Value]);
    }
];
function translateRegisterParameter(trueRegisterIndex) {
    const runtimeReadyRegisterIndex = trueRegisterIndex * 2;
    return runtimeReadyRegisterIndex;
}
function disassembleASM(asm) {
    const byteLength = asm.byteLength;
    let index = 0;
    const operations = [];
    const allOperations = opcodes.allOperations;
    while(index < byteLength) {
        const operationIndex = asm.getUint8(index);
        index+=1;
        const operation = allOperations[operationIndex];
        const parameters = [];
        if(operation.parameterSchema) {
            for(let i = 0;i<operation.parameterSchema.length;i++) {
                const parameter = operation.parameterSchema[i];
                switch(parameter) {
                    case REGISTER_SHORTHAND:
                        const translatedRegisterParameter =
                        translateRegisterParameter(asm.getUint8(index));
                        parameters.push(translatedRegisterParameter);
                        break;
                    case VALUE_8:
                        parameters.push(asm.getUint8(index));
                        break;
                    case VALUE_16:
                        parameters.push(asm.getUint16(index));
                        break;
                    case VALUE_32:
                        parameters.push(asm.getUint32(index));
                        break;
                    default:
                        throw Error(ILLEGAL_ASSEMBLY_SYNTAX);
                }
                index += PARAMETER_BYTE_TABLE[parameter];
            }
        }
        const method = instructionProcessors[operation.index];
        operations.push([method,parameters]);
    }
    return operations;
}
function scriptExecutor(assembly,options) {
    let registers;
    let memory;
    if(options) {
        if(options.customMemory) {
            memory = options.customMemory;
        } else {
            memory = new VirtualMemory(options);
        }
        if(options.customRegisters) {
            registers = options.customRegisters;
        } else {
            registers = new VirtualRegisters(options);
        }
    } else {
        registers = new VirtualRegisters();
        memory = new VirtualMemory();
    }
    const virtualStack = [];
    const assemblyView = new DataView(assembly);

    const operations = disassembleASM(assemblyView);
    const operationCount = operations.length;

    const registerData = registers.data;

    let index = 0;
    let operationsExecuted = 0;
    const startTime = performance.now();

    while(index < operationCount) {
        operationsExecuted++;
        const operation = operations[index];
        const directive = operation[0](
            registerData,memory,operation[1]
        );
        index++;
        if(directive) {
            if(directive.type > RETURN_DIRECTIVE) {
                virtualStack.push([index,registers.copyRegisterStates()]);
                index = directive.value;
            } else if(directive.type < RETURN_DIRECTIVE) {
                index = directive.value;
            } else {
                const stackPop = virtualStack.pop();
                index = stackPop[0];
                registers.applyRegisterStates(stackPop[1]);
            }
        }
    }
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    console.log(
        "Program finished execution with",
        operationsExecuted,
        "operations fired","\n",
        "Completion time (seconds):",
        duration,"\n",
        "Operations per second:",
        operationsExecuted/duration
    );
};
const interpreter = new (function(){
    this.setInputMethod = function inputSetter(method) {
        if(typeof method !== typeof defaultInputMethod) {
            throw Error("Expected an input method that is a function");
        }
        inputMethod = method;
    }
    this.setOutputMethod = function outputSetter(method) {
        if(typeof method !== typeof defaultOutputMethod) {
            throw Error("Expected an output method that is a function");
        }
        outputMethod = method;
    }
    this.executeAssembly = function(assembly,options) {
        let compiledAssembly = null;
        if(assembly.byteLength === undefined) {
            console.log("Assembly is not compiled byte code... Compiling now");
            compiledAssembly = create_bytecode(assembly);
            console.log("Assembly compilation complete!");
        } else {
            compiledAssembly = assembly;
        }
        try {
            scriptExecutor(compiledAssembly,options);
            return true;
        } catch(error) {
            console.error(error);
            return false;
        }
    }
})();
export default interpreter;
