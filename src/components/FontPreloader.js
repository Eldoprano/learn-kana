import React from 'react';
import { fontClassList } from '../fontClassList.js';

export default function FontPreloader() {
  return (
    <div className='hidden-text-for-font-loading'>
      {fontClassList.map((fontClass) => {
        return (
          <p className={"font-" + fontClass} key={"font-" + fontClass}>a</p>
        );
      })}
    </div>
  );
}
