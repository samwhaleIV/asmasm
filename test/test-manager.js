export { runTests, registerTest }

const tests = [];
function registerTest(name,code) {
    tests.push({
        name:name,
        code:code
    });
}
async function runTest(test) {
    if(typeof test.code === "function") {
        return await test.code.call(null);
    } else {
        //Technically this is deprecated since this is a ported test manager
        return await executeScript(test.code);
    }
}
function testFailed(exception,test) {
    console.error(exception);
    const message = `${test.name} failed :(`;
    console.log(message);
    output(message,"red");
}
async function runTests(raw=false) {
    if(raw) {
        for(let i = 0;i<tests.length;i++) {
            await runTest(tests[i]);
        }
        return;
    }
    let passed = 0;
    for(let i = 0;i<tests.length;i++) {
        const test = tests[i];
        try {
            const testPassed = await runTest(test);
            if(!testPassed) {
                testFailed(new Error(`The testing function returned a false value, failure is assumed`),test);
            } else {
                const message = `${test.name} passed :)`;
                console.log(message);
                output(message,"green");
                passed++;
            }
        } catch(exception) {
            testFailed(exception,test);
        }
    };
    if(tests.length !== 1) {
        console.log(`${passed}/${tests.length} tests survived their execution (${(passed/tests.length*100).toFixed(1)}%)`);
    }
}
