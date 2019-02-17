import * as React from 'react';

export function App() {
  return (
    <div className='app container mx-auto p-4'>
      <div className='header p-4'>
        <h1>
          <span className='text-primary'>eq</span><span className='text-secondary'>ker</span>
        </h1>
      </div>
      <div className='control-pane bg-primary shadow-md rounded-md px-6 py-4 my-2'>
        <div className="font-bold text-xl mb-2">Primary shadow pane</div>
        <p className="text-default text-base">
          This is <a href="#">a link</a>.
        </p>
      </div>
      <div className='p-2'>
        <div className='p-2'>This is normal text</div>
        <div className='p-2 text-default-soft'>This is soft text</div>
        <div className='p-2 text-primary'>This is primary text</div>
        <div className='p-2 text-secondary'>This is secondary text</div>
        <div className='p-2 text-inverse bg-inverse'>This is inverse text</div>
      </div>
    </div>
  );
}
