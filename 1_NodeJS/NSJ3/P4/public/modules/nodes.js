export const nodeManager = {
    createAnchor(text, href) {
        const a = document.createElement('a');
        a.textContent = text;
        a.href = href;
        a.target = '_blank';
        a.className = 'dynamic-link';
        return a;
    },
    
    modifyAttribute(element, attr, newValue) {
        const oldValue = element.getAttribute(attr);
        element.setAttribute(attr, newValue);
        return { attr, oldValue, newValue };
    }
};
