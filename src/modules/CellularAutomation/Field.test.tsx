import React from 'react';
import { render } from '@testing-library/react';

import { Field } from './Field';
import { randomFill } from './filling';

describe('Cellular Automation Field test cases', () => {
  it('Field fragment check', () => {
    const { asFragment } = render(
      <Field width={300} height={300} cellsState={randomFill(16, 300, 300)} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
