/** @jsx jsx */
import { jsx } from '@emotion/core';

export const BlockIcon = ({ children, title, onClick }) => (
  <button
    type="button"
    css={{
      border: 'solid 1px #efefef',
      color: '#aaa',
      width: 24,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '4px 0',
      ':hover': {
        color: '#888',
      },
    }}
    // Slate has mouse up/down event that interfere with these buttons.
    // We catch the mousedown early and stop propagation
    onMouseDown={e => {
      e.preventDefault();
      e.stopPropagation();
    }}
    onMouseUp={e => {
      e.preventDefault();
      e.stopPropagation();
    }}
    onClick={onClick}
    title={title}
  >
    {children}
  </button>
);
