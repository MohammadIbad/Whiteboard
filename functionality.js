const board = document.querySelector(".board");
board.height = window.innerHeight;
board.width = window.innerWidth;

const ctx = board.getContext("2d");

ctx.strokeStyle = "blue";
ctx.imageSmoothingEnabled = true;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.miterLimit = 1;
ctx.imageSmoothingQuality = "high";
ctx.lineWidth = 3;

// Hamburger

let isActive = true;
const hamburger = document.querySelector(".hamburger");
const toolPanel = document.querySelector(".tool-panel");
hamburger.addEventListener("click" , function() {
    handleHamburger();
});

function handleHamburger(){
    if(isActive == true){
        hamburger.classList.remove("is-active");
        toolPanel.classList.remove("add-animation");
    }
    else{
        hamburger.classList.add("is-active");
        toolPanel.classList.add("add-animation");
    }
    isActive = !isActive;
}

// Options

let Activetool = "pencil";
const pencilOptions = document.querySelector(".tool-options.pencil");
const eraserOptions = document.querySelector(".tool-options.eraser");
const tools = document.querySelectorAll(".tool");
const inputs = document.querySelectorAll("input[type=range]");
const ImageInput = document.querySelector(".upload-img");


function handleLocaltoolChange(tool){
    handleToolChange(tool);
}

function handleToolChange(tool)
{
    if(tool == "pencil"){
        if(Activetool == "pencil"){
            pencilOptions.classList.add("show");
        }
        else{
            Activetool = "pencil";
            eraserOptions.classList.remove("show");
            tools[1].classList.remove("active");
            tools[0].classList.add("active");
            ctx.strokeStyle = "blue";
            ctx.lineWidth = inputs[0].value;
            ctx.globalCompositeOperation = "source-over";
        }
    }

    else if(tool == "eraser"){
        if(Activetool == "eraser"){
            eraserOptions.classList.add("show");
        }
        else{
            Activetool = "eraser";
            tools[0].classList.remove("active");
            tools[1].classList.add("active");
            pencilOptions.classList.remove("show");
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = inputs[0].value;
        }
    }

    else if(tool == "sticky"){
        createSticky();
    }
}

let undoStack = [];
let redoStack = [];

// Pencil

let isMouseDown = false;
board.addEventListener("mousedown" , function (e) {
    ctx.beginPath();
    let top = getLocation();
    ctx.moveTo(e.clientX , e.clientY - top);
    isMouseDown = true;

    let point = {
        x: e.clientX,
        y: e.clientY - top,
        identifier: "mousedown",
        color: ctx.strokeStyle,
        width: ctx.lineWidth,
    };

    undoStack.push(point);
});

board.addEventListener("mousemove" , function (e) {
    if(isMouseDown == true) {
        let top = getLocation();
        ctx.lineTo(e.clientX , e.clientY - top);
        ctx.stroke();

        let point = {
            x: e.clientX,
            y: e.clientY - top,
            identifier: "mousemove",
            color: ctx.strokeStyle,
            width: ctx.lineWidth,
        };

        undoStack.push(point);
    }
});

board.addEventListener("mouseup" , function(e) {
    isMouseDown = false;
});


function getLocation() {
    const { top } = board.getBoundingClientRect();
    return top;
}

function sizeChange(value){
    ctx.lineWidth = value;
}

function handleColorChange(color){
    ctx.strokeStyle = color;
}

// Sticky

const body = document.querySelector("body");
function createSticky(){
    const writingPad = createBox();
    const textarea = document.createElement("textarea");
    writingPad.appendChild(textarea);
}

// Upload

const uploadImg = document.querySelector(".upload-img");
const FileInput = document.querySelector(".input-img");
uploadImg.addEventListener("click" , function(e) {
    e.preventDefault();
    FileInput.click();
    FileInput.addEventListener("change" , function(e) {
        const writingPad = createBox();

        const img = document.createElement("img");
        let src = URL.createObjectURL(e.target.files[0]);
        img.src = src;
        img.setAttribute("class" , "uploadedImgStyle");
        writingPad.appendChild(img);
        img.onload = function() {
            URL.revokeObjectURL(img.src);
        };
    });
});

//Download Board

const downloadTool = document.querySelector(".download-tool");
downloadTool.addEventListener("click" , function(e) {
    const a = document.createElement("a");
    a.download = "Notes.png";
    a.href = board.toDataURL("image/png");
    a.click();
    a.remove();
});

// Box Creation

function createBox(){
    const stickyPad = document.createElement("div");
    const navBar = document.createElement("div");
    const writingPad = document.createElement("div");
    const minimize = document.createElement("div");
    const close = document.createElement("div");
    stickyPad.setAttribute("class" , "sticky-pad");
    navBar.setAttribute("class" , "nav");
    writingPad.setAttribute("class" , "writing-pad");
    close.setAttribute("class" , "close");
    minimize.setAttribute("class" , "minimize");
    navBar.appendChild(minimize);
    navBar.appendChild(close);
    stickyPad.appendChild(navBar);
    stickyPad.appendChild(writingPad);
    body.appendChild(stickyPad);


    close.addEventListener("click" , function(){
        stickyPad.remove();
    });

    let isMinimized = false;
    minimize.addEventListener("click" , function(){
        isMinimized == false ? (writingPad.style.display = "none") : (writingPad.style.display = "block");
        isMinimized = !isMinimized;
    });

    let initialX = null;
    let initialY = null;
    let isStickyDown = false;

    navBar.addEventListener("mousedown" , function(e) {
        initialX = e.clientX;
        initialY = e.clientY;
        isStickyDown = true;
    });

    navBar.addEventListener("mousemove" , function(e) {
        if(isStickyDown == true){
            let finalX = e.clientX;
            let finalY = e.clientY;
            let diffX = finalX - initialX;
            let diffY = finalY - initialY;
            let {top , left} = stickyPad.getBoundingClientRect();
            stickyPad.style.top = top + diffY + "px";
            stickyPad.style.left = left + diffX +"px";
            initialX = finalX;
            initialY = finalY
        }
    });

    navBar.addEventListener("mouseup" , function() {
        isStickyDown = false;
    });

    navBar.addEventListener("mouseleave" , function() {
        isStickyDown = false;
    });

    document.body.appendChild(stickyPad);
    return writingPad;
}

const undo = document.querySelector(".undo");
const redo = document.querySelector(".redo");
let interval = null;

// Undo

undo.addEventListener("mousedown" , function() {
    interval = setInterval(function() {
        if(undoMaker()){
            ;
        }
    } , 50);
});

undo.addEventListener("mouseup" , function() {
    clearInterval(interval);
});

function undoMaker(){
    if(undoStack.length > 0){
        redoStack.push(undoStack.pop());
        redraw();
        return true;
    }
    return false;
}

// Redo

redo.addEventListener("mousedown" , function() {
    interval = setInterval(function() {
        if(redoMaker()){
            ;
        }
    } , 50);
});

redo.addEventListener("mouseup" , function() {
    clearInterval(interval);
});

function redoMaker(){
    if(redoStack.length > 0){
        undoStack.push(redoStack.pop());
        redraw();
        return true;
    }
    return false;
}

// Redraw

function redraw() {
    ctx.clearRect(0 , 0 , board.width , board.height);
    for(let i = 0 ; i < undoStack.length ; i++){
        let {x , y , identifier , color , width } = undoStack[i];
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if(identifier == "mousedown"){
            ctx.beginPath();
            ctx.moveTo(x , y);
        }
        else if(identifier == "mousemove"){
            ctx.lineTo(x , y);
            ctx.stroke();
        }
    }
}

