const outputElement = document.getElementById("output");
const awaitingInputElement = document.getElementById("awaiting-input");
const awaitingInputText = "Awaiting input via 'sendInput'...";
const awaitingInputLogStyle = "background-color: black; color: white;padding: 4px";
awaitingInputElement.textContent = awaitingInputText;
awaitingInputElement.classList.add("hidden");

let lastOutputElement = null;
function output(text,color) {
    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createTextNode(text));
    outputElement.appendChild(paragraph);
    if(color) {
        switch(color) {
            default:
                return;
            case "red":
                break;
            case "green":
                color = "rgb(0,255,24)";
                break;
        }
        paragraph.style.backgroundColor = "black";
        paragraph.style.color = color;
        paragraph.style.textDecoration = "underline";
    }
}
const inputStack = [];
let inputPromiseResolver = null;
function sendInput(value) {
    switch(typeof value) {
        case "number":
            if(isNaN(value)) {
                console.error("Input value is NaN");
                return;
            }
            if(value >= 0 && value < 256) {
                inputStack.push(value);
            } else {
                console.error("Input value must be of range [0 to 255] (8-bits)");
            }
            break;
        default:
            console.error("Invalid input data type. Expected an 8-bit unsigned value");
            return;
    }
    if(inputPromiseResolver) {
        awaitingInputElement.classList.add("hidden");
        inputPromiseResolver(inputStack.shift());
    }
}
function getInput() {
    if(inputStack.length) {
        return inputStack.shift();
    }
    const inputPromise = new Promise(resolve => {
        awaitingInputElement.classList.remove("hidden");
        console.log(`%c${awaitingInputText}`,awaitingInputLogStyle);
        inputPromiseResolver = resolve;
    });
    return inputPromise;
}
