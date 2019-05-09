"use strict";
const BITWISE_IN_PLACE_DESCRIPTION = "Register 1 is modified in place by register 2";

const REGISTER_SHORTHAND = "REGISTER_SHORTHAND";
const VALUE_8 =  "VALUE_8";
const VALUE_16 = "VALUE_16";
const VALUE_32 = "VALUE_32";

const PARAMETER_BYTE_TABLE = {};
PARAMETER_BYTE_TABLE[REGISTER_SHORTHAND] = 1;
PARAMETER_BYTE_TABLE[VALUE_8] = 1;
PARAMETER_BYTE_TABLE[VALUE_16] = 2;
PARAMETER_BYTE_TABLE[VALUE_32] = 4;

const OVERFLOW = {};
OVERFLOW[VALUE_8] = Math.pow(2,8);
OVERFLOW[VALUE_16] = Math.pow(2,16);
OVERFLOW[VALUE_32] = Math.pow(2,32);

const OVERFLOW_VALUES = [];
OVERFLOW_VALUES[0] = OVERFLOW[VALUE_8];
OVERFLOW_VALUES[2] = OVERFLOW[VALUE_16];
OVERFLOW_VALUES[4] = OVERFLOW[VALUE_32];

const opcodes = new (function opcode_list() {

    this.ADD = {
        name: "Add",
        description: "Register 2 is added to register 1 in place"
    };
    this.SUB = {
        name: "Subtract",
        description: "Register 1 is subtracted by register 2 in place"
    };
    this.MTP = {
        name: "Multiply",
        description: "Register 1 is multiplied by register 2 in place"
    };
    this.DIV = {
        name: "Divide",
        description: "Register 1 (dividend) is divided by register 2 (divisor) and the result is sent to register 1 (in place)"
    };
    this.MOD = {
    /* The resulting sign of modulus is intended to be the sign of the dividend, following JavaScript */
        name: "Modulus",
        description: "Register 1 (dividend) is modulated by register 2 (divisor) and the result is sent to register 1"
    };
/*
    Bitwise operations adopted from:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
*/
    this.AND = {
        name: "Bitwise AND",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "A [1] in each bit position for which the corresponding bits of both operands are [1]s"
    };
    this.OR = {
        name: "Bitwise OR",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "A [1] in each bit position for which the corresponding bits of either or both operands are [1]s"
    };
    this.XOR = {
        name: "Bitwise XOR",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "A [1] in each bit position for which the corresponding bits of either but not both operands are [1]s"
    };
    this.NOT = {
        name: "Bitwise NOT",
        description: "Register 1 is bit inverted in place",
        secondaryDescription: "Inverts the bits of its operand"
    };
    this.L_SHIFT = {
        name: "Left shift",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "Shifts [a] in binary representation [b] to the left, shifting in [0]s from the right"
    };
    this.R_SHIFT = {
        name: "Zero fill right shift",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "Shifts [a] in binary representation [b] to the right, propagating the left-most bit from the left"
    };

    /* Program control (flow) */
    this.CMP = {
        name: "Compare",
        description: "Compares register 1 to register 2 using the comparison type by register 3, a comparison byte result going to register 3. Depending on the sign, register 2 might not be used"
    };

    this.JMP = {
        name: "Jump",
        description: "Jumps to a location specified by register 4"
    };
    this.CON_JMP = {
        name: "Conditional jump",
        description: "If the comparison register (3) is true, jumps to the location specified by register 4. Otherwise flow is continued as normal"
    };

    /* Value loading */
    this.LOAD_8 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_8],
        name: "Load bytes",
        description: "Loads 1 byte from value 2 and sends the address to the register shorthand found in value 1"
    };
    this.LOAD_16 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_16],
        name: "Load bytes",
        description: "Loads 2 bytes from value 2 and sends the address to the register shorthand found in value 1"
    };
    this.LOAD_32 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_32],
        name: "Load bytes",
        description: "Loads 4 bytes from value 2 and sends the address to the register shorthand found in value 1"
    };

    this.PRELOAD_8 = {
        parameterSchema: [REGISTER_SHORTHAND],
        name: "Preload bytes",
        description: "Reserves 1 byte and sends the address to the register shorthand found in value 1"
    };
    this.PRELOAD_16 = {
        parameterSchema: [REGISTER_SHORTHAND],
        name: "Preload bytes",
        description: "Reserves 2 bytes and sends the address to the register shorthand found in value 1"
    };
    this.PRELOAD_32 = {
        parameterSchema: [REGISTER_SHORTHAND],
        name: "Preload bytes",
        description: "Reserves 4 bytes and sends the address to the register shorthand found in value 1"
    };

    /* Register control */
    this.COPY_REG = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Copy register",
        description: "Copies the value of the register shorthand in value 1 to the register shorthand of value 2"
    };
    this.SWAP_REG = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Swap register",
        description: "Swaps the values by the register shorthands found in value 1 and value 2"
    };
    this.SET_ADR_8 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Set address",
        description: "Sets the variable at address of the register shorthand of register 1 by value of the register shorthand of value 2, expecting 1 byte"
    };
    this.SET_ADR_16 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Set address",
        description: "Sets the variable at address of the register shorthand of register 1 by value of the register shorthand of value 2, expecting 2 bytes"
    };
    this.SET_ADR_32 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Set address",
        description: "Sets the variable at address of the register shorthand of register 1 by value of the register shorthand of value 2, expecting 4 bytes"
    };

    this.GET_ADR_8 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Get variable",
        description: "Gets 1 byte at the address of the register shorthand of value 1 and puts it in the register shorthand of value 2",
        secondaryDescription: "The first register shorthand is a register that contains and address"
    };
    this.GET_ADR_16 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Get variable",
        description: "Gets 2 bytes at the address of the register shorthand of value 1 and puts it in the register shorthand of value 2",
        secondaryDescription: "The first register shorthand is a register that contains and address"
    };
    this.GET_ADR_32 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Get variable",
        description: "Gets 4 bytes at the address of the register shorthand of value 1 and puts it in the register shorthand of value 2",
        secondaryDescription: "The first register shorthand is a register that contains and address"
    };

    this.SET_REG_8 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_8],
        name: "Set register",
        description: "Direct to register value loading with 1 byte"
    };
    this.SET_REG_16 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_16],
        name: "Set register",
        description: "Direct to register value loading with 2 bytes"
    };
    this.SET_REG_32 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_32],
        name: "Set register",
        description: "Direct to register value loading with 4 bytes"
    };
    this.FREE_ADR_8 = {
        parameterSchema: [REGISTER_SHORTHAND],
        name: "Free memory",
        description: "Frees 1 byte of memory found at the address of register 1"
    };
    this.FREE_ADR_16 = {
        parameterSchema: [REGISTER_SHORTHAND],
        name: "Free memory",
        description: "Frees 2 bytes of memory found at the address of register 1"
    };
    this.FREE_ADR_32 = {
        parameterSchema: [REGISTER_SHORTHAND],
        name: "Free memory",
        description: "Frees 4 bytes of memory found at the address of register 1"
    };

    this.IN = {
        name: "Input",
        description: "Sends the first value of the input stream to register 1"
    };
    this.OUT = {
        name: "Output",
        description: "Sends the value of register 1 to the output stream"
    };
    this.NOP = {
        name: "Dummy",
        description: "Absolutely nothing. Sometimes helpful for program flow and control"
    };

    this.PRELOAD_BLOCK = {
        parameterSchema: [REGISTER_SHORTHAND],
        name: "Preload block",
        description: "Allocates a block of the size in bytes found in register 1, returning the address of the block to register 2"
    };
    this.FREE_BLOCK = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        name: "Free block",
        description: "Frees a block of the size in bytes found in register 1, starting at the address found in register 2"
    };
    this.CALL = {
        parameterSchema: [REGISTER_SHORTHAND],
        name: "Call",
        description: "Enters a subroutine at the specified address of the register shorthand"
    };
    this.RET = {
        name: "Return",
        description: "Exits a subroutine and returns to its entry point"
    };

    Object.entries(this).forEach(entry=>{
        entry[1].key = entry[0];
    })

    this.arithmetic = [this.ADD,this.SUB,this.MTP,this.DIV,this.MOD];
    this.bitwise = [this.AND,this.OR,this.XOR,this.NOT,this.L_SHIFT,this.R_SHIFT];
    this.memoryControl = [
        this.LOAD_8,this.LOAD_16,this.LOAD_32,
        this.PRELOAD_8,this.PRELOAD_16,this.PRELOAD_32,this.PRELOAD_BLOCK,
        this.FREE_ADR_8,this.FREE_ADR_16,this.FREE_ADR_32,this.FREE_BLOCK
    ];
    this.registerControl = [
        this.COPY_REG,this.SWAP_REG,
        this.SET_ADR_8,this.SET_ADR_16,this.SET_ADR_32,
        this.GET_ADR_8,this.GET_ADR_16,this.GET_ADR_32,
        this.SET_REG_8,this.SET_REG_16,this.SET_REG_32,
    ];
    this.programControl = [this.CMP,this.JMP,this.CON_JMP,this.NOP,this.CALL,this.RET];
    this.IO = [this.IN,this.OUT];

    this.allOperations = [];
    [...this.arithmetic,
     ...this.bitwise,
     ...this.memoryControl,
     ...this.registerControl,
     ...this.programControl,
     ...this.IO
    ].forEach((operation,idx) => {
        operation.index = idx;
        if(this.allOperations[operation.index]) {
            throw Error("Operation index is used more than once");
        }
        operation.stride = 1;
        if(operation.parameterSchema) {
            let parameterSize = 0;
            operation.parameterSchema.forEach(schemaToken => {
                parameterSize += PARAMETER_BYTE_TABLE[schemaToken];
            });
            operation.parameterSize = parameterSize;
            operation.stride += parameterSize;
        }
        this.allOperations[operation.index] = operation;
    });
    this.registers = [
        {
            shortHand: "r1",
            name: "Register 1",
            description: "First value register, resulting values using register 1 and 2 typically end up here"
        },
        {
            shortHand: "r2",
            name: "Register 2",
            description: "A secondary register usually containing the right-hand operand"
        },
        {
            shortHand: this.CMP.key.toLowerCase(),
            name: "Register 3",
            description: "A third register used for the comparison sign in cmp. Also holds the result of cmp"
        },
        {
            shortHand: this.JMP.key.toLowerCase(),
            name: "Register 4",
            description: "A register for jump data to be used by jump"
        },
        /* 5 through 8 are generic registers. They are not modified by any side effects. */
        {
            shortHand: "v1",
            name: "Register 5",
            description: "Geneic register"
        },
        {
            shortHand: "v2",
            name: "Register 6",
            description: "Generic register"
        },
        {
            shortHand: "v3",
            name: "Register 7",
            description: "Generic register"
        },
        {
            shortHand: "v4",
            name: "Register 8",
            description: "Generic register"
        },
        {
            shortHand: "arg",
            name: "Register 9",
            description: "Function argument register. Could contain a value or an address, depends on the higher level subroutine implementation"
        },
        {
            shortHand: "ret",
            name: "Register 10",
            description: "Return register. Could contain a value or an address, depends on the higher level subroutine implementation"
        }
    ];
    this.copyableRegisterCount = this.registers.length - 2;
    this.registerLookup = {};
    this.registers.forEach((register,index) => {
        register.index = index;
        this.registerLookup[register.shortHand] = register;
    });
    this.comparisons = {
        equal: 0,
        notEqual: 1,
        greaterThan: 2,
        lessThan: 3,
        greaterThanOrEqual: 4,
        lessThanOrEqual: 5,
        isZero: 6,
        isNotZero: 7,
        isFull: 8,
        isNotFull: 9,
        "<": 3,
        ">": 2,
        ">=": 4,
        "<=": 5,
        "=": 0,
        "!=": 1,
        "0": 6,
        "!0": 7,
        "F": 8,
        "!F": 9,
    };
    for(let i = 0;i<this.registers.length;i++) {
        this.registers[i].index = i;
    }
})();
export default opcodes;
export { opcodes, OVERFLOW, OVERFLOW_VALUES, REGISTER_SHORTHAND, VALUE_8, VALUE_16, VALUE_32, PARAMETER_BYTE_TABLE };
