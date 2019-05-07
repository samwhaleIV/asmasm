"use strict";
import opcodes from "./opcodes.js";

const DEFAULT_REGISTER_VALUE = 0;
const DEFAULT_REGISTER_SIZE = 1;

function VirtualRegisters() {
    const data = [];
    (function(){
        const end = opcodes.registers.length;
        for(let i = 0;i<end;i++) {
            data.push(
                DEFAULT_REGISTER_VALUE,
                DEFAULT_REGISTER_SIZE
            );
        }
    })();
    this.copyRegisterStates = function stateClone() {
        return data.slice();
    }
    this.applyRegisterStates = function statePaste(newData) {
        data[0] = newData[0];data[1] = newData[1];
        data[2] = newData[2];data[3] = newData[3];
        data[4] = newData[4];data[5] = newData[5];
        data[6] = newData[6];data[7] = newData[7];
        data[8] = newData[8];data[9] = newData[9];
        data[10] = newData[10];data[11] = newData[11];
        data[12] = newData[12];data[13] = newData[13];
        data[14] = newData[14];data[15] = newData[15];
    }
    this.data = data;
}
export default VirtualRegisters;
