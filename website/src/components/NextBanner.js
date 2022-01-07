/** @jsx jsx */

import { jsx } from '@emotion/core';

const bannerStyles = {
  textAlign: 'center',
  background: '#FFFBEB',
  borderBottom: '1px solid #FEF3C7',
  display: 'block',
  padding: 12,
  color: 'black',

  ':hover': {
    textDecoration: 'none',

    background: '#FEF3C7',
    borderBottom: '1px solid #FDE68A',
  },
};

export const NextBanner = () => (
  <div>
    <a css={bannerStyles} href="https://keystonejs.com">
      👋🏻{' '}
      <span>
        Keystone 5 has officially moved to maintenance only. For the latest release of Keystone
        please visit the Keystone website.
      </span>
    </a>
  </div>
);
