"use strict";
const BIT_8 = 8;
export { left_shift, right_shift, not, and, or, xor }
//Adapted from https://www.w3schools.com/js/js_bitwise.asp
function dec2bin(dec,size){
    return dec.toString(2).padStart(size,"0");
}
function bin2dec(bin){
    return parseInt(bin,2).toString(10);
}
function right_shift(a,b,size) {
    const bitCount = size * BIT_8;
    let aBits = dec2bin(a,b,bitCount);
    aBits = aBits.substring(0,bitCount-b).padStart(bitCount,aBits[0]);
    return bin2dec(aBits);
}
function left_shift(a,b,size) {
    const bitCount = size * BIT_8;
    let aBits = dec2bin(a,b,bitCount);
    aBits = aBits.substring(b).padEnd(bitCount,"0");
    return bin2dec(aBits);
}
function not(a,size) {
    const bitCount = size * BIT_8;
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
    const bitCount = size * BIT_8;
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
    const bitCount = size * BIT_8;
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
    const bitCount = size * BIT_8;
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
