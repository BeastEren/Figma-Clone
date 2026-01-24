/*************************
    CENTRAL STATE
 *************************/
const layersHeaderIcon = document.querySelector(".layers i");
const layersList = document.querySelector(".add-new-layer");

let layersVisible = true;

document.querySelector(".layers").addEventListener("click", () => {
    layersVisible = !layersVisible;

    if (layersVisible) {
        layersList.classList.remove("layers-list-hidden");
        layersHeaderIcon.classList.remove("ri-arrow-drop-right-line");
        layersHeaderIcon.classList.add("ri-arrow-down-s-line");
    } else {
        layersList.classList.add("layers-list-hidden");
        layersHeaderIcon.classList.remove("ri-arrow-down-s-line");
        layersHeaderIcon.classList.add("ri-arrow-drop-right-line");
    }
});

const state = {
    elements: [],              // all elements data
    selectedElementIds: [],   // currently selected element
};

let activeTool = "move";

let idCounter = 0;

let dragStartMouseX = 0;
let dragStartMouseY = 0;

/*************************
    DOM REFERENCES
 *************************/

const canvas = document.getElementById("main-content");
const squareTool = document.querySelector(".ri-square-line");
const textTool = document.querySelector(".ri-text");
const propertiesPanel = document.getElementById("right-menu");

const moveIcon = document.querySelector(".move-tool .ri-drag-drop-line");
moveIcon.classList.add("active");

let isMarqueeSelecting = false;
let marqueeStartX = 0;
let marqueeStartY = 0;
let marqueeBox = null;

/*************************
    UTILS
 *************************/

function generateId() {
    idCounter++;
    return "el-" + idCounter;
}

/*************************
    RENDERING
 *************************/
let multiDragStart = [];
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
        el.textContent = data.text;
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

        const canvasRect = canvas.getBoundingClientRect();
        dragStartMouseX = e.clientX - canvasRect.left;
        dragStartMouseY = e.clientY - canvasRect.top;

        multiDragStart = state.selectedElementIds.map(id => {
            const d = state.elements.find(el => el.id === id);
            return {
                id,
                startX: d.x,
                startY: d.y
            };
        });
    });

    canvas.appendChild(el);
    el.style.zIndex = state.elements.length;
}

/*************************
    SELECTION LOGIC
 *************************/

function selectElement(id) {
    if (state.selectedElementIds.includes(id)) return;

    clearSelection();
    state.selectedElementIds = [id];

    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
        el.classList.add("selected");
        if (!isDrawing) {
            addResizeHandles(el);
            addRotateHandle(el);
        }
    }

    renderLayersPanel();
    renderPropertiesPanel();
}

/*************************
    CLEAR SELECTION
 *************************/
function clearSelection() {
    document
        .querySelectorAll(".canvas-element.selected")
        .forEach(el => {
            el.classList.remove("selected");
            el.querySelectorAll(".resize-handle, .rotate-handle")
                .forEach(h => h.remove());
        });

    state.selectedElementIds = [];

    renderLayersPanel();
    renderPropertiesPanel();
}

/*************************
    TOOL EVENTS
 *************************/
const toolIcons = document.querySelectorAll(
    ".ri-square-line, .ri-text, .ri-drag-drop-line"
);

function activateTool(iconEl, toolType) {
    toolIcons.forEach(i => i.classList.remove("active"));
    iconEl.classList.add("active");
    activeTool = toolType;
}

function deactivateTool() {
    toolIcons.forEach(i => i.classList.remove("active"));
    activeTool = "move";
}

squareTool.addEventListener("click", () => {
    activateTool(squareTool, "rectangle");
});

textTool.addEventListener("click", () => {
    activateTool(textTool, "text");
});

moveIcon.addEventListener("click", () => {
    activateTool(moveIcon, "move");
});


/*************************
    DRAGGING LOGIC
 *************************/
let isDrawing = false;
let drawStartX = 0;
let drawStartY = 0;
let drawingElementId = null;

let isDragging = false;

document.addEventListener("mousemove", (e) => {
    /* =======================
        SELECTION DRAGGING
    ======================== */
    if (isMarqueeSelecting && !isDrawing && marqueeBox) {
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const x = Math.min(marqueeStartX, currentX);
        const y = Math.min(marqueeStartY, currentY);
        const width = Math.abs(currentX - marqueeStartX);
        const height = Math.abs(currentY - marqueeStartY);

        marqueeBox.style.left = x + "px";
        marqueeBox.style.top = y + "px";
        marqueeBox.style.width = width + "px";
        marqueeBox.style.height = height + "px";

        return;
    }

    /* =======================
       DRAWING
    ======================== */
    if (isDrawing && drawingElementId) {
        const data = state.elements.find(el => el.id === drawingElementId);
        if (!data) return;

        const canvasRect = canvas.getBoundingClientRect();
        const currentX = e.clientX - canvasRect.left;
        const currentY = e.clientY - canvasRect.top;

        let width = Math.abs(currentX - drawStartX);
        let height = Math.abs(currentY - drawStartY);

        if (e.shiftKey) {
            const size = Math.max(width, height);
            width = size;
            height = size;
        }

        data.width = width;
        data.height = height;
        data.x = Math.min(drawStartX, currentX);
        data.y = Math.min(drawStartY, currentY);

        const el = document.querySelector(`[data-id="${data.id}"]`);
        if (el) {
            el.style.left = data.x + "px";
            el.style.top = data.y + "px";
            el.style.width = data.width + "px";
            el.style.height = data.height + "px";
        }

        return;
    }

    /* =======================
       DRAGGING
    ======================== */
    if (isDragging && multiDragStart.length > 0) {
        const canvasRect = canvas.getBoundingClientRect();

        const currentX = e.clientX - canvasRect.left;
        const currentY = e.clientY - canvasRect.top;

        const deltaX = currentX - dragStartMouseX;
        const deltaY = currentY - dragStartMouseY;

        multiDragStart.forEach(item => {
            const data = state.elements.find(el => el.id === item.id);
            if (!data) return;

            const maxX = canvasRect.width - data.width;
            const maxY = canvasRect.height - data.height;

            data.x = Math.max(0, Math.min(item.startX + deltaX, maxX));
            data.y = Math.max(0, Math.min(item.startY + deltaY, maxY));


            const el = document.querySelector(`[data-id="${data.id}"]`);
            if (el) {
                el.style.left = data.x + "px";
                el.style.top = data.y + "px";
            }
        });

        return;
    }


    /* =======================
       RESIZING
    ======================== */
    if (isResizing && resizeDirection && state.selectedElementIds.length === 1) {
        const data = state.elements.find(
            (el) => el.id === state.selectedElementIds[0]
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

        return;
    }

    /* =======================
       ROTATION
    ======================== */
    if (isRotating && state.selectedElementIds.length === 1) {
        const data = state.elements.find(
            (el) => el.id === state.selectedElementIds[0]
        );
        if (!data) return;

        const angle = Math.atan2(
            e.clientY - centerY,
            e.clientX - centerX
        );

        const degrees = (angle - startAngle) * 180 / Math.PI;

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
    if (isMarqueeSelecting && marqueeBox) {
        const boxRect = marqueeBox.getBoundingClientRect();

        clearSelection();

        state.elements.forEach((data) => {
            const el = document.querySelector(`[data-id="${data.id}"]`);
            if (!el) return;

            const elRect = el.getBoundingClientRect();

            const fullyInside =
                elRect.left >= boxRect.left &&
                elRect.right <= boxRect.right &&
                elRect.top >= boxRect.top &&
                elRect.bottom <= boxRect.bottom;

            if (fullyInside) {
                state.selectedElementIds.push(data.id);
                el.classList.add("selected");
            }
        });

        // Only show handles if exactly ONE element is selected
        if (state.selectedElementIds.length === 1) {
            const el = document.querySelector(
                `[data-id="${state.selectedElementIds[0]}"]`
            );
            if (el) {
                addResizeHandles(el);
                addRotateHandle(el);
            }
        }

        marqueeBox.remove();
        marqueeBox = null;
        isMarqueeSelecting = false;

        multiDragStart = [];
        return;
    }

    if (isDrawing) {
        isDrawing = false;
        drawingElementId = null;

        deactivateTool();
        activateTool(moveIcon, "move");

        if (state.selectedElementIds.length === 1) {
            const el = document.querySelector(
                `[data-id="${state.selectedElementIds[0]}"]`
            );
            if (el) {
                addResizeHandles(el);
                addRotateHandle(el);
            }
        }

        renderLayersPanel();
        saveToLocalStorage();
        return;
    }

    isDragging = false;

    isResizing = false;
    resizeDirection = null;

    isRotating = false;

    saveToLocalStorage();
});

/*************************
    CANVAS DESELECT
 *************************/
let marqueeThreshold = 4;
let isMarqueeCandidate = false;

canvas.addEventListener("mousedown", (e) => {
    if (activeTool === "move" && e.target === canvas) {
        isMarqueeSelecting = true;

        const rect = canvas.getBoundingClientRect();
        marqueeStartX = e.clientX - rect.left;
        marqueeStartY = e.clientY - rect.top;

        marqueeBox = document.createElement("div");
        marqueeBox.className = "marquee";
        marqueeBox.style.left = marqueeStartX + "px";
        marqueeBox.style.top = marqueeStartY + "px";

        canvas.appendChild(marqueeBox);

        clearSelection();
        return;
    }

    // If a tool is active → start drawing
    if (activeTool === "rectangle" || activeTool === "text") {
        isDrawing = true;

        const canvasRect = canvas.getBoundingClientRect();
        drawStartX = e.clientX - canvasRect.left;
        drawStartY = e.clientY - canvasRect.top;

        const id = generateId();

        const elementData = {
            id,
            type: activeTool,
            x: drawStartX,
            y: drawStartY,
            width: 1,
            height: 1,
            rotation: 0,
            styles: {
                backgroundColor:
                    activeTool === "text" ? "transparent" : "rgb(214, 214, 214)",
                color: "#ffffff",
            },
            text: activeTool === "text" ? "Text" : "",
        };

        state.elements.push(elementData);
        renderElement(elementData);

        drawingElementId = id;

        selectElement(id);
        return;
    }

    // Otherwise → normal deselect
    clearSelection();
});

/*************************
    RESIZING LOGIC
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

            isDragging = false;

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
    ROTATION LOGIC
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

        isDragging = false;


        const rect = el.getBoundingClientRect();
        centerX = rect.left + window.scrollX + rect.width / 2;
        centerY = rect.top + window.scrollY + rect.height / 2;

        const data = state.elements.find(elData => elData.id === el.dataset.id);
        const initialRotation = data.rotation || 0;

        startAngle =
            Math.atan2(
                e.clientY - centerY,
                e.clientX - centerX
            ) - (initialRotation * Math.PI / 180);
    });

    el.appendChild(handle);
}

/*************************
    LAYERS PANEL
 *************************/
const layersContainer = document.querySelector(".add-new-layer");

const iconMap = {
    rectangle: '<i class="ri-square-line"></i>',
    text: '<i class="ri-text"></i>'
};

function renderLayersPanel() {
    layersContainer.innerHTML = "";

    [...state.elements].reverse().forEach((el, index) => {
        const layer = document.createElement("div");
        layer.classList.add("layer-item");

        if (state.selectedElementIds.includes(el.id)) {
            layer.classList.add("active");
        }


        layer.innerHTML = `
            <div class="layer-icon">
                ${iconMap[el.type] || ""}
                <span>${el.type} (${el.id})</span>
            </div>
            <div class="layer-actions">
                <button class="layer-up" data-action="up"><i class="ri-arrow-up-s-fill"></i></button>
                <button class="layer-down" data-action="down"><i class="ri-arrow-down-s-fill"></i></button>
            </div>
        `;

        const iconEl = layer.querySelector(".layer-icon i");

        if (iconEl && el.styles?.backgroundColor) {
            if (el.styles?.backgroundColor === "transparent") {
                iconEl.style.color = "#c2c2c2";
            }

            else
                iconEl.style.color = el.styles.backgroundColor;
        }

        layer.addEventListener("click", () => {
            selectElement(el.id);
        });
        layer.querySelector('[data-action="up"]').addEventListener("click", (e) => {
            e.stopPropagation();
            moveLayerUp(el.id);
        });

        layer.querySelector('[data-action="down"]').addEventListener("click", (e) => {
            e.stopPropagation();
            moveLayerDown(el.id);
        });
        layersContainer.appendChild(layer);
    });
}


function renderPropertiesPanel() {
    propertiesPanel.innerHTML = "";

    if (state.selectedElementIds.length !== 1) {
        propertiesPanel.innerHTML = `
      <p style="opacity:0.6; font-size:0.8rem; padding:12px;">
        ${state.selectedElementIds.length === 0
                ? "Select an element to edit properties"
                : "Multiple elements selected"}
      </p>
    `;
        return;
    }

    const data = state.elements.find(
        el => el.id === state.selectedElementIds[0]
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
        <input type="text" value="${data.text}">
      </label>

      <label>
        Text Color
        <input type="color" value="${data.styles.color}" data-prop="text-color">
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
            data.text = e.target.value;

            const el = document.querySelector(
                `[data-id="${data.id}"]`
            );
            if (el) el.textContent = data.text;

            saveToLocalStorage();
        });
    }


    const deleteBtn = panel.querySelector(".delete-btn");

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            deleteSelectedElement();
        });
    }

    const textColorInput = panel.querySelector('[data-prop="text-color"]');

    if (textColorInput) {
        textColorInput.addEventListener("input", (e) => {
            data.styles.color = e.target.value;

            const el = document.querySelector(`[data-id="${data.id}"]`);
            if (el) el.style.color = data.styles.color;

            saveToLocalStorage();
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
    if (state.selectedElementIds.length === 0) return;

    state.selectedElementIds.forEach(id => {
        state.elements = state.elements.filter(el => el.id !== id);

        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) el.remove();
    });

    clearSelection();
    saveToLocalStorage();
}


/*************************
    LOCAL STORAGE
 *************************/
function saveToLocalStorage() {
    localStorage.setItem(
        "figma-editor-layout",
        JSON.stringify(state.elements)
    );
}

/*************************
    LOAD FROM LOCAL STORAGE
 *************************/
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

/*************************
    EXPORT FUNCTIONS
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
        ${el.type === "text" ? el.text : ""}
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

/*************************
    EXPORT AS JSON
 *************************/
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

/*************************
    EXPORT POPUP LOGIC
 *************************/
const figmaMenu = document.querySelector(".figmaicon-menu");
const exportPopup = document.querySelector(".export-popup");

figmaMenu.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent bubbling
    exportPopup.classList.toggle("active-export-popup");
    figmaMenu.classList.toggle("active-figmaicon-menu");
});

// Optional: click outside to close
document.addEventListener("click", () => {
    exportPopup.classList.remove("active-export-popup");
    figmaMenu.classList.remove("active-figmaicon-menu");
});

// Prevent popup click from closing itself
exportPopup.addEventListener("click", (e) => {
    e.stopPropagation();
});

document.getElementById("export-html").addEventListener("click", exportAsHTML);

document.getElementById("export-json").addEventListener("click", exportAsJSON);

/*************************
    KEYBOARD SHORTCUTS
 *************************/
document.addEventListener("keydown", (e) => {
    // Cancel drawing on Escape
    if (e.key === "Escape" && isDrawing && drawingElementId) {
        // remove from state
        state.elements = state.elements.filter(
            el => el.id !== drawingElementId
        );

        // remove from DOM
        const el = document.querySelector(
            `[data-id="${drawingElementId}"]`
        );
        if (el) el.remove();

        // reset drawing state
        isDrawing = false;
        drawingElementId = null;

        deactivateTool();
        activateTool(moveIcon, "move");

        clearSelection();
        saveToLocalStorage();

        e.preventDefault();
        return;
    }

    // Do nothing if typing inside an input
    if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
            document.activeElement.tagName === "TEXTAREA")
    ) {
        return;
    }

    if (state.selectedElementIds.length == 0) return;

    // const data = state.elements.find(
    //     (el) => el.id === state.selectedElementIds[0]
    // );
    // if (!data) return;

    switch (e.key) {
        case "Delete":
        case "Backspace":
            deleteSelectedElement();
            e.preventDefault();
            return;

        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown": {
            const STEP = 5;
            const canvasRect = canvas.getBoundingClientRect();

            state.selectedElementIds.forEach(id => {
                const data = state.elements.find(el => el.id === id);
                if (!data) return;

                switch (e.key) {
                    case "ArrowLeft":
                        data.x = Math.max(0, data.x - STEP);
                        break;

                    case "ArrowRight":
                        data.x = Math.min(
                            canvasRect.width - data.width,
                            data.x + STEP
                        );
                        break;

                    case "ArrowUp":
                        data.y = Math.max(0, data.y - STEP);
                        break;

                    case "ArrowDown":
                        data.y = Math.min(
                            canvasRect.height - data.height,
                            data.y + STEP
                        );
                        break;
                }

                const el = document.querySelector(`[data-id="${data.id}"]`);
                if (el) {
                    el.style.left = data.x + "px";
                    el.style.top = data.y + "px";
                }
            });

            saveToLocalStorage();
            e.preventDefault();
            return;
        }
    }
});


function moveLayerUp(id) {
    const index = state.elements.findIndex(el => el.id === id);
    if (index === -1 || index === state.elements.length - 1) return;

    [state.elements[index], state.elements[index + 1]] =
        [state.elements[index + 1], state.elements[index]];

    updateZIndexes();
}

function moveLayerDown(id) {
    const index = state.elements.findIndex(el => el.id === id);
    if (index <= 0) return;

    [state.elements[index], state.elements[index - 1]] =
        [state.elements[index - 1], state.elements[index]];

    updateZIndexes();
}


function updateZIndexes() {
    state.elements.forEach((elData, i) => {
        const el = document.querySelector(`[data-id="${elData.id}"]`);
        if (el) el.style.zIndex = i + 1;
    });

    renderLayersPanel();
    saveToLocalStorage();
}