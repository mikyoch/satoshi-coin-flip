// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import ExplorerLink from "./ExplorerLink";

/* 
    This component needs the following prop
    linksArray: [{id: `string`, type: `string`}]
    Each element is an object with `id` and `type` fields
    `id` is the address, object id or transaction id we want to search on the explorer
    `type` is one of `address` `object` `transaction`
*/
const LinksContainer = ({ linksArray }) => {
    return (
        <div className="w-[100%] pl-7 self-center drop-shadow-xl">
            {linksArray.map((item)=> 
                <ExplorerLink key={item.id} type={item.type} id={item.id} text={item.text} amount={item?.amount} />
            )}
        </div>
    )
}

export default LinksContainer;