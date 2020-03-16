/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { Editor } from 'slate-react';
import { Block, Document } from 'slate';
import { plugins as markPlugins } from './marks';
import { type as defaultType } from './blocks/paragraph';
import AddBlock from './add-block';
import { useStateWithEqualityCheck } from './hooks';
import Toolbar from './toolbar';
import { inputStyles } from '@arch-ui/input';

function getSchema(blocks) {
  const schema = {
    document: {
      last: { type: defaultType },
      normalize: (editor, { code, node }) => {
        switch (code) {
          case 'last_child_type_invalid': {
            const paragraph = Block.create(defaultType);
            return editor.insertNodeByKey(node.key, node.nodes.size, paragraph);
          }
        }
      },
    },
    blocks: {},
  };
  Object.keys(blocks).forEach(type => {
    if (typeof blocks[type].getSchema === 'function') {
      schema.blocks[type] = blocks[type].getSchema({ blocks });
    }
  });
  return schema;
}

function Stories({ value: editorState, onChange, blocks, id, item, className }) {
  let schema = useMemo(() => {
    return getSchema(blocks);
  }, [blocks]);
  let { focusBlock } = editorState;
  let plugins = useMemo(() => {
    const renderNode = props => {
      let block = blocks[props.node.type];
      if (block) {
        return <block.Node {...props} blocks={blocks} item={item} />;
      }
    };
    const renderBlock = props => {
      let block = blocks[props.node.type];
      if (!block) return null;

      return props.parent instanceof Document ? (
        <div css={{ display: 'flex' }}>
          <div
            css={{
              width: 30,
              borderBottom: 'solid 1px #eee',
              borderRight: 'solid 1px #eee',
              flexGrow: 0,
              flexShrink: 0,
              background:
                focusBlock && props.node && focusBlock.key === props.node.key ? '#eaeaea' : 'white',
            }}
          />
          <div css={{ padding: 5, flexGrow: 1 }}>{renderNode(props)}</div>
        </div>
      ) : (
        renderNode(props)
      );
    };
    return Object.values(blocks).reduce(
      (combinedPlugins, block) => {
        if (typeof block.getPlugins !== 'function') {
          return combinedPlugins;
        }
        return [...combinedPlugins, ...block.getPlugins({ blocks })];
      },
      [
        ...markPlugins,
        {
          renderBlock: renderBlock,
          renderInline: renderNode,
        },
      ]
    );
  }, [blocks, focusBlock]);

  let [editor, setEditor] = useStateWithEqualityCheck(null);

  return (
    <div
      className={className}
      id={id}
      css={{
        ...inputStyles({ isMultiline: true }),
        padding: 0,
        position: 'relative',
        overflow: 'scroll',
      }}
    >
      <Editor
        schema={schema}
        ref={setEditor}
        plugins={plugins}
        value={editorState}
        tabIndex={0}
        css={{
          minHeight: 250,
        }}
        onChange={({ value }) => {
          onChange(value);
        }}
      />
      <AddBlock editor={editor} editorState={editorState} blocks={blocks} />
      <Toolbar {...{ editorState, editor, blocks }} />
    </div>
  );
}

export default Stories;
