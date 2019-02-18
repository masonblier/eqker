import * as React from 'react';
import {StyleReference} from '../../styles/StyleReference';

export function App() {
  return (
    <div className='app container mx-auto'>
      <div className='header m-4'>
        <h1>
          <span className='text-primary'>eq</span><span className='text-secondary'>ker</span>
        </h1>
      </div>
      <StyleReference />
    </div>
  );
}
