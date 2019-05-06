"use strict";
const BYTES_PER_MEGABYTE = 1000000;
const DEFAULT_DANGEROUS_BLOCK_SIZE = BYTES_PER_MEGABYTE * 10;
const DEFAULT_FIXED_BLOCK_SIZE = BYTES_PER_MEGABYTE * 5;
function FixedVirtualMemory(size) {
    throw Error("Fixed memory blocks are not yet implemented, sorry!");
    const memoryBlock = new ArrayBuffer(size || DEFAULT_FIXED_BLOCK_SIZE);
    this.get = function get(address,size) {}
    this.set = function set(address,size,value) {}
    this.allocate = function(size) {}
    this.free = function free(address,size) {}
}
function invalidMemorySize(size) {
    return Error(`Invalid memory size '${size}'. Expected 8, 16, or 32`); 
}
function DangerousVirtualMemory(size) {
    const memoryBlock = new ArrayBuffer(size || DEFAULT_DANGEROUS_BLOCK_SIZE);
    const dataView = new DataView(memoryBlock);
    let memoryPointer = 0;
    this.get = function poor_mans_compensation_for_poor_variadics_in_dataView(address,size) {
        switch(size) {
            case 8:
                return dataView.getUint8(address);
            case 16:
                return dataView.getUint16(address);
            case 32:
                return dataView.getUint32(address);
            default:
                throw invalidMemorySize(size);
        }
    }
    this.set = function this_is_your_only_friend_who_is_also_slightly_evil(address,size,value) {
        switch(size) {
            case 8:
                return dataView.setUint8(address,value);
            case 16:
                return dataView.setUint16(address,value);
            case 32:
                return dataView.setUint32(address,value);
            default:
                throw invalidMemorySize(size);
        }
    }
    this.allocate = function hold_onto_with_dear_life(size) {
        const currentPointer = memoryPointer;
        memoryPointer += size / 8;
        return currentPointer;
    }
    this.free = function free(YOU_HAVE_LOST_THE_GAME_LOSERS) {
//Hahahahaha, YOU FOOLS. THIS IS A DANGEROUS MEMORY BLOCK. YOU HAVE NO POWER OVER ME. WANT TO REUSE FREED MEMORY? CHECKMATE. I OWN YOU.
//Notice: Use memory carefully with this type of virtual memory.
        return "https://www.youtube.com/watch?v=dsx2vdn7gpY";
    }
}
function SaferVirtualMemory() {
    throw Error("Safe memory blocks are not yet implemented, sorry!");
    this.get = function get(address,size) {
        //Returns value at address
    }
    this.set = function set(address,size,value) {
        //Sets the value at the address by the value specified
    }
    this.allocate = function(size) {
        //Returns new address for a block of 'size'
    }
    this.free = function free(address,size) {
        //Frees the memory at address by 'size'
    }
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
