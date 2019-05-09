using System.Collections.Generic;
using System.IO;
using Be.IO;

namespace asmasm_squeaky {
	public static class Interpreter {

		private static ParameterType[][] parameterSchemas = new ParameterType[][] {
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_16},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_32},
			new ParameterType[] {ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_8},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_16},
			new ParameterType[] {ParameterType.size_8,ParameterType.size_32},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {ParameterType.size_8},
			new ParameterType[] {},
			new ParameterType[] {},
			new ParameterType[] {},
		};

		public static InstructionSet Disassemble(string path) {
			InstructionSet instructionSet = new InstructionSet();
			using(var file = File.Open(path,FileMode.Open)) {
				using(var reader = new BeBinaryReader(file)) {
					while(reader.BaseStream.Position != reader.BaseStream.Length) {
						byte operation = reader.ReadByte();
						var parameterSchema = parameterSchemas[operation];
						var parameters = new List<TypedNumber>();
						for(var i = 0;i<parameterSchema.Length;i++) {
							var parameter = parameterSchema[i];
							switch(parameter) {
								case ParameterType.size_8:
									parameters.Add(TypedNumber.TypedByte(
										reader.ReadByte()
									));
									break;
								case ParameterType.size_16:
									parameters.Add(TypedNumber.TypedShort(
										reader.ReadUInt16()
									));
									break;
								case ParameterType.size_32:
									parameters.Add(TypedNumber.TypedInt(
										reader.ReadUInt32()
									));
									break;
							}
						}
						instructionSet.Add(new Instruction(
							opcode: operation,
							parameters: parameters.ToArray()
						));
					}
				}
			}
			return instructionSet;
		}

		public static void ExecuteAssembly(InstructionSet instructionSet) {
			var processor = new Processor();
			processor.Run(instructionSet);
		}
	}
}
