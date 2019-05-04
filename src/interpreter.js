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

const MOVE_DIRECTIVE = Symbol("MOVE_DIRECTIVE");
const JUMP_DIRECTIVE = Symbol("JUMP_DIRECTIVE");
const RETURN_DIRECTIVE = Symbol("RETURN_DIRECTIVE");
const CALL_DIRECTIVE = Symbol("CALL_DIRECTIVE");

function get_registers_1_2(reg) {
    const a = reg.getRegister(0);
    const b = reg.getRegister(1);
    const size = a.getSize();
    if(size < b.getSize()) {
        throw Error(INCOMPATIBLE_CROSS_REGISTER_SIZE);
    }
    return {a:a,b:b,size:size};
}
function get_registers_1_2_size_matched(reg) {
    const a = reg.getRegister(0);
    const b = reg.getRegister(1);
    const size = a.getSize();
    if(size !== b.getSize()) {
        throw Error(REGISTER_SIZE_MISMATCH);
    }
    return {a:a,b:b,size:size};
}
function get_registers_1_2_sizeless(reg) {
    const a = reg.getRegister(0);
    const b = reg.getRegister(1);
    return {a:a,b:b};
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
    (a,b) => a < b,
    (a,b) => a >= b,
    (a,b) => a <= b,
    a => a === 0,
    a => a !== 0,
    (a,b,size) => a === OVERFLOW_VALUES[size]-1,
    (a,b,size) => a !== OVERFLOW_VALUES[size]-1
];
const comparisonCount = comparisons.length;
function processComparison(value1,value2,size,type) {
    if(type >= comparisonCount) {
        throw Error(INVALID_COMPARISON_TYPE);
    }
    return comparisons[type](value1,value2,size);
}
function set_address(reg,mem,idx,asm,size) {
    const register1 = reg.getRegister(asm.getUint8(idx));
    if(register1.getSize() !== 4) {
        throw Error(EXPECTED_32_BIT_REGISTER);
    }
    const register2 = reg.getRegister(asm.getUint8(idx+1));
    if(register2.getSize() !== size) {
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
    mem.set(register1.get(),size,register2.get());
}
function preload_bytes(reg,mem,idx,asm,size) {
    const register1 = reg.getRegister(asm.getUint8(idx));
    const address = mem.allocate(size);
    register1.set(address,32);
    return address;
}
function load_bytes(reg,mem,idx,asm,size) {
    const address = preload_bytes(reg,mem,idx,asm,size);
    const value = asm[`getUint${size}`](idx+1);
    mem.set(address,size,value);
}
function get_from_address(reg,mem,idx,asm,size) {
    const register1 = reg.getRegister(asm.getUint8(idx));
    if(register1.getSize() !== 4) {
        throw Error(EXPECTED_32_BIT_REGISTER);
    }
    const register2 = reg.getRegister(asm.getUint8(idx+1));
    register2.set(mem.get(register1.get(),size),size);
}
function set_register(reg,idx,asm,size) {
    const register1 = reg.getRegister(asm.getUint8(idx));
    const value = asm[`getUint${size}`](idx+1);
    register1.set(value,size);
}
function free_memory(reg,mem,idx,asm,size) {
    const register1 = reg.getRegister(asm.getUint8(idx));
    if(register1.getSize() !== 4) {
        throw Error(EXPECTED_32_BIT_REGISTER);
    }
    mem.free(register1.get(),size);
}
function conditional_pac(reg,type) {
    const register4 = reg.getRegister(3);
    if(register4.getSize() !== 4) {
        throw Error(INVALID_JUMP_REGISTER);
    }
    const comparisonRegister = reg.getRegister(2);
    if(comparisonRegister.get() >= 1) {
        return {
            type: type,
            value: register4.get()
        };
    }
}
function pac(reg,type) {
    const register4 = reg.getRegister(3);
    if(register4.getSize() !== 4) {
        throw Error(INVALID_JUMP_REGISTER);
    }
    return {
        type: type,
        value: register4.get()
    };
}
/*
    Functions that read the ASM or read or write from the virtual memory require bit count sizes: 8, 16, 32
    The virtual register set is agnostic to which you use. That it to say... 8 == 1, 16 == 2, 32 == 4
*/
const instructionProcessors = [
    function add(reg) {
        const registers = get_registers_1_2(reg);
        let value = registers.a.get() + registers.b.get();
        const overflowPoint = OVERFLOW_VALUES[registers.size];
        if(value >= overflowPoint) {
            value = value - overflowPoint;
        }
        registers.a.set(value);
    },
    function subtract(reg) {
        const registers = get_registers_1_2(reg);
        let value = registers.a.get() - registers.b.get();
        if(value < 0) {
            value = OVERFLOW_VALUE[registers.size] - value;
        }
        registers.a.set(value);
    },
    function multiply(reg,mem,idx,asm) {
        const registers = get_registers_1_2(reg);
        registers.a.set(
            (registers.a.get() * registers.b.get()) % OVERFLOW_VALUES[registers.size]
        );
    },
    function divide(reg) {
        const registers = get_registers_1_2(reg);
        registers.a.set(
            Math.floor(registers.a.get() / registers.b.get())
        );
    }, 
    function modulus(reg) {
        const registers = get_registers_1_2(reg);
        registers.a.set(
           registers.a.get() % registers.b.get()
        );
    },
    function bitwise_and(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers.a.set(
            and(registers.a.get(),registers.b.get(),registers.size)
        );
    },
    function bitwise_or(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers.a.set(
            or(registers.a.get(),registers.b.get(),registers.size)
        );
    },
    function bitwise_xor(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers.a.set(
            xor(registers.a.get(),registers.b.get(),registers.size)
        );
    },
    function bitwise_not(reg) {
        const register = reg.getRegister(0);
        registers.a.set(not(register.a.get(),register.a.getSize()));
    },
    function bitwise_left_shift(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers.a.set(
            left_shift(registers.a.get(),registers.b.get(),registers.size)
        );
    },
    function bitwise_right_shift(reg) {
        const registers = get_registers_1_2_size_matched(reg);
        registers.a.set(
            right_shift(registers.a.get(),registers.b.get(),registers.size)
        );
    },
    function compare(reg) {
        const registers = get_registers_1_2_sizeless(reg);
        const comparisonRegister = reg.getRegister(2);
        if(comparisonRegister.getSize() !== 1) {
            throw Error(INVALID_COMPARISON_TYPE);
        }
        const result = processComparison(
            registers.a.get(),
            registers.b.get(),
            registers.a.getSize(),
            comparisonRegister.get()
        );
        comparisonRegister.set(result?1:0,1);
    },
    function move(reg) {
        return pac(reg,MOVE_DIRECTIVE);
    },
    function jump(reg) {
        return pac(reg,JUMP_DIRECTIVE);
    },
    function conditional_jump(reg) {
        return conditional_pac(reg,JUMP_DIRECTIVE);
    },
    function conditional_move(reg) {
        return conditional_pac(reg,MOVE_DIRECTIVE);
    },
    function load_bytes_8(reg,mem,idx,asm) {
        load_bytes(reg,mem,idx,asm,8);
    },
    function load_bytes_16(reg,mem,idx,asm) {
        load_bytes(reg,mem,idx,asm,16);
    },
    function load_bytes_32(reg,mem,idx,asm) {
        load_bytes(reg,mem,idx,asm,32);
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
    function copy_register(reg,mem,idx,asm) {
        const register1 = reg.getRegister(asm.getUint8(idx));
        const register2 = reg.getRegister(asm.getUint8(idx+1));
        register1.set(register2.get(),register2.getSize());
    },
    function swap_register(reg,mem,idx,asm) {
        const register1 = reg.getRegister(asm.getUint8(idx));
        const register2 = reg.getRegister(asm.getUint8(idx+1));
        const tmpSize = register1.getSize();
        const tmpValue = register1.get();
        register1.set(register2.get(),register2.getSize());
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
    function set_register_8(reg,mem,idx,asm) {
        set_register(reg,idx,asm,8);
    },
    function set_register_16(reg,mem,idx,asm) {
        set_register(reg,idx,asm,16);
    },
    function set_register_32(reg,mem,idx,asm) {
        set_register(reg,idx,asm,32);
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
    async function input_stream(reg) {
        const register1 = reg.getRegister(0);
        const inputValue = await getInput();
        register1.set(inputValue,1);
    },
    function output_stream(reg) {
        const register1 = reg.getRegister(0);
        if(register1.getSize() !== 1) {
            throw Error(EXPECTED_8_BIT_REGISTER);
        }
        output(register1.get());
    },
    function dummy(){
//This operation doesn't do anything
    },
    function preload_memory_block(reg,mem,idx,asm) {
        const register1 = reg.getRegister(0);
        const register2 = reg.getRegister(1);
        const address = mem.allocate(register1.get()*8);
        register2.set(address,4);
    },
    function free_memory_block(reg,mem,idx,asm) {
        const register1 = reg.getRegister(0);
        const register2 = reg.getRegister(0);
        if(register2.getSize() !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        mem.free(register2.get(),register1.get()*8);
    },
    function subroutine_call(reg,mem,idx,asm) {
        const register = reg.getRegister(asm.getUint8(idx));
        if(register.getSize() !== 4) {
            throw Error(EXPECTED_32_BIT_REGISTER);
        }
        return {
            type: CALL_DIRECTIVE,
            value: register.get()
        };
    },
    function subroutine_return() {
        return {
            type: RETURN_DIRECTIVE
        };
    }
];

const interpreter = new (function il_interpreter(){
    async function scriptExecutor(assembly,options) {
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
        let index = 0;
        while(index < assembly.byteLength) {
            const operationIndex = assemblyView.getUint8(index);
            const operation = opcodes.allOperations[
                operationIndex
            ];
            const stride = operation.stride;
            const directive = await instructionProcessors[operation.index](
                registers,memory,
                index+1,assemblyView
            );
            index += stride;
            if(directive) {
                switch(directive.type) {
                    case MOVE_DIRECTIVE:
                        index += directive.value;
                        break;
                    case JUMP_DIRECTIVE:
                        index = directive.value;
                        break;
                    case RETURN_DIRECTIVE:
                        index = virtualStack.pop();
                        break;
                    case CALL_DIRECTIVE:
                        virtualStack.push(index);
                        index = directive.value;
                        break;
                    default:
                        throw Error(INVALID_DIRECTIVE_ERROR);
                }
            }
        }
    };

    this.executeAssembly = async function(assembly,options) {
        let compiledAssembly = null;
        if(assembly.byteLength === undefined) {
            console.log("Assembly is not compiled byte code... Compiling now");
            compiledAssembly = create_bytecode(assembly);
            console.log("Assembly compilation complete!");
        } else {
            compiledAssembly = assembly;
        }
        try {
            await scriptExecutor(compiledAssembly,options);
            return true;
        } catch(error) {
            console.error(error);
            return false;
        }
    }
})();
export default interpreter;
