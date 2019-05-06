"use strict";
import opcodes from "./opcodes.js";

const SIZE_8 = 1;
const SIZE_16 = 2;
const SIZE_32 = 4;

const RegisterSizes = [];
RegisterSizes[1] = SIZE_8;
RegisterSizes[2] = SIZE_16;
RegisterSizes[4] = SIZE_32;
RegisterSizes[8] = SIZE_8;
RegisterSizes[16] = SIZE_16;
RegisterSizes[32] = SIZE_32;

const DEBUG_PREFIX = "Register: ";
function DebugRegister(definition) {
    this.definition = definition;
    this.size = SIZE_8;
    let _value = 0;
    Object.defineProperty(this,"value",{
        get: function() {
            return _value;
        },
        set: function(newValue) {
            _value = newValue;
            console.log(`${DEBUG_PREFIX}${this.definition.shortHand} set to ${_value}`);
        }
    });
    this.set = function setRegisterValue(newValue,newSize) {
        this.size = RegisterSizes[newSize];
        _value = newValue;
        console.log(`${DEBUG_PREFIX}${this.definition.shortHand} set to ${this.value} (size: ${this.size})`);
    };
    console.log(`${DEBUG_PREFIX}${this.definition.shortHand} initialized`);
}
function Register() {
    this.size = SIZE_8;
    this.value = 0;
    this.set = function setRegisterValue(newValue,newSize) {
        this.size = RegisterSizes[newSize];
        this.value = newValue;
    };
}
function VirtualRegisters(options) {
    const registerType = options && options.registerDebug ? DebugRegister : Register;
    this.registers = [];
    const _registers = this.registers;
    for(let i = 0;i<opcodes.registers.length;i++) {
        const registerDefinition = opcodes.registers[i];
        const newRegister = new registerType(registerDefinition);
        _registers[registerDefinition.index] = newRegister;
    }
    const r1 = _registers[0];
    const r2 = _registers[1];
    const cmp = _registers[2];
    const jmp = _registers[3];
    const v1 = _registers[4];
    const v2 = _registers[5];
    const v3 = _registers[6];
    const v4 = _registers[7];
    this.copyRegisterStates = function stateClone() {
        return [
            r1.value,r1.size,
            r2.value,r2.size,
            cmp.value,cmp.size,
            jmp.value,jmp.size,
            v1.value,v1.size,
            v2.value,v2.size,
            v3.value,v3.size,
            v4.value,v4.size
        ];
    }
    this.applyRegisterStates = function statePaste(registerStates) {
        _registers[0].set(registerStates[0],registerStates[1]);
        _registers[1].set(registerStates[2],registerStates[3]);
        _registers[2].set(registerStates[4],registerStates[5]);
        _registers[3].set(registerStates[6],registerStates[7]);
        _registers[4].set(registerStates[8],registerStates[9]);
        _registers[5].set(registerStates[10],registerStates[11]);
        _registers[6].set(registerStates[12],registerStates[13]);
        _registers[7].set(registerStates[14],registerStates[15]);
    }
}
export default VirtualRegisters;
