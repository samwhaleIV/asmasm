using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

namespace asmasm_squeaky {
	internal sealed partial class Processor {

		byte r1_8;
		ushort r1_16;
		uint r1_32;
		ParameterType r1_size;

		byte r2_8;
		ushort r2_16;
		uint r2_32;
		ParameterType r2_size;

		byte cmp_8;
		ushort cmp_16;
		uint cmp_32;
		ParameterType cmp_size;

		byte jmp_8;
		ushort jmp_16;
		uint jmp_32;
		ParameterType jmp_size;

		byte v1_8;
		ushort v1_16;
		uint v1_32;
		ParameterType v1_size;

		byte v2_8;
		ushort v2_16;
		uint v2_32;
		ParameterType v2_size;

		byte v3_8;
		ushort v3_16;
		uint v3_32;
		ParameterType v3_size;

		byte v4_8;
		ushort v4_16;
		uint v4_32;
		ParameterType v4_size;

		byte arg_8;
		ushort arg_16;
		uint arg_32;
		ParameterType arg_size;

		byte ret_8;
		ushort ret_16;
		uint ret_32;
		ParameterType ret_size;

		private interface IRegister {
			void Set(byte value);
			void Set(ushort value);
			void Set(uint value);

			byte Get_8();
			ushort Get_16();
			uint Get_32();

			void SetSize(ParameterType size);
			ParameterType GetSize();
		}
		private class Register1:IRegister {
			private Processor processor;
			internal Register1(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.r1_size;
			}
			public ushort Get_16() {
				return processor.r1_16;
			}
			public uint Get_32() {
				return processor.r1_32;
			}
			public byte Get_8() {
				return processor.r1_8;
			}
			public void Set(byte value) {
				processor.r1_8 = value;
			}
			public void Set(ushort value) {
				processor.r1_16 = value;
			}
			public void Set(uint value) {
				processor.r1_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.r1_size = size;
			}
		}
		private class Register2:IRegister {
			private Processor processor;
			internal Register2(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.r2_size;
			}
			public ushort Get_16() {
				return processor.r2_16;
			}
			public uint Get_32() {
				return processor.r2_32;
			}
			public byte Get_8() {
				return processor.r2_8;
			}
			public void Set(byte value) {
				processor.r2_8 = value;
			}
			public void Set(ushort value) {
				processor.r2_16 = value;
			}
			public void Set(uint value) {
				processor.r2_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.r2_size = size;
			}
		}
		private class Register3:IRegister {
			private Processor processor;
			internal Register3(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.cmp_size;
			}
			public ushort Get_16() {
				return processor.cmp_16;
			}
			public uint Get_32() {
				return processor.cmp_32;
			}
			public byte Get_8() {
				return processor.cmp_8;
			}
			public void Set(byte value) {
				processor.cmp_8 = value;
			}
			public void Set(ushort value) {
				processor.cmp_16 = value;
			}
			public void Set(uint value) {
				processor.cmp_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.cmp_size = size;
			}
		}
		private class Register4:IRegister {
			private Processor processor;
			internal Register4(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.jmp_size;
			}
			public ushort Get_16() {
				return processor.jmp_16;
			}
			public uint Get_32() {
				return processor.jmp_32;
			}
			public byte Get_8() {
				return processor.jmp_8;
			}
			public void Set(byte value) {
				processor.jmp_8 = value;
			}
			public void Set(ushort value) {
				processor.jmp_16 = value;
			}
			public void Set(uint value) {
				processor.jmp_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.jmp_size = size;
			}
		}
		private class Register5:IRegister {
			private Processor processor;
			internal Register5(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.v1_size;
			}
			public ushort Get_16() {
				return processor.v1_16;
			}
			public uint Get_32() {
				return processor.v1_32;
			}
			public byte Get_8() {
				return processor.v1_8;
			}
			public void Set(byte value) {
				processor.v1_8 = value;
			}
			public void Set(ushort value) {
				processor.v1_16 = value;
			}
			public void Set(uint value) {
				processor.v1_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.v1_size = size;
			}
		}
		private class Register6:IRegister {
			private Processor processor;
			internal Register6(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.v2_size;
			}
			public ushort Get_16() {
				return processor.v2_16;
			}
			public uint Get_32() {
				return processor.v2_32;
			}
			public byte Get_8() {
				return processor.v2_8;
			}
			public void Set(byte value) {
				processor.v2_8 = value;
			}
			public void Set(ushort value) {
				processor.v2_16 = value;
			}
			public void Set(uint value) {
				processor.v2_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.v2_size = size;
			}
		}
		private class Register7:IRegister {
			private Processor processor;
			internal Register7(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.v3_size;
			}
			public ushort Get_16() {
				return processor.v3_16;
			}
			public uint Get_32() {
				return processor.v3_32;
			}
			public byte Get_8() {
				return processor.v3_8;
			}
			public void Set(byte value) {
				processor.v3_8 = value;
			}
			public void Set(ushort value) {
				processor.v3_16 = value;
			}
			public void Set(uint value) {
				processor.v3_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.v3_size = size;
			}
		}
		private class Register8:IRegister {
			private Processor processor;
			internal Register8(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.v4_size;
			}
			public ushort Get_16() {
				return processor.v4_16;
			}
			public uint Get_32() {
				return processor.v4_32;
			}
			public byte Get_8() {
				return processor.v4_8;
			}
			public void Set(byte value) {
				processor.v4_8 = value;
			}
			public void Set(ushort value) {
				processor.v4_16 = value;
			}
			public void Set(uint value) {
				processor.v4_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.v4_size = size;
			}
		}
		private class Register9:IRegister {
			private Processor processor;
			internal Register9(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.arg_size;
			}
			public ushort Get_16() {
				return processor.arg_16;
			}
			public uint Get_32() {
				return processor.arg_32;
			}
			public byte Get_8() {
				return processor.arg_8;
			}
			public void Set(byte value) {
				processor.arg_8 = value;
			}
			public void Set(ushort value) {
				processor.arg_16 = value;
			}
			public void Set(uint value) {
				processor.arg_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.arg_size = size;
			}
		}
		private class Register10:IRegister {
			private Processor processor;
			internal Register10(Processor processor) {
				this.processor = processor;
			}
			public ParameterType GetSize() {
				return processor.ret_size;
			}
			public ushort Get_16() {
				return processor.ret_16;
			}
			public uint Get_32() {
				return processor.ret_32;
			}
			public byte Get_8() {
				return processor.ret_8;
			}
			public void Set(byte value) {
				processor.ret_8 = value;
			}
			public void Set(ushort value) {
				processor.ret_16 = value;
			}
			public void Set(uint value) {
				processor.ret_32 = value;
			}
			public void SetSize(ParameterType size) {
				processor.ret_size = size;
			}
		}

		private IRegister[] registers;

		private struct TypedNumberShadow {
			public byte v_8;
			public ushort v_16;
			public uint v_32;
			public ParameterType size;
			internal TypedNumberShadow(byte v_8,ushort v_16,uint v_32,ParameterType size) {
				this.v_8 = v_8;
				this.v_16 = v_16;
				this.v_32 = v_32;
				this.size = size;
			}
		}

		private TypedNumberShadow[] getRegisterValues() {
			TypedNumberShadow[] registerValues = new TypedNumberShadow[] {
				new TypedNumberShadow(r1_8,r1_16,r1_32,r1_size),
				new TypedNumberShadow(r2_8,r2_16,r2_32,r2_size),
				new TypedNumberShadow(cmp_8,cmp_16,cmp_32,cmp_size),
				new TypedNumberShadow(jmp_8,jmp_16,jmp_32,jmp_size),
				new TypedNumberShadow(v1_8,v1_16,v1_32,v1_size),
				new TypedNumberShadow(v2_8,v2_16,v2_32,v2_size),
				new TypedNumberShadow(v3_8,v3_16,v3_32,v3_size),
				new TypedNumberShadow(v4_8,v4_16,v4_32,v4_size)
			};
			return registerValues;
		}

		private void setRegisterValues(TypedNumberShadow[] registerValues) {
			r1_8 = registerValues[0].v_8;
			r1_16 = registerValues[0].v_16;
			r1_32 = registerValues[0].v_32;
			r1_size = registerValues[0].size;

			r2_8 = registerValues[1].v_8;
			r2_16 = registerValues[1].v_16;
			r2_32 = registerValues[1].v_32;
			r2_size = registerValues[1].size;

			cmp_8 = registerValues[2].v_8;
			cmp_16 = registerValues[2].v_16;
			cmp_32 = registerValues[2].v_32;
			cmp_size = registerValues[2].size;

			jmp_8 = registerValues[3].v_8;
			jmp_16 = registerValues[3].v_16;
			jmp_32 = registerValues[3].v_32;
			jmp_size = registerValues[3].size;

			v1_8 = registerValues[4].v_8;
			v1_16 = registerValues[4].v_16;
			v1_32 = registerValues[4].v_32;
			v1_size = registerValues[4].size;

			v2_8 = registerValues[5].v_8;
			v2_16 = registerValues[5].v_16;
			v2_32 = registerValues[5].v_32;
			v2_size = registerValues[5].size;

			v3_8 = registerValues[6].v_8;
			v3_16 = registerValues[6].v_16;
			v3_32 = registerValues[6].v_32;
			v3_size = registerValues[6].size;

			v4_8 = registerValues[7].v_8;
			v4_16 = registerValues[7].v_16;
			v4_32 = registerValues[7].v_32;
			v4_size = registerValues[7].size;
		}

		private IVirtualMemory virtualMemory;

		private  struct StackFrame {
			internal StackFrame(uint address,TypedNumberShadow[] registerValues) {
				this.address = address;
				this.registerValues = registerValues;
			}
			internal uint address;
			internal TypedNumberShadow[] registerValues;
		}

		private Stack<StackFrame> stack = new Stack<StackFrame>();

		internal void Run(InstructionSet instructionSet) {
			registers = new IRegister[] {
				new Register1(this),
				new Register2(this),
				new Register3(this),
				new Register4(this),
				new Register5(this),
				new Register6(this),
				new Register7(this),
				new Register8(this),
				new Register9(this),
				new Register10(this)
			};
			var instructions = instructionSet.GetInstructions();
			int instructionCount = instructions.Length;
			uint index = 0;
			long operationCount = 0;
			Stopwatch stopwatch = new Stopwatch();
			stopwatch.Start();
			while(index < instructionCount) {
				operationCount++;
				var instruction = instructions[index];
				index++;
				switch(instruction.opcode) {
					case 0:
						ADD();
						break;
					case 1:
						SUB();
						break;
					case 2:
						MTP();
						break;
					case 3:
						DIV();
						break;
					case 4:
						MOD();
						break;
					case 5:
						AND();
						break;
					case 6:
						OR();
						break;
					case 7:
						XOR();
						break;
					case 8:
						NOT();
						break;
					case 9:
						L_SHIFT();
						break;
					case 10:
						R_SHIFT();
						break;
					case 11:
						R_SHIFT_S();
						break;
					case 12:
						LOAD_8(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 13:
						LOAD_16(instruction.parameters[0].value_8,instruction.parameters[1].value_16);
						break;
					case 14:
						LOAD_32(instruction.parameters[0].value_8,instruction.parameters[1].value_32);
						break;
					case 15:
						PRELOAD_8(instruction.parameters[0].value_8);
						break;
					case 16:
						PRELOAD_16(instruction.parameters[0].value_8);
						break;
					case 17:
						PRELOAD_32(instruction.parameters[0].value_8);
						break;
					case 18:
						PRELOAD_BLOCK(instruction.parameters[0].value_8);
						break;
					case 19:
						FREE_ADR_8(instruction.parameters[0].value_8);
						break;
					case 20:
						FREE_ADR_16(instruction.parameters[0].value_8);
						break;
					case 21:
						FREE_ADR_32(instruction.parameters[0].value_8);
						break;
					case 22:
						FREE_BLOCK(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 23:
						COPY_REG(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 24:
						SWAP_REG(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 25:
						SET_ADR_8(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 26:
						SET_ADR_16(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 27:
						SET_ADR_32(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 28:
						GET_ADR_8(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 29:
						GET_ADR_16(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 30:
						GET_ADR_32(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 31:
						SET_REG_8(instruction.parameters[0].value_8,instruction.parameters[1].value_8);
						break;
					case 32:
						SET_REG_16(instruction.parameters[0].value_8,instruction.parameters[1].value_16);
						break;
					case 33:
						SET_REG_32(instruction.parameters[0].value_8,instruction.parameters[1].value_32);
						break;
					case 34:
						CMP();
						break;
					case 35:
						index = JMP();
						break;
					case 36:
						var conditionalJumpResult = CON_JMP();
						if(conditionalJumpResult.HasValue) {
							index = conditionalJumpResult.Value;
						}
						break;
					case 38:
						stack.Push(new StackFrame(index,getRegisterValues()));
						index = CALL(instruction.parameters[0].value_8);
						break;
					case 39:
						var stackFrame = stack.Pop();
						index = stackFrame.address;
						setRegisterValues(stackFrame.registerValues);
						break;
					case 40:
						IN();
						break;
					case 41:
						OUT();
						break;
					default:
						break;
				}
			}
			stopwatch.Stop();

			var completionTime = (double)stopwatch.ElapsedMilliseconds / 1000;
			Console.WriteLine($"Program finished with {operationCount} operations fired");
			Console.WriteLine($"Completion time (seconds): {completionTime}");
			Console.WriteLine($"Operations per second: {operationCount / completionTime}");
		}
	}
}
