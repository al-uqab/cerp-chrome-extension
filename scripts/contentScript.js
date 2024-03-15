const contentScript = () => {
    const injectMarker = () => {
        const extensionId = chrome.runtime.id;
        const marker = document.createElement('div');
        marker.id = extensionId;
        document.body.appendChild(marker);
    }

    return {
        injectMarker: injectMarker
    };
};

const script = contentScript();
script.injectMarker();
