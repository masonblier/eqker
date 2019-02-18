import * as React from 'react';
import {TextInput,SelectInput} from '../components/App/InputWrappers';

const SAMPLE_ARRAY = ['one','two','three'];

export function StyleReference() {
  return (
    <div className=''>
      {/* shadow panes style */}
      <div className='control-pane bg-primary shadow-md rounded-md px-6 py-4 my-2'>
        <div className="font-bold text-xl mb-2">Primary shadow pane</div>
        <p className="text-default text-base">
          This is <a href="#">a link</a>.
        </p>
      </div>
      <div className='control-pane bg-secondary shadow-md rounded-md px-6 py-4 my-2'>
        <div className="font-bold text-xl mb-2">Secondary shadow pane</div>
        <p className="text-base">
          This is <a className='text-secondary' href="#">a secondary link</a>.
        </p>
      </div>
      <div className='control-pane bg-inverse text-inverse shadow-md rounded-md px-6 py-4 my-2'>
        <div className="font-bold text-xl mb-2">Inverse shadow pane</div>
        <p className="text-base">
          This is <a href="#">an inverse link</a>.
        </p>
      </div>
      {/* text */}
      <div className='p-2'>
        <h1 className='p-2'>Typography. This is h1</h1>
        <h2 className='p-2'>This is h2</h2>
        <div className='p-2'>This is normal text</div>
        <div className='p-2 text-default-soft'>This is soft text</div>
        <div className='p-2 text-primary'>This is primary text</div>
        <div className='p-2 text-secondary'>This is secondary text</div>
      </div>
      {/* form */}

      <div className='px-4 py-2'>
        <h1 className='py-2'>Forms</h1>
        <form className='max-w-xs'>
          <div className='flex flex-row my-1'>
            <span className='flex-none w-24'>Text Input</span>
            <TextInput className='mx-1 flex-grow'
              value={''} onChange={() => {}}/>
          </div>
          <div className='flex flex-row my-1'>
            <span className='flex-none w-24'>Select Input</span>
            <SelectInput className='mx-1 flex-grow' options={SAMPLE_ARRAY}
              value={''} onChange={()=>{}}/>
          </div>
        </form>
      </div>
      {/* grid */}
      <div className='-mx-2 my-4'>
        <h1 className='px-6 py-4'>Grids</h1>
        <div className='flex flex-row flex-wrap flex-grid'>
          {SAMPLE_ARRAY.map((text,idx) => (
            <div className='flex-grid-w-md' key={idx}>
              <div className='bg-secondary shadow-md rounded-md m-2 p-4 relative'>
                <div>{text}</div>
                <a className='close-x' onClick={() => {}}>x</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
