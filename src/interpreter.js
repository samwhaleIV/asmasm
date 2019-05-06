"use strict";
import { opcodes, OVERFLOW_VALUES, REGISTER_SHORTHAND, VALUE_8, VALUE_16, VALUE_32, PARAMETER_BYTE_TABLE } from "./opcodes.js";
import create_bytecode from "./op-binary.js";
import VirtualMemory from "./virtual-memory.js";
import VirtualRegisters from "./virtual-registers.js";

const INCOMPATIBLE_CROSS_REGISTER_SIZE =
"Register A is smaller than register B. The size of register B must be less than or equal to that of register A";

const REGISTER_SIZE_MISMATCH =
"Register A's size must be equal to the that of Register B's";

const INVALID_COMPARISON_TYPE =
"Comparison type in register 3 must be 8 bits/1 byte";

const INVALID_JUMP_REGISTER = 
"Jump and move registers must contain 32 bit/4 byte coordinates";

const INVALID_REGISTER_SIZE = "Invalid register size";

const NOT_IMPLEMENTED = "This operation is not implemented";
const ILLEGAL_ASSEMBLY_SYNTAX = "Illegal assembly syntax. This parameter schema is not expected for this operation";

const EXPECTED_8_BIT_REGISTER = "Expected an 8 bit register";
const EXPECTED_16_BIT_REGISTER = "Expected a 16 bit register";
const EXPECTED_32_BIT_REGISTER = "Expected a 32 bit register";

const JUMP_DIRECTIVE = 0;
const RETURN_DIRECTIVE = 1;
const CALL_DIRECTIVE = 2;

const defaultInputMethod = function() {
    return 0;
}
const defaultOutputMethod = function(value) {
    console.log(value);
}

let inputMethod = defaultInputMethod;
let outputMethod = defaultOutputMethod;

function get_registers_1_2(reg) {
    const a = reg.registers[0];
    const b = reg.registers[1];
    if(a.size < b.size) {
        throw Error(INCOMPATIBLE_CROSS_REGISTER_SIZE);
    }
    return [a,b,a.size];
}
function get_registers_1_2_size_matched(reg) {
    const a = reg.registers[0];
    const b = reg.registers[1];
    if(a.size !== b.size) {
        throw Error(REGISTER_SIZE_MISMATCH);
    }
    return [a,b,a.size];
}
/* Adapted from https://www.w3schools.com/js/js_bitwise.asp
   ======================================================== */
function dec2bin(dec,size){
    return dec.toString(2).padStart(size,"0");
}
function bin2dec(bin){
    return parseInt(bin,2).toString(10);
}
/* ======================================================== */

function right_shift(a,b,size) {
    const bitCount = size * 8;
    let aBits = dec2bin(a,b,bitCount);
    aBits = aBits.substring(0,bitCount-b).padStart(bitCount,"0");
    return bin2dec(aBits);
}
function left_shift(a,b,size) {
    const bitCount = size * 8;
    let aBits = dec2bin(a,b,bitCount);
    aBits = aBits.substring(b).padEnd(bitCount,"0");
    return bin2dec(aBits);
}
function not(a,size) {
    const bitCount = size * 8;
    let aBits = dec2bin(a,b,bitCount);
    for(let i = 0;i<aBits.length;i++) {
        if(aBits[i] == 0) {
            aBits[i] = 1;
        } else {
            aBits[i] = 0;
        }
    }
    return bin2dec(aBits);
}
function and(a,b,size) {
    const bitCount = size * 8;
    let aBits = dec2bin(a,b,bitCount);
    const bBits = dec2bin(a,b,bitCount);
    for(let i = 0;i<aBits.length;i++) {
        if(aBits[i] == 1 && bBits[i] == 1) {
            aBits[i] = 1;
        } else {
            aBits[i] = 0;
        }
    }
    return bin2dec(aBits);
}
function or(a,b,size) {
    const bitCount = size * 8;
    let aBits = dec2bin(a,b,bitCount);
    const bBits = dec2bin(a,b,bitCount);
    for(let i = 0;i<aBits.length;i++) {
        if(aBits[i] == 1 || bBits[i] == 1) {
            aBits[i] = 1;
        } else {
            aBits[i] = 0;
        }
    }
    return bin2dec(aBits);
}
function xor(a,b,size) {
    const bitCount = size * 8;
    let aBits = dec2bin(a,b,bitCount);
    const bBits = dec2bin(a,b,bitCount);
    for(let i = 0;i<aBits.length;i++) {
        if(aBits[i] != bBits[i]) {
            aBits[i] = 1;
        } else {
            aBits[i] = 0;
        }
    }
    return bin2dec(aBits);
}
const comparisons = [
    function equal(a,b){return a === b},
    function notEqual(a,b){return a !== b},
    function lessThan(a,b){return a > b},
    function greaterThan(a,b){return a < b},
    function greaterThanOrEqual(a,b){return a >= b},
    function lessThanOrEqual(a,b){return a <= b},
    function isZero(a){return a === 0},
    function isNotZero(a){return a !== 0},
    function isFull(a,_,size){return a === OVERFLOW_VALUES[size]-1},
    function isNotFull(a,_,size){return a !== OVERFLOW_VALUES[size]-1}
];
const comparisonCount = comparisons.length;
function processComparison(value1,value2,size,type) {
    if(type >= comparisonCount) {
        throw Error(INVALID_COMPARISON_TYPE);
    }
    return comparisons[type].call(null,value1,value2,size);
}
function set_address_prefix(reg,_,prm,size) {
    const register1 = reg.registers[prm[0]];
    if(register1.size !== 4) {
        throw Error(EXPECTED_32_BIT_REGISTER);
    }
    const register2 = reg.registers[prm[1]];
    if(register2.size !== size) {
        switch(size) {
            default:
                throw Error(INVALID_REGISTER_SIZE);
            case 8:
                throw Error(EXPECTED_8_BIT_REGISTER);
            case 16:
                throw Error(EXPECTED_16_BIT_REGISTER);
            case 32:
                throw Error(EXPECTED_32_BIT_REGISTER);
        }
    }
    return [register1.value,register2.value];
}
function preload_bytes_8(reg,mem,prm) {
    const register1 = reg.registers[prm[0]];
    const address = mem.allocate_8(size);
    register1.set(address,32);
    return address;
}
function preload_bytes_16(reg,mem,prm) {
    const register1 = reg.registers[prm[0]];
    const address = mem.allocate_16(size);
    register1.set(address,32);
    return address;
}
function preload_bytes_32(reg,mem,prm) {
    const register1 = reg.registers[prm[0]];
    const address = mem.allocate_32(size);
    register1.set(address,32);
    return address;
}
function free_memory(reg,mem,prm,size) {
    const register1 = reg.registers[prm[0]];
    if(register1.size !== 4) {
        throw Error(EXPECTED_32_BIT_REGISTER);
    }
    mem.free_8(register1.value,size);
}
/*
    Functions that read the ASM or read or write from the virtual memory require bit count sizes: 8, 16, 32
    The virtual register set is agnostic to which you use. That it to say... 8 == 1, 16 == 2, 32 == 4

    Note: This does not include preload_memory_block or free_memory_block,
    the underlying virtual memory methods use a size parameter that is not bit multipled
*/
const instructionProcessors = [
    function add(reg) {
        const registers = get_registers_1_2(reg);
        let value = registers[0].value + registers[1].value;
        const overflowPoint = OVERFLOW_VALUES[registers[2]];
        if(value >= overflowPoint) {
            value = value - overflowPoint;
        }
        registers[0].value = value;
    },
    function subtract(reg) {
        const registers = get_registers_1_2(reg);
        let value = registers[0].value - registers[1].value;
        if(value < 0) {
            value = OVERFLOW_VALUES[registers[2]] - value;
        }
        registers[0].value = value;
    },
    function multiply(reg) {
        const registers = get_registers_1_2(reg);
        registers[0].value = (registers[0].value * registers[1].value) % OVERFLOW_VALUES[registers[2]];
    },
    function divide(reg) {
        const registers = get_registers_1_2(reg);
        registers[0].value = Math.floor(registers[0].value / registers[1].value);
    }, 
    function modulus(reg) {
        const registers = get_registers_1_2(reg);
        registers[0].value = registers[0].value % registers[1].value;
    },
    function bitwise_and(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers[0].value = and(registers[0].value,registers[1].value,registers[2]);
    },
    function bitwise_or(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers[0].value = or(registers[0].value,registers[1].value,registers[2]);
    },
    function bitwise_xor(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers[0].value = xor(registers[0].value,registers[1].value,registers[2]);
    },
    function bitwise_not(reg) {
        const register = reg.registers[0];
        registers[0].value = not(register.value,register.size);
    },
    function bitwise_left_shift(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers[0].value = left_shift(registers[0].value,registers[1].value,registers[2]);
    },
    function bitwise_right_shift(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers[0].value = right_shift(registers[0].value,registers[1].value,registers[2]);
    },
    function compare(reg) {
        const register1 = reg.registers[0];
        const register2 = reg.registers[1];
        const comparisonRegister = reg.registers[2];
        if(comparisonRegister.size !== 1) {
            throw Error(INVALID_COMPARISON_TYPE);
        }
        const result = processComparison(
            register1.value,
            register2.value,
            register1.size,
            comparisonRegister.value
        );
        comparisonRegister.set(result?1:0,1);
    },
    function jump(reg) {
        const register4 = reg.registers[3];
        if(register4.size !== 4) {
            throw Error(INVALID_JUMP_REGISTER);
        }
        return {
            type: JUMP_DIRECTIVE,
            value: register4.value
        };
    },
    function conditional_jump(reg) {
        const register4 = reg.registers[3];
        if(register4.size !== 4) {
            throw Error(INVALID_JUMP_REGISTER);
        }
        if(reg.registers[2].value >= 1) {
            return {
                type: JUMP_DIRECTIVE,
                value: register4.value
            };
        }
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
    function copy_register(reg,_,prm) {
        const sourceRegister = reg.registers[prm[0]];
        reg.registers[prm[1]].set(sourceRegister.value,sourceRegister.size);
    },
    function swap_register(reg,_,prm) {
        const register1 = reg.registers[prm[0]];
        const register2 = reg.registers[prm[1]];
        const tmpSize = register1.size;
        const tmpValue = register1.value;
        register1.set(register2.value,register2.size);
        register2.set(tmpValue,tmpSize);
    },
    function set_address_8(reg,mem,prm) {
        const registerValues = set_address_prefix(reg,mem,prm,8);
        mem.set_8(registerValues[0],registerValues[1]);
    },
    function set_address_16(reg,mem,prm) {
        const registerValues = set_address_prefix(reg,mem,prm,16);
        mem.set_16(registerValues[0],registerValues[1]);
    },
    function set_address_32(reg,mem,prm) {
        const registerValues = set_address_prefix(reg,mem,prm,32);
        mem.set_32(registerValues[0],registerValues[1]);
    },
    function get_from_address_8(reg,mem,prm) {
        const register1 = reg.registers[prm[0]];
        if(register1.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        const register2 = reg.registers[prm[1]];
        register2.set(mem.get_8(register1.value));
    },
    function get_from_address_16(reg,mem,prm) {
        const register1 = reg.registers[prm[0]];
        if(register1.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        const register2 = reg.registers[prm[1]];
        register2.set(mem.get_16(register1.value));
    },
    function get_from_address_32(reg,mem,prm) {
        const register1 = reg.registers[prm[0]];
        if(register1.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        const register2 = reg.registers[prm[1]];
        register2.set(mem.get_32(register1.value));
    },
    function set_register_8(reg,_,prm) {
        reg.registers[prm[0]].set(prm[1],1);
    },
    function set_register_16(reg,_,prm) {
        reg.registers[prm[0]].set(prm[1],2);
    },
    function set_register_32(reg,_,prm) {
        reg.registers[prm[0]].set(prm[1],4);
    },
    function free_memory_8(reg,mem,prm) {
        const register1 = reg.registers[prm[0]];
        if(register1.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free_8(register1.value,size);
    },
    function free_memory_16(reg,mem,prm) {
        const register1 = reg.registers[prm[0]];
        if(register1.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free_16(register1.value,size);
    },
    function free_memory_32(reg,mem,prm) {
        const register1 = reg.registers[prm[0]];
        if(register1.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free_32(register1.value,size);
    },
    function input_stream(reg) {
        reg.registers[0].set(inputMethod(),1);
    },
    function output_stream(reg) {
        outputMethod(reg.registers[0].value);
    },
    function dummy(){
//This operation doesn't do anything
    },
    function preload_memory_block(reg,mem) {
        const register1 = reg.registers[0];
        const register2 = reg.registers[1];
        //Plain allocations are in bytes and not bits, despite the disclaimer at the top of all instructions methods!
        const address = mem.allocate(register1.value);
        register2.set(address,4);
    },
    function free_memory_block(reg,mem) {
        const register1 = reg.registers[0];
        const register2 = reg.registers[0];
        if(register2.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        //Plain allocations are in bytes and not bits, despite the disclaimer at the top of all instructions methods!
        mem.free(register2.value,register1.value);
    },
    function subroutine_call(reg,_,prm) {
        const register = reg.registers[prm[0]];
        if(register.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        return {
            type: CALL_DIRECTIVE,
            value: register.value
        };
    },
    function subroutine_return() {
        return {
            type: RETURN_DIRECTIVE
        };
    }
];
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

    let index = 0;
    let operationsExecuted = 0;
    const startTime = performance.now();
    while(index < operationCount) {
        operationsExecuted++;
        const operation = operations[index];
        const directive = operation[0](
            registers,memory,operation[1]
        );
        index++;
        if(directive) {
            /*  JUMP_DIRECTIVE = 0
                RETURN_DIRECTIVE = 1
                CALL_DIRECTIVE = 2    */
            if(directive.type > RETURN_DIRECTIVE) {
                //Call
                virtualStack.push([index,registers.copyRegisterStates()]);
                index = directive.value;
            } else if(directive.type < RETURN_DIRECTIVE) {
                //Jump
                index = directive.value;
            } else {
                //Return
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
        Number(duration.toFixed(2)),"\n",
        "Operations per second:",
        Number((operationsExecuted/duration).toFixed(2))
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
