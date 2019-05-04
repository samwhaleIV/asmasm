import opcodes from "./opcodes.js";

const SIZE_8 = 1;
const SIZE_16 = 2;
const SIZE_32 = 4;

const RegisterSizes = {
    1: SIZE_8,
    2: SIZE_16,
    4: SIZE_32,
    8: SIZE_8,
    16: SIZE_16,
    32: SIZE_32
};

const INVALID_REGISTER_SIZE = "Invalid register size:";
const DEBUG_PREFIX = "Register: ";

function DebugRegister(definition) {
    this.definition = definition;
    let _size = SIZE_8;
    let _value = 0;
    this.set = function setRegisterValue(value,size) {
        if(size) {
            _size = RegisterSizes[size];
            if(!_size) {
                throw Error(INVALID_REGISTER_SIZE,size);
            }
        }
        _value = value;
        console.log(`${DEBUG_PREFIX}${this.definition.shortHand} set to ${_value}${size?` (size: ${_size})`:""}`);
    };
    this.get = function getRegisterValue() {
        return _value;
    };
    this.getSize = function getSizeSymbol() {
        return _size;
    };
    console.log(`${DEBUG_PREFIX}${this.definition.shortHand} initialized`);
}

function Register() {
    let _size = SIZE_8;
    let _value = 0;
    this.set = function setRegisterValue(value,size) {
        if(size) {
            _size = RegisterSizes[size];
            if(!_size) {
                throw Error(INVALID_REGISTER_SIZE,size);
            }
        }
        _value = value;
    };
    this.get = function getRegisterValue() {
        return _value;
    };
    this.getSize = function getSizeSymbol() {
        return _size;
    };
}
function VirtualRegisters(options) {
    const registerType = options && options.registerDebug ? DebugRegister : Register;
    const _registers = [];
    this.getRegister = index => _registers[index];
    for(let i = 0;i<opcodes.registers.length;i++) {
        const registerDefinition = opcodes.registers[i];
        const newRegister = new registerType(registerDefinition);
        _registers[registerDefinition.index] = newRegister;
        this[registerDefinition.shortHand] = newRegister;
    }
}
export default VirtualRegisters;
