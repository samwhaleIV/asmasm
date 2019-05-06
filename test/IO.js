"use strict";
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
const inputStream = [];
function sendInput(value) {
    if(typeof value === typeof 0) {
        if(value >= 0 && value < 256) {
            inputStream.push(value);
        }
    }
}
function getInput() {
    if(inputStream.length) {
        return inputStream.shift();
    } else {
        return 0;
    }
}
