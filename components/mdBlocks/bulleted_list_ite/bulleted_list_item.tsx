import { MdBlock } from 'notion-to-md/build/types'
import React from 'react'
import Paragraph from '../paragraph/paragraph';
import MdBlockComponent from '../mdBlock';

type Props={
    mdBlock:MdBlock
    depth:number
}

export default function BulletedListItem(props:Props) {
    const {mdBlock,depth} =props;
    const text = mdBlock.parent.split(" ")

    return (
        <div>
            <p className='my-1.5 flex'>
                <span className='font-bold mr-1 text-xl'>・</span>
                <Paragraph parent={text[1]} depth={depth +1} />
            </p>
            {mdBlock.children.map((child,i)=>(
                <div key={i} style={{marginLeft:(depth + 1) * 16}}>
                    <MdBlockComponent mdBlock={child} depth={depth +1} />
                </div>
            ))}
        </div>
    )
}
