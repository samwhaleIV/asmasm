using System;
using System.Collections.Generic;

namespace asmasm_squeaky {
	public enum ParameterType {
		size_8,size_16,size_32
	}
	public class TypedNumber {
		public static TypedNumber RegisterDefault() {
			var typedNumber = new TypedNumber();
			typedNumber.size = ParameterType.size_8;
			typedNumber.value_8 = byte.MinValue;
			return typedNumber;
		}
		public static TypedNumber TypedByte(byte value) {
			var typedNumber = new TypedNumber();
			typedNumber.size = ParameterType.size_8;
			typedNumber.value_8 = value;
			return typedNumber;
		}
		public static TypedNumber TypedShort(ushort value) {
			var typedNumber = new TypedNumber();
			typedNumber.size = ParameterType.size_16;
			typedNumber.value_16 = value;
			return typedNumber;
		}
		public static TypedNumber TypedInt(uint value) {
			var typedNumber = new TypedNumber();
			typedNumber.size = ParameterType.size_32;
			typedNumber.value_32 = value;
			return typedNumber;
		}
		public byte value_8;
		public ushort value_16;
		public uint value_32;
		public ParameterType size;
	}
	public struct Instruction {
		public Instruction(byte opcode,TypedNumber[] parameters) {
			this.opcode = opcode;
			this.parameters = parameters;
		}
		public byte opcode;
		public TypedNumber[] parameters;
	}
	public sealed class InstructionSet {
		private List<Instruction> instructions = new List<Instruction>();
		public void Add(Instruction instruction) {
			instructions.Add(instruction);
		}
		public void Clear() {
			instructions.Clear();
		}
		public Instruction[] GetInstructions() {
			return instructions.ToArray();
		}
	}
}
