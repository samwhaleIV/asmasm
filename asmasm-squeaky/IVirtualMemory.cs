namespace asmasm_squeaky {
	public interface IVirtualMemory {

		byte get_8(uint address);
		byte get_16(uint address);
		byte get_32(uint address);

		byte get(uint address,byte value);
		byte get(uint address,ushort value);
		byte get(uint address,uint value);
	
		void set(uint address,byte value);
		void set(uint address,ushort value);
		void set(uint address,uint value);
		uint allocate(byte size);
		uint allocate(ushort size);
		uint allocate(uint size);
		void free(uint address,byte size);
		void free(uint address,ushort size);
		void free(uint address,uint size);
	}
}
