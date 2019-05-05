export { runTests, registerTest }

const tests = [];
function registerTest(name,code,skip) {
    tests.push({
        name:name,
        code:code,
        skip:skip
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
            const test = tests[i];
            if(test.skip) {
                continue;
            }
            await runTest(tests[i]);
        }
        return;
    }
    let passed = 0;
    let totalAdjustment = 0;
    for(let i = 0;i<tests.length;i++) {
        const test = tests[i];
        if(test.skip) {
            totalAdjustment++;
            continue;
        }
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
        const total = tests.length-totalAdjustment;
        console.log(`${passed}/${total} tests survived their execution (${(passed/total*100).toFixed(1)}%)`);
    }
}
