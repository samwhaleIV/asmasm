"use strict";
import opcodes from "./opcodes.js";
const COMPILER_HELPER_SYMBOL = Symbol("COMPILER_HELPER");

const op_gen_comp_type = {
    JUMP_LABEL: Symbol("JUMP_LABEL"),
    JUMP_LINK: Symbol("JUMP_LINK"),
    SUBROUTINE_LABEL: Symbol("SUBROUTINE_LABEL"),
    SUBROUTINE_LINK: Symbol("SUBROUTINE_LINK")
};

const op_gen = new (function(){

    const getRegisterShorthand = register => {
        if(!register) {
            throw Error("Missing register parameter in opcode gen");
        }
        if(!isNaN(register)) {
            return opcodes.registers[register].shortHand;
        } else {
            return register;
        }
    };

    const basic = opcode => {
        return {type: opcodes[opcode.key]};
    };

    const validateSize = size => {
        size = Number(size);
        if(size === 1 || size === 2 || size === 4) {
            return size;
        } else {
            throw Error("Invalid parameter byte size. Must be 1, 2, 4, or 8")
        }
    };
    const validateValue = (value,size) => {
        if(size === 4 && typeof value === "object" && value.sym === COMPILER_HELPER_SYMBOL) {
            return value;
        }
        value = Number(value);
        if(value >= Math.pow(2,size*8) || value < 0) {
            throw Error("Value exceeds range specified by the size parameter");
        } else {
            return value;
        }
    };

    this.add = () =>                            basic(opcodes.ADD);
    this.subtract = () =>                       basic(opcodes.SUB);
    this.multiply = () =>                       basic(opcodes.MTP);
    this.divide = () =>                         basic(opcodes.DIV);
    this.modulus = () =>                        basic(opcodes.MOD);
    this.bitwise_and = () =>                    basic(opcodes.AND);
    this.bitwise_or = () =>                     basic(opcodes.OR);
    this.bitwise_xor = () =>                    basic(opcodes.XOR);
    this.bitwise_not = () =>                    basic(opcodes.NOT);
    this.bitwise_left_shift = () =>             basic(opcodes.L_SHIFT);
    this.bitwise_right_shift = () =>            basic(opcodes.R_SHIFT);
    this.compare = () =>                        basic(opcodes.CMP);
    this.jump = () =>                           basic(opcodes.JMP);
    this.conditional_jump = () =>               basic(opcodes.CON_JMP);
    this.input = () =>                          basic(opcodes.IN);
    this.output = () =>                         basic(opcodes.OUT);
    this.dummy = () =>                          basic(opcodes.DUMMY);
    this.return = () =>                         basic(opcodes.RET);

    this.load_bytes = (addressOutputRegister,value,size) => {
        size = validateSize(size);
        value = validateValue(value,size);
        addressOutputRegister = getRegisterShorthand(addressOutputRegister);
        return {
            type: opcodes[`LOAD_${size*8}`],
            payload: {
                value1: addressOutputRegister,
                value2: value
            }
        };
    };
    this.preload_bytes = (addressOutputRegister,size) => {
        size = validateSize(size);
        addressOutputRegister = getRegisterShorthand(addressOutputRegister);
        return {
            type: opcodes[`PRELOAD_${size*8}`],
            payload: {
                value1: addressOutputRegister
            }
        };
    };
    this.copy_register = (from,to) => {
        from = getRegisterShorthand(from);
        to = getRegisterShorthand(to);
        return {
            type: opcodes.COPY_REG,
            payload: {
                value1: from,
                value2: to
            }
        };
    };
    this.swap_register = (register1,register2) => {
        register1 = getRegisterShorthand(register1);
        register2 = getRegisterShorthand(register2);
        return {
            type: opcodes.SWAP_REG,
            payload: {
                value1: register1,
                value2: register2
            }
        };
    };
    this.set_address = (destinationAddressRegister,valueRegister,size) => {
        size = validateSize(size);
        destinationAddressRegister = getRegisterShorthand(destinationAddressRegister);
        valueRegister = getRegisterShorthand(valueRegister);
        return {
            type: opcodes[`SET_ADR_${size*8}`],
            payload: {
                value1: destinationAddressRegister,
                value2: valueRegister
            }
        };
    };
    this.get_from_address = (registerContainingAnAddress,targetRegister,size) => {
        registerContainingAnAddress = getRegisterShorthand(registerContainingAnAddress);
        targetRegister = getRegisterShorthand(targetRegister);
        return {
            type: opcodes[`GET_ADR_${size*8}`],
            payload: {
                value1: registerContainingAnAddress,
                value2: targetRegister
            }
        };
    };
    this.set_register = (targetRegister,value,size) => {
        size = validateSize(size);
        value = validateValue(value,size);
        targetRegister = getRegisterShorthand(targetRegister);
        return {
            type: opcodes[`SET_REG_${size*8}`],
            payload: {
                value1: targetRegister,
                value2: value
            }
        };
    };
    this.free_memory = (registerContainingAnAddress,size) => {
        size = validateSize(size);
        registerContainingAnAddress = getRegisterShorthand(registerContainingAnAddress);
        return {
            type: opcodes[`FREE_ADR_${size*8}`],
            payload: {
                value1: registerContainingAnAddress
            }
        };
    };
    this.preload_memory_block = registerContainingASize => {
        registerContainingASize = getRegisterShorthand(registerContainingASize);
        return {
            type: opcodes.PRELOAD_BLOCK,
            payload: {
                value1: registerContainingASize
            }
        };
    };
    this.free_memory_block = (registerContainingASize,registerContainingAnAddress) => {
        registerContainingASize = getRegisterShorthand(registerContainingASize);
        registerContainingAnAddress = getRegisterShorthand(registerContainingAnAddress);
        return {
            type: opcodes.FREE_BLOCK,
            payload: {
                value1: registerContainingASize,
                value2: registerContainingAnAddress
            }
        };
    };
    this.get_comparison_value = comparisonValue => {
        if(!isNaN(comparisonValue)) {
            return comparisonValue;
        }
        const comparison = opcodes.comparisons[comparisonValue];
        if(isNaN(comparison)) {
            throw Error("Unknown comparison type");
        }
        return comparison;
    };
    this.call = registerContainingAnAddress => {
        registerContainingAnAddress = getRegisterShorthand(registerContainingAnAddress);
        return {
            type: opcodes.CALL,
            payload: {
                value1: registerContainingAnAddress
            }
        }
    };
    this.jumpLabel = name => {
        return {
            sym: COMPILER_HELPER_SYMBOL,
            type: op_gen_comp_type.JUMP_LABEL,
            name: name
        };
    };
    this.subroutineLabel = name => {
        return {
            sym: COMPILER_HELPER_SYMBOL,
            type: op_gen_comp_type.SUBROUTINE_LABEL,
            name: name
        };
    };
    this.jumpLink = labelName => {
        return {
            sym: COMPILER_HELPER_SYMBOL,
            type: op_gen_comp_type.JUMP_LINK,
            name: labelName
        };
    };
    this.subroutineLink = labelName => {
        return {
            sym: COMPILER_HELPER_SYMBOL,
            type: op_gen_comp_type.SUBROUTINE_LINK,
            name: labelName
        };
    };
})();
export { op_gen, op_gen_comp_type, COMPILER_HELPER_SYMBOL };
export default op_gen;
