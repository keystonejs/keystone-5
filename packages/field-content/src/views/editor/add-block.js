/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useRef, useCallback, useLayoutEffect, Fragment } from 'react';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@arch-ui/icons';
import { type as defaultBlockType } from './blocks/paragraph';
import { BlockIcon } from './block-icon';

const isChildOf = (parent, child) => {
  if (!child.parentElement) {
    return false;
  }
  if (child.parentElement === parent) {
    return child;
  } else {
    return isChildOf(parent, child.parentElement);
  }
};

const getSelectedElement = () => {
  if (document.selection) return document.selection.createRange().parentElement();
  else {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) return selection.getRangeAt(0).startContainer.parentNode;
  }
};

const calculateOffset = (container, elm) =>
  elm.getBoundingClientRect().top - container.getBoundingClientRect().top;

let AddBlock = ({ editorState, editor, blocks }) => {
  let [isOpen, setIsOpen] = useState(false);
  let focusBlock = editorState.focusBlock;
  let iconRef = useRef(null);
  let menuRef = useRef(null);

  let layout = useCallback(() => {
    let iconEle = iconRef.current;
    let menuEle = menuRef.current;
    const elm = getSelectedElement();
    if (focusBlock === null) {
      iconEle.style.top = `-9999px`;
      iconEle.style.left = `-9999px`;
      menuEle.style.top = `-9999px`;
      menuEle.style.left = `-9999px`;
      if (isOpen) {
        setIsOpen(false);
      }
      return;
    }

    if (focusBlock.text !== '' || focusBlock.type !== defaultBlockType) {
      menuEle.style.top = `-9999px`;
      menuEle.style.left = `-9999px`;
      if (isOpen) {
        setIsOpen(false);
      }
    }

    if (!blocks || !Object.keys(blocks).length) return;

    if (elm && editor && editor.el.contains(elm)) {
      const constBlockEl = isChildOf(editor.el, elm);
      iconEle.style.top = `${calculateOffset(editor.el, constBlockEl)}px`;
      iconEle.style.left = 0;
      menuEle.style.top = `${calculateOffset(editor.el, constBlockEl)}px`;
      menuEle.style.left = `42px`;
    } else {
      if (isOpen) {
        setIsOpen(false);
      }
    }
  }, [focusBlock, iconRef.current, menuRef.current]);
  useLayoutEffect(layout);

  const ItemActions =
    focusBlock && blocks[focusBlock.type] && blocks[focusBlock.type].Actions
      ? blocks[focusBlock.type].Actions
      : () => null;

  const InsertBlock = ({ node }) => {
    console.log(node);
    if (!node) return null;
    if (node.text !== '') return null;
    if (node.type !== defaultBlockType) return null;
    return (
      <BlockIcon
        onClick={() => {
          setIsOpen(x => !x);
        }}
        title="Insert block"
      >
        <PlusIcon
          css={{
            transition: '50ms transform',
            transform: isOpen ? 'rotateZ(45deg)' : 'rotateZ(0deg)',
          }}
          title={isOpen ? 'Close' : 'Open'}
        />
      </BlockIcon>
    );
  };

  const MoveUp = ({ node }) => {
    if (!node) return null;
    const index = editorState.document.nodes.findIndex(o => node.key === o.key);
    if (index === 0) return null;
    return (
      <BlockIcon
        onClick={() => {
          const index = editorState.document.nodes.findIndex(o => node.key === o.key);
          editor.moveNodeByKey(node.key, editorState.document.key, index - 1);
        }}
        title={'Move Up'}
      >
        <ArrowUpIcon title={'Move Up'} />
      </BlockIcon>
    );
  };
  const MoveDown = ({ node }) => {
    if (!node) return null;
    const index = editorState.document.nodes.findIndex(o => node.key === o.key);
    if (index === editorState.document.nodes.size - 1) return null;
    return (
      <BlockIcon
        onClick={() => {
          const index = editorState.document.nodes.findIndex(o => node.key === o.key);
          editor.moveNodeByKey(node.key, editorState.document.key, index + 1);
        }}
        title="Move Down"
      >
        <ArrowDownIcon title={'Move Down'} />
      </BlockIcon>
    );
  };
  return (
    <Fragment>
      <div
        css={{
          position: 'absolute',
          zIndex: 10,
          top: -99999,
          left: -99999,
          width: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        ref={iconRef}
      >
        <InsertBlock node={focusBlock} />
        <ItemActions node={focusBlock} />
        <MoveUp node={focusBlock} />
        <MoveDown node={focusBlock} />
      </div>
      <div ref={menuRef} css={{ position: 'absolute', zIndex: 10, top: -99999, left: -9999 }}>
        {isOpen && (
          <ul
            css={{
              background: 'white',
              listStyle: 'none',
              padding: 0,
              margin: 0,
              border: 'solid 1px #eaeaea',
            }}
          >
            <li
              css={{
                display: 'flex',
                justifyContent: 'left',
                alignItems: 'center',
              }}
            >
              <strong
                css={{
                  textTransform: 'uppercase',
                  color: '#999',
                  fontSize: '.8rem',
                  padding: '5px 15px',
                }}
              >
                Insert Block
              </strong>
            </li>
            {Object.keys(blocks).map(key => {
              let { Sidebar } = blocks[key];
              if (!blocks[key].withChrome || Sidebar === undefined) {
                return null;
              }
              return (
                <li
                  key={`sidebar-${key}`}
                  css={{
                    display: 'flex',
                    justifyContent: 'left',
                    alignItems: 'center',
                  }}
                >
                  <Sidebar key={key} editor={editor} blocks={blocks} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Fragment>
  );
};

export default AddBlock;
