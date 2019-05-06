"use strict";
const BYTES_PER_MEGABYTE = 1000000;
const DEFAULT_DANGEROUS_BLOCK_SIZE = BYTES_PER_MEGABYTE * 10;
const DEFAULT_FIXED_BLOCK_SIZE = BYTES_PER_MEGABYTE * 5;
function FixedVirtualMemory(size) {
    throw Error("Fixed memory blocks are not yet implemented, sorry!");
    const memoryBlock = new ArrayBuffer(size || DEFAULT_FIXED_BLOCK_SIZE);
}
function DangerousVirtualMemory(size) {
    const memoryBlock = new ArrayBuffer(size || DEFAULT_DANGEROUS_BLOCK_SIZE);
    const dataView = new DataView(memoryBlock);
    let memoryPointer = 0;
    function get_8(address) {
        return dataView.getUint8(address);
    }
    function get_16(address) {
        return dataView.getUint16(address);
    }
    function get_32(address) {
        return dataView.getUint32(address);
    }
    const getLookup = [];
    getLookup[8] = get_8;
    getLookup[16] = get_16;
    getLookup[32] = get_32;
    this.get_8 = get_8;
    this.get_16 = get_16;
    this.get_32 = get_32;
    this.get = function poor_mans_compensation_for_poor_variadics_in_dataView(address,size) {
        return getLookup[size].call(null,address);
    }
    function set_8(address,value) {
        dataView.setUint8(address,value);
    }
    function set_16(address,value) {
        dataView.setUint16(address,value);
    }
    function set_32(address,value) {
        dataView.setUint32(address,value);
    }
    const setLookup = [];
    setLookup[8] = set_8;
    setLookup[16] = set_16;
    setLookup[32] = set_32;
    this.set_8 = set_8;
    this.set_16 = set_16;
    this.set_32 = set_32;
    this.set = function this_is_your_only_friend_who_is_also_slightly_evil(address,size,value) {
        setLookup[size].call(null,address,value);
    }
    function allocate_8() {
        memoryPointer++;
        return memoryPointer-1;
    }
    function allocate_16() {
        memoryPointer+=2;
        return memoryPointer-2;
    }
    function allocate_32() {
        memoryPointer+=4;
        return memoryPointer-4;
    }
    const allocateLookup = [];
    allocateLookup[8] = allocate_8;
    allocateLookup[16] = allocate_16;
    allocateLookup[32] = allocate_32;
    this.allocate_8 = allocate_8;
    this.allocate_16 = allocate_16;
    this.allocate_32 = allocate_32;
    this.allocate = function hold_onto_with_dear_life(size) {
        memoryPointer+=size;
        return currentPointer-size;
    }
    function free_8() {}
    function free_16() {}
    function free_32() {}
    const freeLookup = [];
    freeLookup[8] = free_8;
    freeLookup[16] = free_16;
    freeLookup[32] = free_32;
    this.free_8 = free_8;
    this.free_16 = free_16;
    this.free_32 = free_32;
    this.free = function free(address,size) {
        return "https://www.youtube.com/watch?v=dsx2vdn7gpY";
    }
}
function SaferVirtualMemory() {
    throw Error("Safe memory blocks are not yet implemented, sorry!");
}
function VirtualMemory(options) {
    if(options) {
        if(options.noMemoryManagement) {
            DangerousVirtualMemory.apply(this,[options.fixedMemorySize]);
        } else {
            if(options.fixedMemorySize !== undefined) {
                FixedVirtualMemory.apply(this,[options.fixedMemorySize]);
            } else {
                SaferVirtualMemory.apply(this);
            }
        }
    } else {
        SaferVirtualMemory.apply(this);
    }
}
export default VirtualMemory;
