using System;
using System.IO;

namespace asmasm_squeaky {
	class Program {
		const string COMMAND_PREFIX = "-";
		const string COMMAND_IN = COMMAND_PREFIX + "in";
		static void Main(string[] args) {
			if(args != null && args.Length > 0) {
				if(args[0] == COMMAND_IN) {
					if(args.Length == 2) {
						var filePath = args[1];
						if(File.Exists(filePath)) {
							var disassembly = Interpreter.Disassemble(filePath);
							Interpreter.ExecuteAssembly(disassembly);
						} else {
							Console.WriteLine($"File '${filePath}' does not exist");
						}
					} else {
						Console.WriteLine("Expected a file path");
					}
				} else {
					Console.WriteLine($"No other commands other than '{COMMAND_IN}' are implemented at this time");
				}
			} else {
				Console.WriteLine($"Usage '{COMMAND_IN} <file path>");
			}
			Console.ReadKey(true);
		}
	}
}
