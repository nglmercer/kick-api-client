const hoverStyles = `
<style>
    .dropdown-item {
        background: #222c3a;
        border-radius: 8px;
        padding: 4px 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
        cursor: pointer;
        height: 48px;
        font-size: 12pt;
        width: 100%;
    }
    .dropdown-item:hover {
        background: #2e3e53;
    }
</style>
`;
function setPopupOptions(popupOptions, popupId = "custom-popup"){
    const popupElement = document.querySelector(popupId);
    popupElement.options = popupOptions;
}
function returnMenuOption(idName, textName, iconName, callback) {
    return  {
    id: idName,
    text: textName,
    icon: iconName,
    callback: () => {
        callback();
    }
    }
}

function openPopup(element, popupId = "custom-popup") {
    const popupElement = document.querySelector(popupId);
    if (!popupElement) return;
    if (typeof element === "string") {
        const buttonElement  = document.querySelector(element);
            popupElement.showAtElement(buttonElement);
    } else {
        const buttonElement = element;
        popupElement.showAtElement(buttonElement);
    }
}
export {setPopupOptions, returnMenuOption, openPopup, hoverStyles};