const interpreter = new (function il_interpreter(){

    function scriptExecutor(assembly) {

    };

    this.executeAssembly = assembly => {
        try {
            scriptExecutor(assembly);
            return true;
        } catch(error) {
            console.error(error);
            return false;
        }
    }
})();
export default interpreter;
