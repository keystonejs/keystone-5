/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon';
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { Tooltip } from '@keystone-ui/tooltip';
import {
  component,
  ComponentPropField,
  ConditionalField,
  fields,
  FormField,
  NotEditable,
  ObjectField,
} from '@keystone-next/fields-document/component-blocks';
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@keystone-next/fields-document/primitives';

const noticeIconMap = {
  info: InfoIcon,
  error: AlertOctagonIcon,
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
};

const clientShowcase = fields.object({
  // NEED AN IMAGE FIELD
  // could do inline image selection?
  // probably give it some estimated dimensions
  // and then just render some element that the field gives you
  clientLogo: fields.url({ label: 'Client Logo' }),
  clientName: fields.conditional(fields.checkbox({ label: 'Include Client Name' }), {
    false: fields.empty(),
    true: fields.child({ kind: 'inline', placeholder: 'Client' }),
  }),
  content: fields.child({ kind: 'inline', placeholder: 'Content' }),
});

export const componentBlocks = {
  hero: component({
    component: props => {
      return (
        <div
          css={{
            backgroundColor: 'white',
            backgroundImage: `url(${props.imageSrc.value})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 28,
            justifyContent: 'space-between',
            minHeight: 200,
            padding: 16,
            width: '100%',
          }}
        >
          <div
            css={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 48,
              textAlign: 'center',
              margin: 16,
              textShadow: '0px 1px 3px black',
            }}
          >
            {props.title}
          </div>
          <div
            css={{
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              margin: 16,
              textAlign: 'center',
              textShadow: '0px 1px 3px black',
            }}
          >
            {props.content}
          </div>
          {props.cta.discriminant ? (
            <div
              css={{
                backgroundColor: '#F9BF12',
                borderRadius: 6,
                color: '#002B55',
                display: 'inline-block',
                fontSize: 16,
                fontWeight: 'bold',
                margin: '16px auto',
                padding: '12px 16px',
              }}
            >
              {props.cta.value.text}
            </div>
          ) : null}
        </div>
      );
    },
    label: 'Hero',
    props: {
      title: fields.child({ kind: 'inline', placeholder: 'Title...' }),
      content: fields.child({ kind: 'block', placeholder: '...' }),
      imageSrc: fields.text({
        label: 'Image URL',
        defaultValue: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
      }),
      cta: fields.conditional(fields.checkbox({ label: 'Show CTA' }), {
        false: fields.empty(),
        true: fields.object({
          text: fields.child({ kind: 'inline', placeholder: 'CTA...' }),
          href: fields.url({ label: 'Call to action link' }),
        }),
      }),
    },
  }),
  void: component({
    label: 'Void',
    component: ({ value }) => <NotEditable>{value.value}</NotEditable>,
    props: { value: fields.text({ label: 'Value' }) },
  }),
  conditionallyVoid: component({
    label: 'Conditionally Void',
    component: ({ something }) =>
      something.discriminant ? <NotEditable>Is void</NotEditable> : <div>{something.value}</div>,
    props: {
      something: fields.conditional(fields.checkbox({ label: 'Is void' }), {
        false: fields.child({ kind: 'inline', placeholder: '...' }),
        true: fields.empty(),
      }),
    },
  }),
  featuredAuthors: component({
    label: 'Featured Authors',
    component: props => {
      return (
        <div>
          <h1>{props.title}</h1>
          <NotEditable>
            <ul>
              {props.authors.value.map((author, i) => {
                return (
                  <li key={i}>
                    {author.label}
                    <ul>
                      {author.data.posts.map((post: { title: string | null }, i: number) => {
                        return <li key={i}>{post.title}</li>;
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </NotEditable>
        </div>
      );
    },
    props: {
      title: fields.child({ kind: 'inline', placeholder: 'Title...' }),
      authors: fields.relationship<'many'>({ label: 'Authors', relationship: 'featuredAuthors' }),
    },
  }),
  notice: component({
    component: function Notice({ content, intent }) {
      const { palette, radii, spacing } = useTheme();
      const intentMap = {
        info: {
          background: palette.blue100,
          foreground: palette.blue700,
          icon: noticeIconMap.info,
        },
        error: {
          background: palette.red100,
          foreground: palette.red700,
          icon: noticeIconMap.error,
        },
        warning: {
          background: palette.yellow100,
          foreground: palette.yellow700,
          icon: noticeIconMap.warning,
        },
        success: {
          background: palette.green100,
          foreground: palette.green700,
          icon: noticeIconMap.success,
        },
      };
      const intentConfig = intentMap[intent.value];

      return (
        <div
          css={{
            borderRadius: radii.small,
            display: 'flex',
            paddingLeft: spacing.medium,
            paddingRight: spacing.medium,
          }}
          style={{
            background: intentConfig.background,
          }}
        >
          <div
            contentEditable={false}
            css={{
              color: intentConfig.foreground,
              marginRight: spacing.small,
              marginTop: '1em',
              userSelect: 'none',
            }}
          >
            <intentConfig.icon />
          </div>
          <div css={{ flex: 1 }}>{content}</div>
        </div>
      );
    },
    label: 'Notice',
    chromeless: true,
    props: {
      intent: fields.select({
        label: 'Intent',
        options: [
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' },
          { value: 'success', label: 'Success' },
        ] as const,
        defaultValue: 'info',
      }),
      content: fields.child({
        kind: 'block',
        placeholder: '',
        formatting: 'inherit',
        dividers: 'inherit',
        links: 'inherit',
        relationships: 'inherit',
      }),
    },
    toolbar({ props, onRemove }) {
      return (
        <ToolbarGroup>
          {props.intent.options.map(opt => {
            const Icon = noticeIconMap[opt.value];

            return (
              <Tooltip key={opt.value} content={opt.label} weight="subtle">
                {attrs => (
                  <ToolbarButton
                    isSelected={props.intent.value === opt.value}
                    onClick={() => {
                      props.intent.onChange(opt.value);
                    }}
                    {...attrs}
                  >
                    <Icon size="small" />
                  </ToolbarButton>
                )}
              </Tooltip>
            );
          })}

          <ToolbarSeparator />

          <Tooltip content="Remove" weight="subtle">
            {attrs => (
              <ToolbarButton variant="destructive" onClick={onRemove} {...attrs}>
                <Trash2Icon size="small" />
              </ToolbarButton>
            )}
          </Tooltip>
        </ToolbarGroup>
      );
    },
  }),
  quote: component({
    component: ({ attribution, content }) => {
      return (
        <div
          css={{
            borderLeft: '3px solid #CBD5E0',
            paddingLeft: 16,
          }}
        >
          <div css={{ fontStyle: 'italic', color: '#4A5568' }}>{content}</div>
          <div css={{ fontWeight: 'bold', color: '#718096' }}>
            <span
              contentEditable={false}
              style={{
                userSelect: 'none',
              }}
            >
              —{' '}
            </span>
            {attribution}
          </div>
        </div>
      );
    },
    label: 'Quote',
    props: {
      content: fields.child({
        kind: 'block',
        placeholder: 'Quote...',
        formatting: { inlineMarks: 'inherit', softBreaks: 'inherit' },
        links: 'inherit',
      }),
      attribution: fields.child({ kind: 'inline', placeholder: 'Attribution...' }),
    },
    chromeless: true,
  }),
  whatWeDo: component({
    component: props => (
      <div css={{ backgroundColor: '#1D263B', color: 'white' }}>
        <h1>
          <small>{props.heading}</small>
          <br />
          <span>{props.title}</span>
        </h1>
        <p>{props.body}</p>
        <div>
          {props.items.map((x, i) => (
            <div key={i}>
              <span>Image: {x.image.value}</span>
              <p>{x.content}</p>
            </div>
          ))}
        </div>
        <div>
          <div>
            <h1
              contentEditable={
                props.clientShowcase.left.clientName.discriminant ? undefined : false
              }
            >
              <img src={props.clientShowcase.left.clientLogo.value} />
              {props.clientShowcase.left.clientName.discriminant
                ? props.clientShowcase.left.clientName.value
                : null}
            </h1>
            <p> {props.clientShowcase.left.content}</p>
          </div>
          <div>
            <h1
              contentEditable={
                props.clientShowcase.right.clientName.discriminant ? undefined : false
              }
            >
              <img src={props.clientShowcase.right.clientLogo.value} />
              {props.clientShowcase.right.clientName.discriminant
                ? props.clientShowcase.right.clientName.value
                : null}
            </h1>
            <p> {props.clientShowcase.right.content}</p>
          </div>
        </div>
      </div>
    ),
    label: 'What we do Item',
    props: {
      // color: fields.select({ ...whatever }),
      heading: fields.child({
        kind: 'inline',
        placeholder: 'Heading',
      }),
      title: fields.child({
        kind: 'inline',
        placeholder: 'Title',
      }),
      body: fields.child({ kind: 'inline', placeholder: 'Body' }),
      items: fields.array(
        fields.object({
          content: fields.child({ kind: 'inline', placeholder: 'Content' }),
          image: fields.url({ label: 'Image' }),
        })
      ),
      clientShowcase: fields.object({
        left: clientShowcase,
        right: clientShowcase,
      }),
    },
  }),
  linkedListThing: component({
    component: () => null,
    label: 'Linked List',
    props: {
      list: linkedList(fields.text({ label: 'some content' })),
    },
  }),
};

type LinkedListField<Field extends ComponentPropField> = ConditionalField<
  boolean,
  {
    false: FormField<undefined, undefined>;
    true: ObjectField<{
      value: Field;
      next: LinkedListField<Field>;
    }>;
  },
  undefined
>;

function linkedList<Field extends ComponentPropField>(field: Field): LinkedListField<Field> {
  const linkedListThing = fields.conditional(fields.checkbox({ label: 'Another Item' }), {
    true: fields.object({
      value: field,
      get next() {
        return linkedListThing;
      },
    }),
    false: fields.empty(),
  });
  return linkedListThing;
}
