const BITWISE_IN_PLACE_DESCRIPTION = "Register 1 is modified in place by register 2";

const REGISTER_SHORTHAND = "REGISTER_SHORTHAND";
const VALUE_8 = "VALUE_8";
const VALUE_16 = "VALUE_16";
const VALUE_32 = "VALUE_32";

const PARAMETER_BYTE_TABLE = {};
PARAMETER_BYTE_TABLE[REGISTER_SHORTHAND] = 1;
PARAMETER_BYTE_TABLE[VALUE_8] = 1;
PARAMETER_BYTE_TABLE[VALUE_16] = 2;
PARAMETER_BYTE_TABLE[VALUE_32] = 4;

const opcodes = new (function opcode_list() {

    this.ADD = {
        index: 0,
        name: "Add",
        description: "Register 2 is added to register 1 in place"
    };
    this.SUB = {
        index: 1,
        name: "Subtract",
        description: "Register 1 is subtracted by register 2 in place"
    };
    this.MTP = {
        index: 2,
        name: "Multiply",
        description: "Register 1 is multiplied by register 2 in place"
    };
    this.DIV = {
        index: 3,
        name: "Divide",
        description: "Register 1 (dividend) is divided by register 2 (divisor) and the result is sent to register 1 (in place)"
    };
    this.MOD = {
    /* The resulting sign of modulus is intended to be the sign of the dividend, following JavaScript */
        index: 4,
        name: "Modulus",
        description: "Register 1 (dividend) is modulated by register 2 (divisor) and the result is sent to register 1"
    };
/*
    Bitwise operations adopted from:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
*/
    this.AND = {
        index: 5,
        name: "Bitwise AND",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "A [1] in each bit position for which the corresponding bits of both operands are [1]s"
    };
    this.OR = {
        index: 6,
        name: "Bitwise OR",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "A [1] in each bit position for which the corresponding bits of either or both operands are [1]s"
    };
    this.XOR = {
        index: 7,
        name: "Bitwise XOR",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "A [1] in each bit position for which the corresponding bits of either but not both operands are [1]s"
    };
    this.NOT = {
        index: 8,
        name: "Bitwise NOT",
        description: "Register 1 is bit inverted in place",
        secondaryDescription: "Inverts the bits of its operand"
    };
    this.L_SHIFT = {
        index: 9,
        name: "Left shift",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "Shifts [a] in binary representation [b] (< 32) bits to the left, shifting in [0]s from the right"
    };
    this.R_SHIFT = {
        index: 10,
        name: "Zero-fill right shift",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "Shifts [a] in binary representation [b] (< 32) bits to the right, discarding bits shifted off, and shifting in [0]s from the left"
    };
    this.R_SHIFT_SIGN = {
        index: 11,
        name: "Sign-propagating right shift",
        description: BITWISE_IN_PLACE_DESCRIPTION,
        secondaryDescription: "Shifts [a] in binary representation [b] (< 32) bits to the right, discarding bits shifted off"
    };

    /* Program control (flow) */
    this.CMP = {
        index: 12,
        name: "Compare",
        description: "Compares register 1 to register 2 using the comparison type by register 3, a comparison byte result going to register 3. Depending on the sign, register 2 might not be used"
    };
    this.MOV = {
        index: 13,
        name: "Move",
        description: "Moves (skips) by the amount specified by register 4"
    };
    this.JMP = {
        index: 14,
        name: "Jump",
        description: "Jumps to a location specified by register 4"
    };
    this.CON_JMP = {
        index: 15,
        name: "Conditional jump",
        description: "If the comparison register (3) is true, moves by the amount specified by register 4. Otherwise flow is continued as normal"
    };
    this.CON_MOV = {
        index: 16,
        name: "Conditional move",
        description: "If the comparison register (3) is true, jumps to the location specified by register 4. Otherwise flow is continued as normal"
    };

    /* Value loading */
    this.LOAD_8 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_8],
        index: 17,
        name: "Load bytes",
        description: "Loads 1 byte from value 2 and sends the address to the register shorthand found in value 1"
    };
    this.LOAD_16 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_16],
        index: 18,
        name: "Load bytes",
        description: "Loads 2 bytes from value 2 and sends the address to the register shorthand found in value 1"
    };
    this.LOAD_32 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_32],
        index: 19,
        name: "Load bytes",
        description: "Loads 4 bytes from value 2 and sends the address to the register shorthand found in value 1"
    };

    this.PRELOAD_8 = {
        parameterSchema: [REGISTER_SHORTHAND],
        index: 20,
        name: "Preload bytes",
        description: "Reserves 1 byte and sends the address to the register shorthand found in value 1"
    };
    this.PRELOAD_16 = {
        parameterSchema: [REGISTER_SHORTHAND],
        index: 21,
        name: "Preload bytes",
        description: "Reserves 2 bytes and sends the address to the register shorthand found in value 1"
    };
    this.PRELOAD_32 = {
        parameterSchema: [REGISTER_SHORTHAND],
        index: 22,
        name: "Preload bytes",
        description: "Reserves 4 bytes and sends the address to the register shorthand found in value 1"
    };

    /* Register control */
    this.COPY_REG = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        index: 23,
        name: "Copy register",
        description: "Copies the value of the register shorthand in value 2 to the register shorthand of value 1"
    };
    this.SWAP_REG = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        index: 24,
        name: "Swap register",
        description: "Swaps the values by the register shorthands found in value 1 and value 2"
    };
    this.SET_ADR_8 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        index: 25,
        name: "Set address",
        description: "Sets the variable at address of the register shorthand of register 1 by value of the register shorthand of value 2, expecting 1 byte"
    };
    this.SET_ADR_16 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        index: 26,
        name: "Set address",
        description: "Sets the variable at address of the register shorthand of register 1 by value of the register shorthand of value 2, expecting 2 bytes"
    };
    this.SET_ADR_32 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        index: 27,
        name: "Set address",
        description: "Sets the variable at address of the register shorthand of register 1 by value of the register shorthand of value 2, expecting 4 bytes"
    };

    this.GET_ADR_8 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        index: 28,
        name: "Get variable",
        description: "Gets 1 byte at the register shorthand of value 1 and puts it in the register shorthand of value 2",
        secondaryDescription: "The first register shorthand is a register that contains and address"
    };
    this.GET_ADR_16 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        index: 29,
        name: "Get variable",
        description: "Gets 2 bytes at the register shorthand of value 1 and puts it in the register shorthand of value 2",
        secondaryDescription: "The first register shorthand is a register that contains and address"
    };
    this.GET_ADR_32 = {
        parameterSchema: [REGISTER_SHORTHAND,REGISTER_SHORTHAND],
        index: 30,
        name: "Get variable",
        description: "Gets 4 bytes at the register shorthand of value 1 and puts it in the register shorthand of value 2",
        secondaryDescription: "The first register shorthand is a register that contains and address"
    };

    this.SET_REG_8 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_8],
        index: 31,
        name: "Set register",
        description: "Direct to register value loading with 1 byte"
    };
    this.SET_REG_16 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_16],
        index: 32,
        name: "Set register",
        description: "Direct to register value loading with 2 bytes"
    };
    this.SET_REG_32 = {
        parameterSchema: [REGISTER_SHORTHAND,VALUE_32],
        index: 33,
        name: "Set register",
        description: "Direct to register value loading with 4 bytes"
    };

    this.FREE_ADR_8 = {
        parameterSchema: [REGISTER_SHORTHAND],
        index: 34,
        name: "Free memory",
        description: "Frees 1 byte of memory found at the address of register 1"
    };
    this.FREE_ADR_16 = {
        parameterSchema: [REGISTER_SHORTHAND],
        index: 35,
        name: "Free memory",
        description: "Frees 2 bytes of memory found at the address of register 1"
    };
    this.FREE_ADR_32 = {
        parameterSchema: [REGISTER_SHORTHAND],
        index: 36,
        name: "Free memory",
        description: "Frees 4 bytes of memory found at the address of register 1"
    };

    const operations = Object.entries(this);
    this.allOperations = [];
    operations.forEach(entry => {
        entry[1].key = entry[0];
        if(this.allOperations[entry[1].index]) {
            throw Error("Operation index is used more than once");
        }
        entry[1].stride = 1;
        if(entry[1].parameterSchema) {
            let parameterSize = 0;
            entry[1].parameterSchema.forEach(schemaToken => {
                parameterSize += PARAMETER_BYTE_TABLE[schemaToken];
            });
            entry[1].parameterSize = parameterSize;
            entry[1].stride += parameterSize;
        }
        this.allOperations[entry[1].index] = entry[1];
    });

    /* Arithmetic the adjective, not the noun! /ˌeriTHˈmedik/ */
    this.arithmetic = [this.ADD,this.SUB,this.MTP,this.DIV,this.MOD];
    this.bitwise = [this.AND,this.OR,this.XOR,this.NOT,this.L_SHIFT,this.R_SHIFT,this.R_SHIFT_SIGN];
    this.valueLoading = [
        this.LOAD_8,this.LOAD_16,this.LOAD_32,
        this.PRELOAD_8,this.PRELOAD_16,this.PRELOAD_32,
    ];
    this.registerControl = [
        this.COPY_REG,this.SWAP_REG,
        this.SET_ADR_8,this.SET_ADR_16,this.SET_ADR_32,
        this.GET_ADR_8,this.GET_ADR_16,this.GET_ADR_32,
        this.SET_REG_8,this.SET_REG_16,this.SET_REG_32,
    ];
    this.memoryRelease = [
        this.FREE_ADR_8,this.FREE_ADR_16,this.FREE_ADR_32,
    ];
    this.programControl = [this.CMP,this.MOV,this.JMP,this.CON_JMP,this.CON_MOV];
    this.registers = [
        {
            shortHand: "reg1",
            name: "Register 1",
            description: "First value register, resulting values using register 1 and 2 typically end up here"
        },
        {
            shortHand: "reg2",
            name: "Register 2",
            description: "A secondary register usually containing the right-hand operand"
        },
        {
            shortHand: "reg3",
            name: "Register 3",
            description: "A third register used for the comparison sign in cmp. Also holds the result of cmp"
        },
        {
            shortHand: "reg4",
            name: "Register 4",
            description: "A register for holding move and jump data to be used by jump and move"
        },
        /* 5 through 8 are generic registers. They are not modified by any side effects. */
        {
            shortHand: "reg5",
            name: "Register 5",
            description: "Geneic register"
        },
        {
            shortHand: "reg6",
            name: "Register 6",
            description: "Generic register"
        },
        {
            shortHand: "reg7",
            name: "Register 7",
            description: "Generic register"
        },
        {
            shortHand: "reg8",
            name: "Register 8",
            description: "Generic register"
        },
        {
            shortHand: "reg9",
            name: "Register 9 (Error register)",
            description: "A register that is filled with a 1 byte error code for the last operation (0 if no error occured)"
        }
    ];
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
        isNotFull: 9
    };
    for(let i = 0;i<this.registers.length;i++) {
        this.registers[i].index = i;
    }
})();
export default opcodes;
export { opcodes, REGISTER_SHORTHAND, VALUE_8, VALUE_16, VALUE_32, PARAMETER_BYTE_TABLE };