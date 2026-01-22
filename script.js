/*************************
 * PHASE 1 – CENTRAL STATE
 *************************/

const state = {
    elements: [],              // all elements data
    selectedElementId: null,   // currently selected element
};
let activeTool = null;

let idCounter = 0;

/*************************
 * DOM REFERENCES
 *************************/

const canvas = document.getElementById("main-content");
const squareTool = document.querySelector(".square-tool");
const textTool = document.querySelector(".text-tool");
const propertiesPanel = document.getElementById("right-menu");

/*************************
 * UTILS
 *************************/

function generateId() {
    idCounter++;
    return "el-" + idCounter;
}

function getDefaultPosition() {
    return {
        x: 50 + state.elements.length * 10,
        y: 50 + state.elements.length * 10,
    };
}

function setActiveTool(toolElement) {
    const tools = document.querySelectorAll(
        ".square-tool, .text-tool"
    );

    tools.forEach((tool) => tool.classList.remove("active"));

    toolElement.classList.add("active");
    activeTool = toolElement;
}

/*************************
 * ELEMENT CREATION
 *************************/

function createElement(type) {
    const id = generateId();
    const { x, y } = getDefaultPosition();

    const elementData = {
        id,
        type,
        x,
        y,
        width: type === "text" ? 120 : 100,
        height: type === "text" ? 40 : 100,
        rotation: 0,
        styles: {
            backgroundColor: type === "text" ? "transparent" : "#4c9aff",
            color: "#ffffff",
        },
    };

    state.elements.push(elementData);
    renderElement(elementData);
    renderLayersPanel();
    saveToLocalStorage();

}

/*************************
 * RENDERING
 *************************/

function renderElement(data) {
    const el = document.createElement("div");

    el.classList.add("canvas-element");
    el.dataset.id = data.id;
    el.dataset.type = data.type;

    el.style.left = data.x + "px";
    el.style.top = data.y + "px";
    el.style.width = data.width + "px";
    el.style.height = data.height + "px";
    el.style.position = "absolute";
    el.style.backgroundColor = data.styles.backgroundColor;
    el.style.color = data.styles.color;

    if (data.type === "text") {
        el.textContent = "Text";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.cursor = "text";
    }

    // selection click
    el.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        selectElement(data.id);

        isDragging = true;
        draggingElementId = data.id;

        const rect = el.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
    });


    canvas.appendChild(el);
    el.style.zIndex = state.elements.length;
}

/*************************
 * SELECTION LOGIC
 *************************/

function selectElement(id) {
    if (state.selectedElementId === id) return;

    clearSelection();
    state.selectedElementId = id;

    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
        el.classList.add("selected");
        addResizeHandles(el);
        addRotateHandle(el);
    }
    renderLayersPanel();
    renderPropertiesPanel();

}

function clearSelection() {
    const prev = document.querySelector(".canvas-element.selected");

    if (prev) {
        prev.classList.remove("selected");
        prev.querySelectorAll(".resize-handle, .rotate-handle")
            .forEach((h) => h.remove());
    }

    state.selectedElementId = null;
    renderLayersPanel();
    renderPropertiesPanel();

}

/*************************
 * TOOL EVENTS
 *************************/

squareTool.addEventListener("click", () => {
    setActiveTool(squareTool);
    createElement("rectangle");
});

textTool.addEventListener("click", () => {
    setActiveTool(textTool);
    createElement("text");
});


/*************************
 * CANVAS DESELECT
 *************************/

canvas.addEventListener("mousedown", () => {
    clearSelection();
});

/*************************
 * DRAGGING LOGIC
 *************************/

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let draggingElementId = null;

// document.addEventListener("mousemove", (e) => {
//     if (!isDragging || !draggingElementId) return;

//     const elementData = state.elements.find(
//         (el) => el.id === draggingElementId
//     );
//     if (!elementData) return;

//     const canvasRect = canvas.getBoundingClientRect();

//     let newX = e.clientX - canvasRect.left - dragOffsetX;
//     let newY = e.clientY - canvasRect.top - dragOffsetY;

//     // Boundary constraints
//     newX = Math.max(
//         0,
//         Math.min(newX, canvasRect.width - elementData.width)
//     );
//     newY = Math.max(
//         0,
//         Math.min(newY, canvasRect.height - elementData.height)
//     );

//     // Update state
//     elementData.x = newX;
//     elementData.y = newY;

//     // Update DOM
//     const el = document.querySelector(
//         `[data-id="${draggingElementId}"]`
//     );
//     if (el) {
//         el.style.left = newX + "px";
//         el.style.top = newY + "px";
//     }
// });


// document.addEventListener("mousemove", (e) => {
//     if (!isResizing || !resizeDirection) return;

//     const data = state.elements.find(
//         (el) => el.id === state.selectedElementId
//     );
//     if (!data) return;

//     let dx = e.clientX - startMouseX;
//     let dy = e.clientY - startMouseY;

//     let newWidth = startWidth;
//     let newHeight = startHeight;
//     let newX = startX;
//     let newY = startY;

//     if (resizeDirection.includes("e")) {
//         newWidth = Math.max(MIN_WIDTH, startWidth + dx);
//     }
//     if (resizeDirection.includes("s")) {
//         newHeight = Math.max(MIN_HEIGHT, startHeight + dy);
//     }
//     if (resizeDirection.includes("w")) {
//         newWidth = Math.max(MIN_WIDTH, startWidth - dx);
//         newX = startX + dx;
//     }
//     if (resizeDirection.includes("n")) {
//         newHeight = Math.max(MIN_HEIGHT, startHeight - dy);
//         newY = startY + dy;
//     }

//     // Update state
//     data.width = newWidth;
//     data.height = newHeight;
//     data.x = newX;
//     data.y = newY;

//     // Update DOM
//     const el = document.querySelector(
//         `[data-id="${data.id}"]`
//     );
//     if (el) {
//         el.style.width = newWidth + "px";
//         el.style.height = newHeight + "px";
//         el.style.left = newX + "px";
//         el.style.top = newY + "px";
//     }
// });

// document.addEventListener("mousemove", (e) => {
//     if (!isRotating || !state.selectedElementId) return;

//     const data = state.elements.find(
//         (el) => el.id === state.selectedElementId
//     );
//     if (!data) return;

//     const angle = Math.atan2(
//         e.clientY - centerY,
//         e.clientX - centerX
//     );

//     const degrees = ((angle - startAngle) * 180) / Math.PI;
//     data.rotation = degrees;

//     const el = document.querySelector(
//         `[data-id="${data.id}"]`
//     );
//     if (el) {
//         el.style.transform = `rotate(${degrees}deg)`;
//     }
// });


document.addEventListener("mousemove", (e) => {
    /* =======================
       DRAGGING
    ======================== */
    if (isDragging && draggingElementId) {
        const elementData = state.elements.find(
            (el) => el.id === draggingElementId
        );
        if (!elementData) return;

        const canvasRect = canvas.getBoundingClientRect();

        let newX = e.clientX - canvasRect.left - dragOffsetX;
        let newY = e.clientY - canvasRect.top - dragOffsetY;

        newX = Math.max(
            0,
            Math.min(newX, canvasRect.width - elementData.width)
        );
        newY = Math.max(
            0,
            Math.min(newY, canvasRect.height - elementData.height)
        );

        elementData.x = newX;
        elementData.y = newY;

        const el = document.querySelector(
            `[data-id="${draggingElementId}"]`
        );
        if (el) {
            el.style.left = newX + "px";
            el.style.top = newY + "px";
        }

        return; // 🔑 IMPORTANT: stop here
    }

    /* =======================
       RESIZING
    ======================== */
    if (isResizing && resizeDirection && state.selectedElementId) {
        const data = state.elements.find(
            (el) => el.id === state.selectedElementId
        );
        if (!data) return;

        let dx = e.clientX - startMouseX;
        let dy = e.clientY - startMouseY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startX;
        let newY = startY;

        if (resizeDirection.includes("e")) {
            newWidth = Math.max(MIN_WIDTH, startWidth + dx);
        }
        if (resizeDirection.includes("s")) {
            newHeight = Math.max(MIN_HEIGHT, startHeight + dy);
        }
        if (resizeDirection.includes("w")) {
            newWidth = Math.max(MIN_WIDTH, startWidth - dx);
            newX = startX + dx;
        }
        if (resizeDirection.includes("n")) {
            newHeight = Math.max(MIN_HEIGHT, startHeight - dy);
            newY = startY + dy;
        }

        data.width = newWidth;
        data.height = newHeight;
        data.x = newX;
        data.y = newY;

        const el = document.querySelector(
            `[data-id="${data.id}"]`
        );
        if (el) {
            el.style.width = newWidth + "px";
            el.style.height = newHeight + "px";
            el.style.left = newX + "px";
            el.style.top = newY + "px";
        }

        return; // 🔑 IMPORTANT: stop here
    }

    /* =======================
       ROTATION
    ======================== */
    if (isRotating && state.selectedElementId) {
        const data = state.elements.find(
            (el) => el.id === state.selectedElementId
        );
        if (!data) return;

        const angle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX
        );

        const degrees = ((angle - startAngle) * 180) / Math.PI;
        data.rotation = degrees;

        const el = document.querySelector(
            `[data-id="${data.id}"]`
        );
        if (el) {
            el.style.transform = `rotate(${degrees}deg)`;
        }
    }
});


document.addEventListener("mouseup", () => {
    isDragging = false;
    draggingElementId = null;

    isResizing = false;
    resizeDirection = null;

    isRotating = false;

    saveToLocalStorage();
});

/*************************
 * RESIZING LOGIC
 *************************/
const MIN_WIDTH = 30;
const MIN_HEIGHT = 30;

let isResizing = false;
let resizeDirection = null;

let startMouseX = 0;
let startMouseY = 0;

let startWidth = 0;
let startHeight = 0;
let startX = 0;
let startY = 0;

function addResizeHandles(el) {
    const directions = ["nw", "ne", "sw", "se"];

    directions.forEach((dir) => {
        const handle = document.createElement("div");
        handle.classList.add("resize-handle", `resize-${dir}`);

        handle.addEventListener("mousedown", (e) => {
            e.stopPropagation();

            isResizing = true;
            resizeDirection = dir;

            startMouseX = e.clientX;
            startMouseY = e.clientY;

            const id = el.dataset.id;
            const data = state.elements.find((item) => item.id === id);

            startWidth = data.width;
            startHeight = data.height;
            startX = data.x;
            startY = data.y;
        });

        el.appendChild(handle);
    });
}
/*************************
 * ROTATION LOGIC
 *************************/
let isRotating = false;
let startAngle = 0;
let centerX = 0;
let centerY = 0;

function addRotateHandle(el) {
    const handle = document.createElement("div");
    handle.classList.add("rotate-handle");

    handle.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        isRotating = true;

        const rect = el.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;

        startAngle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX
        );
    });

    el.appendChild(handle);
}

/*************************
 * LAYERS PANEL
 *************************/
const layersContainer = document.querySelector(".add-new-layer");

function renderLayersPanel() {
    layersContainer.innerHTML = "";

    state.elements.forEach((el, index) => {
        const layer = document.createElement("div");
        layer.classList.add("layer-item");
        if (el.id === state.selectedElementId) {
            layer.classList.add("active");
        }

        layer.textContent = `${el.type} (${el.id})`;

        layer.addEventListener("click", () => {
            selectElement(el.id);
        });

        layersContainer.appendChild(layer);
    });
}


function renderPropertiesPanel() {
    propertiesPanel.innerHTML = "";

    if (!state.selectedElementId) {
        propertiesPanel.innerHTML = `
      <p style="opacity:0.6; font-size:0.8rem; padding:12px;">
        Select an element to edit properties
      </p>
    `;
        return;
    }

    const data = state.elements.find(
        (el) => el.id === state.selectedElementId
    );
    if (!data) return;

    const panel = document.createElement("div");
    panel.classList.add("properties");

    panel.innerHTML = `
    <label>
      Width
      <input type="number" value="${data.width}" data-prop="width">
    </label>

    <label>
      Height
      <input type="number" value="${data.height}" data-prop="height">
    </label>

    <label>
      Background
      <input type="color" value="${data.styles.backgroundColor}">
    </label>

    <button class="delete-btn">
        Delete Element
    </button>
  `;

    // Text-specific property
    if (data.type === "text") {
        panel.innerHTML += `
      <label>
        Text
        <input type="text" value="Text">
      </label>
    `;
    }

    propertiesPanel.appendChild(panel);

    bindPropertyInputs(panel, data);
}


function bindPropertyInputs(panel, data) {
    const widthInput = panel.querySelector('[data-prop="width"]');
    const heightInput = panel.querySelector('[data-prop="height"]');
    const colorInput = panel.querySelector('input[type="color"]');
    const textInput = panel.querySelector('input[type="text"]');

    if (widthInput) {
        widthInput.addEventListener("input", (e) => {
            data.width = +e.target.value;
            updateElementDOM(data);
        });
    }

    if (heightInput) {
        heightInput.addEventListener("input", (e) => {
            data.height = +e.target.value;
            updateElementDOM(data);
        });
    }

    if (colorInput) {
        colorInput.addEventListener("input", (e) => {
            data.styles.backgroundColor = e.target.value;
            updateElementDOM(data);
        });
    }

    if (textInput) {
        textInput.addEventListener("input", (e) => {
            const el = document.querySelector(
                `[data-id="${data.id}"]`
            );
            if (el) el.textContent = e.target.value;
        });
    }

    const deleteBtn = panel.querySelector(".delete-btn");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            deleteSelectedElement();
        });
    }
}

function updateElementDOM(data) {
    const el = document.querySelector(
        `[data-id="${data.id}"]`
    );
    if (!el) return;

    el.style.width = data.width + "px";
    el.style.height = data.height + "px";
    el.style.backgroundColor = data.styles.backgroundColor;
}

function deleteSelectedElement() {
    if (!state.selectedElementId) return;

    const id = state.selectedElementId;

    // Remove from state
    state.elements = state.elements.filter(
        (el) => el.id !== id
    );

    // Remove from DOM
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();

    // Clear selection
    state.selectedElementId = null;

    // Update panels
    renderLayersPanel();
    renderPropertiesPanel();
    saveToLocalStorage();
}

/*************************
 * LOCAL STORAGE
 *************************/

function saveToLocalStorage() {
    localStorage.setItem(
        "figma-editor-layout",
        JSON.stringify(state.elements)
    );
}

/*************************
 * EXPORT FUNCTIONS
 *************************/
function exportAsHTML() {
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Exported Design</title>
        </head>
        <body style="margin:0; position:relative;">
        `;

    state.elements.forEach((el) => {
        html += `
        <div style="
        position:absolute;
        left:${el.x}px;
        top:${el.y}px;
        width:${el.width}px;
        height:${el.height}px;
        background:${el.styles.backgroundColor};
        color:${el.styles.color};
        transform:rotate(${el.rotation}deg);
        ">
        ${el.type === "text" ? "Text" : ""}
        </div>
        `;
    });

    html += `
        </body>
        </html>
        `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "design.html";
    a.click();

    URL.revokeObjectURL(url);
}



function exportAsJSON() {
    const json = JSON.stringify(state.elements, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "design.json";
    a.click();

    URL.revokeObjectURL(url);
}


function loadFromLocalStorage() {
    const saved = localStorage.getItem("figma-editor-layout");
    if (!saved) return;

    const elements = JSON.parse(saved);

    elements.forEach((elData) => {
        state.elements.push(elData);
        renderElement(elData);

        const el = document.querySelector(
            `[data-id="${elData.id}"]`
        );
        if (el && elData.rotation) {
            el.style.transform = `rotate(${elData.rotation}deg)`;
        }
    });

    renderLayersPanel();
    renderPropertiesPanel();
    idCounter = state.elements.length;
}

loadFromLocalStorage();