"use strict";
import { opcodes, OVERFLOW_VALUES } from "./opcodes.js";
import create_bytecode from "./op-binary.js";
import VirtualMemory from "./virtual-memory.js";
import VirtualRegisters from "./virtual-registers.js";

const INVALID_DIRECTIVE_ERROR =
"Unrecognized resulting operation directive; " +
"the interpreter has no idea what the" + 
"hell to do with this internal error";

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

const EXPECTED_8_BIT_REGISTER = "Expected an 8 bit register";
const EXPECTED_16_BIT_REGISTER = "Expected a 16 bit register";
const EXPECTED_32_BIT_REGISTER = "Expected a 32 bit register";

const JUMP_DIRECTIVE = 0;
const RETURN_DIRECTIVE = 1;
const CALL_DIRECTIVE = 2;
const OPERATION_LOG_PREFIX = "Operation: ";

function get_registers_1_2(reg) {
    const a = reg.registers[0];
    const b = reg.registers[1];
    const size = a.size;
    if(size < b.size) {
        throw Error(INCOMPATIBLE_CROSS_REGISTER_SIZE);
    }
    return [a,b,size];
}
function get_registers_1_2_size_matched(reg) {
    const a = reg.registers[0];
    const b = reg.registers[1];
    const size = a.size;
    if(size !== b.size) {
        throw Error(REGISTER_SIZE_MISMATCH);
    }
    return [a,b,size];
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
    (a,b) => a === b,
    (a,b) => a !== b,
    (a,b) => a > b,
    (a,b) => a < b,
    (a,b) => a >= b,
    (a,b) => a <= b,
    a => a === 0,
    a => a !== 0,
    (a,_,size) => a === OVERFLOW_VALUES[size]-1,
    (a,_,size) => a !== OVERFLOW_VALUES[size]-1
];
const comparisonCount = comparisons.length;
function processComparison(value1,value2,size,type) {
    if(type >= comparisonCount) {
        throw Error(INVALID_COMPARISON_TYPE);
    }
    return comparisons[type](value1,value2,size);
}
function set_address(reg,mem,idx,asm,size) {
    const register1 = reg.registers[asm.getUint8(idx)];
    if(register1.size !== 4) {
        throw Error(EXPECTED_32_BIT_REGISTER);
    }
    const register2 = reg.registers[asm.getUint8(idx+1)];
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
    mem.set(register1.value,size,register2.value);
}
function preload_bytes(reg,mem,idx,asm,size) {
    const register1 = reg.registers[asm.getUint8(idx)];
    const address = mem.allocate(size);
    register1.set(address,32);
    return address;
}
function get_from_address(reg,mem,idx,asm,size) {
    const register1 = reg.registers[asm.getUint8(idx)];
    if(register1.size !== 4) {
        throw Error(EXPECTED_32_BIT_REGISTER);
    }
    const register2 = reg.registers[asm.getUint8(idx+1)];
    register2.set(mem.get(register1.value,size),size);
}
function free_memory(reg,mem,idx,asm,size) {
    const register1 = reg.registers[asm.getUint8(idx)];
    if(register1.size !== 4) {
        throw Error(EXPECTED_32_BIT_REGISTER);
    }
    mem.free(register1.value,size);
}
/*
    Functions that read the ASM or read or write from the virtual memory require bit count sizes: 8, 16, 32
    The virtual register set is agnostic to which you use. That it to say... 8 == 1, 16 == 2, 32 == 4
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
    function load_bytes_8(reg,mem,idx,asm) {
        const address = preload_bytes(reg,mem,idx,asm,8);
        const value = asm.getUint8(idx+1);
        mem.set(address,size,value);
    },
    function load_bytes_16(reg,mem,idx,asm) {
        const address = preload_bytes(reg,mem,idx,asm,16);
        const value = asm.getUint16(idx+1);
        mem.set(address,size,value);
    },
    function load_bytes_32(reg,mem,idx,asm) {
        const address = preload_bytes(reg,mem,idx,asm,32);
        const value = asm.getUint32(idx+1);
        mem.set(address,size,value);
    },
    function preload_bytes_8(reg,mem,idx,asm) {
        preload_bytes(reg,mem,idx,asm,8);
    },
    function preload_bytes_16(reg,mem,idx,asm) {
        preload_bytes(reg,mem,idx,asm,16);
    },
    function preload_bytes_32(reg,mem,idx,asm) {
        preload_bytes(reg,mem,idx,asm,32);
    },
    function copy_register(reg,_,idx,asm) {
        const register1 = reg.registers[asm.getUint8(idx)];
        const register2 = reg.registers[asm.getUint8(idx+1)];
        register1.set(register2.value,register2.size);
    },
    function swap_register(reg,mem,idx,asm) {
        const register1 = reg.registers[asm.getUint8(idx)];
        const register2 = reg.registers[asm.getUint8(idx+1)];
        const tmpSize = register1.size;
        const tmpValue = register1.value;
        register1.set(register2.value,register2.size);
        register2.set(tmpValue,tmpSize);
    },
    function set_address_8(reg,mem,idx,asm) {
        set_address(reg,mem,idx,asm,8);
    },
    function set_address_16(reg,mem,idx,asm) {
        set_address(reg,mem,idx,asm,16);
    },
    function set_address_32(reg,mem,idx,asm) {
        set_address(reg,mem,idx,asm,32);
    },
    function get_from_address_8(reg,mem,idx,asm) {
        get_from_address(reg,mem,idx,asm,8);
    },
    function get_from_address_16(reg,mem,idx,asm) {
        get_from_address(reg,mem,idx,asm,16);
    },
    function get_from_address_32(reg,mem,idx,asm) {
        get_from_address(reg,mem,idx,asm,32);
    },
    function set_register_8(reg,_,idx,asm) {
        reg.registers[asm.getUint8(idx)].set(asm.getUint8(idx+1),1);
    },
    function set_register_16(reg,_,idx,asm) {
        reg.registers[asm.getUint8(idx)].set(asm.getUint16(idx+1),2);
    },
    function set_register_32(reg,_,idx,asm) {
        reg.registers[asm.getUint8(idx)].set(asm.getUint32(idx+1),4);
    },
    function free_memory_8(reg,mem,idx,asm) {
        free_memory(reg,mem,idx,asm,8);
    },
    function free_memory_16(reg,mem,idx,asm) {
        free_memory(reg,mem,idx,asm,16);
    },
    function free_memory_32(reg,mem,idx,asm) {
        free_memory(reg,mem,idx,asm,32);
    },
    function input_stream(reg) {
        reg.registers[0].set(getInput(),1);
    },
    function output_stream(reg) {
        output(reg.registers[0].value);
    },
    function dummy(){
//This operation doesn't do anything
    },
    function preload_memory_block(reg,mem) {
        const register1 = reg.registers[0];
        const register2 = reg.registers[1];
        const address = mem.allocate(register1.value*8);
        register2.set(address,4);
    },
    function free_memory_block(reg,mem) {
        const register1 = reg.registers[0];
        const register2 = reg.registers[0];
        if(register2.size !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free(register2.value,register1.value*8);
    },
    function subroutine_call(reg,_,idx,asm) {
        const register = reg.registers[asm.getUint8(idx)];
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

}

const interpreter = new (function il_interpreter(){
    function scriptExecutor(assembly,options) {
        let registers;
        let memory;
        let logOperations = false;
        if(options) {
            if(options.operationLog) {
                logOperations = true;
            }
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

        const operationAddressTable = [];
        let index = 0;
        let operationCount = 0;
        const byteLength = assembly.byteLength;
        const allOperations = opcodes.allOperations;

        while(index < byteLength) {
            const operationIndex = assemblyView.getUint8(index);
            const operation = allOperations[operationIndex];
            operationAddressTable[operationCount] = index;
            operationCount++;
            const stride = operation.stride;
            index += stride;
        }
        index = 0;
        while(index < byteLength) {
            const operationIndex = assemblyView.getUint8(index);
            const operation = allOperations[operationIndex];
            if(logOperations) {
                console.log(`${OPERATION_LOG_PREFIX}${operation.key}`);
            }
            const stride = operation.stride;
            const directive = instructionProcessors[operation.index](
                registers,memory,
                index+1,assemblyView
            );
            index += stride;
            if(directive) {
                /*  JUMP_DIRECTIVE = 0
                    RETURN_DIRECTIVE = 1
                    CALL_DIRECTIVE = 2    */
                if(directive.type > 1) { //Call
                    virtualStack.push([index,registers.copyRegisterStates()]);
                    index = operationAddressTable[directive.value];
                } else if(directive.type < 1) { //Jump
                    index = operationAddressTable[directive.value];
                } else { //Return
                    const stackPop = virtualStack.pop();
                    index = stackPop[0];
                    registers.applyRegisterStates(stackPop[1]);
                }
            }
        }
    };

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
