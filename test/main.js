"use strict";
import {runTests, registerTest} from "./test-manager.js";
import op_gen from "../src/op-gen.js";
import create_bytecode from "../src/op-binary.js";
import interpreter from "../src/interpreter.js";
import opcodes from "../src/opcodes.js";

let operations;
registerTest(
    "Operation generation test",
    async function() {
        operations = [
            op_gen.add(),
            op_gen.subtract(),
            op_gen.multiply(),
            op_gen.divide(),
            op_gen.modulus(),
            op_gen.bitwise_and(),
            op_gen.bitwise_or(),
            op_gen.bitwise_xor(),
            op_gen.bitwise_not(),
            op_gen.bitwise_left_shift(),
            op_gen.bitwise_right_shift(),
            op_gen.compare(),
            op_gen.jump(),
            op_gen.conditional_jump(),
            op_gen.input(),
            op_gen.output(),
            op_gen.load_bytes("r1",255,1),
            op_gen.preload_bytes("r1",4),
            op_gen.copy_register("r1","r2"),
            op_gen.swap_register("r1","r2"),
            op_gen.set_address("r1","r2",4),
            op_gen.get_from_address("r1","r2",4),
            op_gen.set_register("r1",255,1),
            op_gen.free_memory("v1",2),
            op_gen.free_memory_block("r1","r2"),
            op_gen.preload_memory_block("r1"),
            op_gen.call("r1"),
            op_gen.return()
        ];
        console.log("Highest order operation format:",operations);
        return true;
    }
);
registerTest(
    "Operation compilation test",
    async function() {
        const bytecode = create_bytecode(operations);
        console.log("Lowest order operation format:",bytecode);
        return true;
    }
);
registerTest(
    "Operation execution test",
    async function() {
        const operations = [
            op_gen.set_register("r1",69,1),
            op_gen.set_register("r2",69,1),
            op_gen.add(),
            op_gen.output()
        ];
        console.log("Highest order operation format:",operations);
        return interpreter.executeAssembly(operations,{
            noMemoryManagement: true,
            registerDebug: true
        });
    }
);

registerTest(
    "Fibonacci test",
    async function() {
        const operations = [
            op_gen.set_register("jmp",op_gen.jumpLink("start"),4),
            op_gen.jump(),

            op_gen.subroutineLabel("fib"),
                op_gen.copy_register("v1","arg"),
                op_gen.copy_register("r1","v1"),
                op_gen.set_register("r2",1,4),
                op_gen.set_register("cmp",op_gen.get_comparison_value("<="),1),
                op_gen.compare(),
                op_gen.set_register("jmp",op_gen.jumpLink("fib_return"),4),
                op_gen.conditional_jump(),
                //else
                    op_gen.subtract(),
                    op_gen.copy_register("arg","r1"),
                    op_gen.set_register("r1",op_gen.subroutineLink("fib"),4),
                    op_gen.call("r1"),
                    op_gen.copy_register("v2","ret"),

                    op_gen.copy_register("r1","v1"),
                    op_gen.set_register("r2",2,4),
                    op_gen.subtract(),
                    op_gen.copy_register("arg","r1"),
                    op_gen.set_register("r1",op_gen.subroutineLink("fib"),4),
                    op_gen.call("r1"),
                    op_gen.copy_register("r2","ret"),

                    op_gen.copy_register("r1","v2"),
                    op_gen.add(),
                    op_gen.copy_register("ret","r1"),
                    op_gen.return(),
        
                //if
                op_gen.jumpLabel("fib_return"),
                    op_gen.copy_register("ret","v1"),
                    op_gen.return(),


            op_gen.jumpLabel("start"),
            op_gen.input(),

            //Casting input from 1 byte to 4
            op_gen.set_register("r2",0,4),
            op_gen.swap_register("r1","r2"),
            op_gen.add(),

            op_gen.copy_register
            ("arg","r1"),
            op_gen.set_register("r1",op_gen.subroutineLink("fib"),4),
            op_gen.call("r1"),
            op_gen.copy_register("r1","ret"),
            op_gen.output()
        ];
        sendInput(35);
        console.log("Highest order operation format:",operations);
        return interpreter.executeAssembly(operations,{
            noMemoryManagement: true,
            registerDebug: false,
            operationLog: false
        });
    }
);

runTests(false);
