import * as React from 'react';

export interface TextInputProps {
  value?: string;
  className?: string;
  onChange(value: string): void;
}

export interface SelectInputProps {
  options: string[];
  value?: string;
  className?: string;
  onChange(value: string): void;
}

/*
  TextInput
    wraps input type='text'
*/
export function TextInput({value,onChange,className}: TextInputProps) {
  return (
    <input type='text' className={className} value={value||''} onChange={(evt) => onChange(evt.target.value)}/>
  );
}

/*
  SelectInput
    wraps select input
*/
export function SelectInput({options,value,onChange,className}: SelectInputProps) {
  return (
    <select className={className} value={value||''}
      onChange={(evt) => onChange(evt.target.value)}
      placeholder='Select'
    >
      <option key='empty' value={''} disabled>Select</option>
      {options.map((s,idx) => <option key={idx} value={s}>{s}</option>)}
    </select>
  );
}
