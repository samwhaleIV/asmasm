using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;

namespace asmasm_squeaky {
	internal sealed partial class Processor {
		const string EXPECTED_32_BIT_REGISTER = "Expected 32 bit register";
		const string EXPECTED_16_BIT_REGISTER = "Expected 16 bit register";
		const string EXPECTED_8_BIT_REGISTER = "Expected 8 bit register";

		const string REGISTER_SIZE_MISMATCH = "Register size mismatch";
		const string INCOMPATIBLE_CROSS_REGISTER_SIZE = "Incompatible cross register size";

		const byte BYTE_1 = 1;
		const byte BYTE_2 = 2;
		const byte BYTE_4 = 4;

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void validate_address(ParameterType size) {
			if(size != ParameterType.size_32) {
				throw new Exception(EXPECTED_32_BIT_REGISTER);
			}
		}

		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void validate_registers_1_2() {
			if(r1_size < r2_size) {
				throw new Exception(INCOMPATIBLE_CROSS_REGISTER_SIZE);
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void validate_registers_1_2_size_matched() {
			if(r1_size != r2_size) {
				throw new Exception(REGISTER_SIZE_MISMATCH);
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void ADD() {
			validate_registers_1_2();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 += r2_8;
					}
					break;
				case ParameterType.size_16:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_16 += r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_16 += r2_16;
							}
							break;
					}
					break;
				case ParameterType.size_32:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_32 += r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_32 += r2_16;
							}
							break;
						case ParameterType.size_32:
							unchecked {
								r1_32 += r2_32;
							}
							break;
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void SUB() {
			validate_registers_1_2();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 -= r2_8;
					}
					break;
				case ParameterType.size_16:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_16 -= r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_16 -= r2_16;
							}
							break;
					}
					break;
				case ParameterType.size_32:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_32 -= r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_32 -= r2_16;
							}
							break;
						case ParameterType.size_32:
							unchecked {
								r1_32 -= r2_32;
							}
							break;
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void MTP() {
			validate_registers_1_2();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 *= r2_8;
					}
					break;
				case ParameterType.size_16:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_16 *= r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_16 *= r2_16;
							}
							break;
					}
					break;
				case ParameterType.size_32:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_32 *= r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_32 *= r2_16;
							}
							break;
						case ParameterType.size_32:
							unchecked {
								r1_32 *= r2_32;
							}
							break;
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void DIV() {
			validate_registers_1_2();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 /= r2_8;
					}
					break;
				case ParameterType.size_16:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_16 /= r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_16 /= r2_16;
							}
							break;
					}
					break;
				case ParameterType.size_32:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_32 /= r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_32 /= r2_16;
							}
							break;
						case ParameterType.size_32:
							unchecked {
								r1_32 /= r2_32;
							}
							break;
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void MOD() {
			validate_registers_1_2();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 %= r2_8;
					}
					break;
				case ParameterType.size_16:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_16 %= r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_16 %= r2_16;
							}
							break;
					}
					break;
				case ParameterType.size_32:
					switch(r2_size) {
						case ParameterType.size_8:
							unchecked {
								r1_32 %= r2_8;
							}
							break;
						case ParameterType.size_16:
							unchecked {
								r1_32 %= r2_16;
							}
							break;
						case ParameterType.size_32:
							unchecked {
								r1_32 %= r2_32;
							}
							break;
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void AND() {
			validate_registers_1_2_size_matched();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 = (byte)(r1_8 & r2_8);
					}
					break;
				case ParameterType.size_16:
					unchecked {
						r1_16 = (ushort)(r1_16 & r2_16);
					}
					break;
				case ParameterType.size_32:
					unchecked {
						r1_32 = (uint)(r1_32 & r2_32);
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void OR() {
			validate_registers_1_2_size_matched();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 = (byte)(r1_8 | r2_8);
					}
					break;
				case ParameterType.size_16:
					unchecked {
						r1_16 = (ushort)(r1_16 | r2_16);
					}
					break;
				case ParameterType.size_32:
					unchecked {
						r1_32 = (uint)(r1_32 | r2_32);
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void XOR() {
			validate_registers_1_2_size_matched();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 = (byte)(r1_8 ^ r2_8);
					}
					break;
				case ParameterType.size_16:
					unchecked {
						r1_16 = (ushort)(r1_16 ^ r2_16);
					}
					break;
				case ParameterType.size_32:
					unchecked {
						r1_32 = (uint)(r1_32 ^ r2_32);
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void NOT() {
			validate_registers_1_2_size_matched();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 = (byte)~r1_8;
					}
					break;
				case ParameterType.size_16:
					unchecked {
						r1_16 = (ushort)~r1_8;
					}
					break;
				case ParameterType.size_32:
					unchecked {
						r1_32 = (uint)~r1_8;
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void L_SHIFT() {
			validate_registers_1_2_size_matched();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 = (byte)(r1_8 << r2_8);
					}
					break;
				case ParameterType.size_16:
					unchecked {
						r1_16 = (ushort)(r1_16 << r2_16);
					}
					break;
				case ParameterType.size_32:
					unchecked {
						r1_32 = (uint)((int)r1_32 << (int)r2_32);
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void R_SHIFT() {
			validate_registers_1_2_size_matched();
			switch(r1_size) {
				case ParameterType.size_8:
					unchecked {
						r1_8 = (byte)(r1_8 >> r2_8);
					}
					break;
				case ParameterType.size_16:
					unchecked {
						r1_16 = (ushort)(r1_16 >> r2_16);
					}
					break;
				case ParameterType.size_32:
					unchecked {
						r1_32 = (uint)((int)r1_32 >> (int)r2_32);
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void LOAD_8(byte p1,byte p2) {
			var address = virtualMemory.allocate(BYTE_1);
			registers[p1].Set(address);
			registers[p1].SetSize(ParameterType.size_32);
			virtualMemory.set(address,p2);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void LOAD_16(byte p1,ushort p2) {
			var address = virtualMemory.allocate(BYTE_2);
			registers[p1].Set(address);
			registers[p1].SetSize(ParameterType.size_32);
			virtualMemory.set(address,p2);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void LOAD_32(byte p1,uint p2) {
			var address = virtualMemory.allocate(BYTE_4);
			registers[p1].Set(address);
			registers[p1].SetSize(ParameterType.size_32);
			virtualMemory.set(address,p2);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void PRELOAD_8(byte p1) {
			var address = virtualMemory.allocate(BYTE_1);
			registers[p1].Set(address);
			registers[p1].SetSize(ParameterType.size_32);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void PRELOAD_16(byte p1) {
			var address = virtualMemory.allocate(BYTE_2);
			registers[p1].Set(address);
			registers[p1].SetSize(ParameterType.size_32);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void PRELOAD_32(byte p1) {
			var address = virtualMemory.allocate(BYTE_4);
			registers[p1].Set(address);
			registers[p1].SetSize(ParameterType.size_32);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void PRELOAD_BLOCK(byte p1) {
			uint address;
			switch(r1_size) {
				default:
				case ParameterType.size_8:
					address = virtualMemory.allocate(r1_8);
					break;
				case ParameterType.size_16:
					address = virtualMemory.allocate(r1_16);
					break;
				case ParameterType.size_32:
					address = virtualMemory.allocate(r1_32);
					break;
			}
			r2_32 = address;
			r2_size = ParameterType.size_32;
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void FREE_ADR_8(byte p1) {
			validate_address(registers[p1].GetSize());
			virtualMemory.free(registers[p1].Get_32(),BYTE_1);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void FREE_ADR_16(byte p1) {
			validate_address(registers[p1].GetSize());
			virtualMemory.free(registers[p1].Get_32(),BYTE_2);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void FREE_ADR_32(byte p1) {
			validate_address(registers[p1].GetSize());
			virtualMemory.free(registers[p1].Get_32(),BYTE_4);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void FREE_BLOCK(byte p1,byte p2) {
			validate_address(registers[p1].GetSize());
			switch(registers[p1].GetSize()) {
				default:
				case ParameterType.size_8:
					virtualMemory.free(registers[p1].Get_32(),registers[p2].Get_8());
					break;
				case ParameterType.size_16:
					virtualMemory.free(registers[p1].Get_32(),registers[p2].Get_16());
					break;
				case ParameterType.size_32:
					virtualMemory.free(registers[p1].Get_32(),registers[p2].Get_32());
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void COPY_REG(byte p1,byte p2) {
			var r1 = registers[p1];
			var r2 = registers[p2];
			switch(r1.GetSize()) {
				case ParameterType.size_8:
					r2.SetSize(ParameterType.size_8);
					r2.Set(r1.Get_8());
					break;
				case ParameterType.size_16:
					r2.SetSize(ParameterType.size_16);
					r2.Set(r1.Get_16());
					break;
				case ParameterType.size_32:
					r2.SetSize(ParameterType.size_32);
					r2.Set(r1.Get_32());
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void SWAP_REG(byte p1,byte p2) {
			var r1 = registers[p1];
			var r2 = registers[p2];
			switch(r1.GetSize()) {
				case ParameterType.size_8:
					switch(r2.GetSize()) {
						case ParameterType.size_8:
							byte tmp = r1.Get_8();
							r1.Set(r2.Get_8());
							r2.Set(tmp);
							break;
						case ParameterType.size_16:
							r1.SetSize(ParameterType.size_16);
							r2.SetSize(ParameterType.size_8);
							r1.Set(r2.Get_16());
							r2.Set(r1.Get_8());
							break;
						case ParameterType.size_32:
							r1.SetSize(ParameterType.size_32);
							r2.SetSize(ParameterType.size_8);
							r1.Set(r2.Get_32());
							r2.Set(r1.Get_8());
							break;
					}
					break;
				case ParameterType.size_16:
					switch(r2.GetSize()) {
						case ParameterType.size_8:
							r1.SetSize(ParameterType.size_8);
							r2.SetSize(ParameterType.size_16);
							r1.Set(r2.Get_8());
							r2.Set(r1.Get_16());
							break;
						case ParameterType.size_16:
							ushort tmp = r1.Get_16();
							r1.Set(r2.Get_16());
							r2.Set(tmp);
							break;
						case ParameterType.size_32:
							r1.SetSize(ParameterType.size_32);
							r2.SetSize(ParameterType.size_16);
							r1.Set(r2.Get_32());
							r2.Set(r1.Get_16());
							break;
					}
					break;
				case ParameterType.size_32:
					switch(r2.GetSize()) {
						case ParameterType.size_8:
							r1.SetSize(ParameterType.size_8);
							r2.SetSize(ParameterType.size_32);
							r1.Set(r2.Get_8());
							r2.Set(r1.Get_32());
							break;
						case ParameterType.size_16:
							r1.SetSize(ParameterType.size_16);
							r2.SetSize(ParameterType.size_32);
							r1.Set(r2.Get_16());
							r2.Set(r1.Get_32());
							break;
						case ParameterType.size_32:
							uint tmp = r1.Get_32();
							r1.Set(r2.Get_32());
							r2.Set(tmp);
							break;
					}
					break;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void SET_ADR_8(byte p1,byte p2) {
			validate_address(registers[p1].GetSize());
			if(registers[p2].GetSize() != ParameterType.size_8) {
				throw new Exception(EXPECTED_8_BIT_REGISTER);
			}
			virtualMemory.set(registers[p1].Get_32(),registers[p2].Get_8());
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void SET_ADR_16(byte p1,byte p2) {
			validate_address(registers[p1].GetSize());
			if(registers[p2].GetSize() != ParameterType.size_16) {
				throw new Exception(EXPECTED_16_BIT_REGISTER);
			}
			virtualMemory.set(registers[p1].Get_32(),registers[p2].Get_16());
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void SET_ADR_32(byte p1,byte p2) {
			validate_address(registers[p1].GetSize());
			if(registers[p2].GetSize() != ParameterType.size_32) {
				throw new Exception(EXPECTED_32_BIT_REGISTER);
			}
			virtualMemory.set(registers[p1].Get_32(),registers[p2].Get_32());
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void GET_ADR_8(byte p1,byte p2) {
			validate_address(registers[p1].GetSize());
			registers[p2].Set(virtualMemory.get_8(registers[p1].Get_32()));
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void GET_ADR_16(byte p1,byte p2) {
			validate_address(registers[p1].GetSize());
			registers[p2].Set(virtualMemory.get_16(registers[p1].Get_32()));
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void GET_ADR_32(byte p1,byte p2) {
			validate_address(registers[p1].GetSize());
			registers[p2].Set(virtualMemory.get_32(registers[p1].Get_32()));
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void SET_REG_8(byte p1,byte p2) {
			registers[p1].Set(p2);
			registers[p1].SetSize(ParameterType.size_8);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void SET_REG_16(byte p1,ushort p2) {
			registers[p1].Set(p2);
			registers[p1].SetSize(ParameterType.size_16);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void SET_REG_32(byte p1,uint p2) {
			registers[p1].Set(p2);
			registers[p1].SetSize(ParameterType.size_32);
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void CMP() {
			if(cmp_size != ParameterType.size_8) {
				throw new Exception(EXPECTED_8_BIT_REGISTER);
			}
			bool r = false;
			switch(cmp_8) {
				case 0:
					switch(r1_size) {
						case ParameterType.size_8:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_8 == r2_8;
									break;
								case ParameterType.size_16:
									r = r1_8 == r2_16;
									break;
								case ParameterType.size_32:
									r = r1_8 == r2_32;
									break;
							}
							break;
						case ParameterType.size_16:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_16 == r2_8;
									break;
								case ParameterType.size_16:
									r = r1_16 == r2_16;
									break;
								case ParameterType.size_32:
									r = r1_16 == r2_32;
									break;
							}
							break;
						case ParameterType.size_32:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_32 == r2_8;
									break;
								case ParameterType.size_16:
									r = r1_32 == r2_16;
									break;
								case ParameterType.size_32:
									r = r1_32 == r2_32;
									break;
							}
							break;
					}
					break;
				case 1:
					switch(r1_size) {
						case ParameterType.size_8:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_8 != r2_8;
									break;
								case ParameterType.size_16:
									r = r1_8 != r2_16;
									break;
								case ParameterType.size_32:
									r = r1_8 != r2_32;
									break;
							}
							break;
						case ParameterType.size_16:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_16 != r2_8;
									break;
								case ParameterType.size_16:
									r = r1_16 != r2_16;
									break;
								case ParameterType.size_32:
									r = r1_16 != r2_32;
									break;
							}
							break;
						case ParameterType.size_32:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_32 != r2_8;
									break;
								case ParameterType.size_16:
									r = r1_32 != r2_16;
									break;
								case ParameterType.size_32:
									r = r1_32 != r2_32;
									break;
							}
							break;
					}
					break;
				case 2:
					switch(r1_size) {
						case ParameterType.size_8:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_8 < r2_8;
									break;
								case ParameterType.size_16:
									r = r1_8 < r2_16;
									break;
								case ParameterType.size_32:
									r = r1_8 < r2_32;
									break;
							}
							break;
						case ParameterType.size_16:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_16 < r2_8;
									break;
								case ParameterType.size_16:
									r = r1_16 < r2_16;
									break;
								case ParameterType.size_32:
									r = r1_16 < r2_32;
									break;
							}
							break;
						case ParameterType.size_32:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_32 < r2_8;
									break;
								case ParameterType.size_16:
									r = r1_32 < r2_16;
									break;
								case ParameterType.size_32:
									r = r1_32 < r2_32;
									break;
							}
							break;
					}
					break;
				case 3:
					switch(r1_size) {
						case ParameterType.size_8:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_8 > r2_8;
									break;
								case ParameterType.size_16:
									r = r1_8 > r2_16;
									break;
								case ParameterType.size_32:
									r = r1_8 > r2_32;
									break;
							}
							break;
						case ParameterType.size_16:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_16 > r2_8;
									break;
								case ParameterType.size_16:
									r = r1_16 > r2_16;
									break;
								case ParameterType.size_32:
									r = r1_16 > r2_32;
									break;
							}
							break;
						case ParameterType.size_32:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_32 > r2_8;
									break;
								case ParameterType.size_16:
									r = r1_32 > r2_16;
									break;
								case ParameterType.size_32:
									r = r1_32 > r2_32;
									break;
							}
							break;
					}
					break;
				case 4:
					switch(r1_size) {
						case ParameterType.size_8:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_8 >= r2_8;
									break;
								case ParameterType.size_16:
									r = r1_8 >= r2_16;
									break;
								case ParameterType.size_32:
									r = r1_8 >= r2_32;
									break;
							}
							break;
						case ParameterType.size_16:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_16 >= r2_8;
									break;
								case ParameterType.size_16:
									r = r1_16 >= r2_16;
									break;
								case ParameterType.size_32:
									r = r1_16 >= r2_32;
									break;
							}
							break;
						case ParameterType.size_32:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_32 >= r2_8;
									break;
								case ParameterType.size_16:
									r = r1_32 >= r2_16;
									break;
								case ParameterType.size_32:
									r = r1_32 >= r2_32;
									break;
							}
							break;
					}
					break;
				case 5:
					switch(r1_size) {
						case ParameterType.size_8:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_8 <= r2_8;
									break;
								case ParameterType.size_16:
									r = r1_8 <= r2_16;
									break;
								case ParameterType.size_32:
									r = r1_8 <= r2_32;
									break;
							}
							break;
						case ParameterType.size_16:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_16 <= r2_8;
									break;
								case ParameterType.size_16:
									r = r1_16 <= r2_16;
									break;
								case ParameterType.size_32:
									r = r1_16 <= r2_32;
									break;
							}
							break;
						case ParameterType.size_32:
							switch(r2_size) {
								case ParameterType.size_8:
									r = r1_32 <= r2_8;
									break;
								case ParameterType.size_16:
									r = r1_32 <= r2_16;
									break;
								case ParameterType.size_32:
									r = r1_32 <= r2_32;
									break;
							}
							break;
					}
					break;
				case 6:
					switch(r1_size) {
						case ParameterType.size_8:
							r = r1_8 == byte.MinValue;
							break;
						case ParameterType.size_16:
							r = r1_16 == ushort.MinValue;
							break;
						case ParameterType.size_32:
							r = r1_32 == uint.MinValue;
							break;
					}
					break;
				case 7:
					switch(r1_size) {
						case ParameterType.size_8:
							r = r1_8 != byte.MinValue;
							break;
						case ParameterType.size_16:
							r = r1_16 != ushort.MinValue;
							break;
						case ParameterType.size_32:
							r = r1_32 != uint.MinValue;
							break;
					}
					break;
				case 8:
					switch(r1_size) {
						case ParameterType.size_8:
							r = r1_8 == byte.MaxValue;
							break;
						case ParameterType.size_16:
							r = r1_16 == ushort.MaxValue;
							break;
						case ParameterType.size_32:
							r = r1_32 == uint.MaxValue;
							break;
					}
					break;
				case 9:
					switch(r1_size) {
						case ParameterType.size_8:
							r = r1_8 != byte.MaxValue;
							break;
						case ParameterType.size_16:
							r = r1_16 != ushort.MaxValue;
							break;
						case ParameterType.size_32:
							r = r1_32 != uint.MaxValue;
							break;
					}
					break;
			}
			if(r) {
				cmp_8 = 1;
			} else {
				cmp_8 = 0;
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		uint JMP() {
			validate_address(jmp_size);
			return jmp_32;
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		uint? CON_JMP() {
			validate_address(jmp_size);
			switch(cmp_size) {
				default:
				case ParameterType.size_8:
					if(cmp_8 >= 1) {
						return jmp_32;
					} else {
						return null;
					}
				case ParameterType.size_16:
					if(cmp_16 >= 1) {
						return jmp_32;
					} else {
						return null;
					}
				case ParameterType.size_32:
					if(cmp_32 >= 1) {
						return jmp_32;
					} else {
						return null;
					}
			}
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		uint CALL(byte p1) {
			validate_address(registers[p1].GetSize());
			return registers[p1].Get_32();
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void IN() {
			r1_8 = 32;
			r1_size = ParameterType.size_8;
			return;
			Console.Write("Awaiting input: ");
			var key = (byte)Console.ReadKey().KeyChar;
			Console.WriteLine();
			r1_8 = key;
			r1_size = ParameterType.size_8;
		}
		[MethodImpl(MethodImplOptions.AggressiveInlining)]
		void OUT() {
			switch(r1_size) {
				case ParameterType.size_8:
					Console.WriteLine(r1_8);
					break;
				case ParameterType.size_16:
					Console.WriteLine(r1_16);
					break;
				case ParameterType.size_32:
					Console.WriteLine(r1_32);
					break;
			}
		}
	}
}
