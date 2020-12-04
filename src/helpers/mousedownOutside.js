/** Dispatch event on click outside of node */
// eslint-disable-next-line import/prefer-default-export
export function mousedownOutside(node) {
    const handleClick = (event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        node.dispatchEvent(
          new CustomEvent('mousedown_outside', node),
        );
      }
    };
  
    document.addEventListener('mousedown', handleClick, true);
  
    return {
      destroy() {
        document.removeEventListener('mousedown', handleClick, true);
      },
    };
  }
  