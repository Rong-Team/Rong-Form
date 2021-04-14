import { types, } from 'mobx-state-tree'
import { inject, observer, } from 'mobx-react'
import React, { Component } from 'react'
import { toArray as toChildrenArray, warning } from './utils'

export const FieldStore = types.model("field", {
    name: types.string,

    value: types.maybeNull(types.string),
    error: types.maybeNull(types.string)

}).actions((self) => ({
    setValue(value: any) {
        self.value = value
    },
    reset() {
        self.value = null
    }
}))

export interface IField {
    
}

const Field = (observer(({ renderer }:{renderer:React.ReactNode}) => {
    const getOnlyChild = (children: React.ReactNode) => {
        const childList = toChildrenArray(children);
        if (childList.length !== 1 || !React.isValidElement(childList[0])) {
            return { child: childList, isFunction: false };
        }

        return { child: childList[0], isFunction: false };

    }
    const getControlled: any = (child: React.ReactElement) => {

    }

    const returnChild = () => {
      
        let returnChildNode = null
        const { child, isFunction } = getOnlyChild(renderer);
        if (isFunction) {
            returnChildNode = child;
        } else if(React.isValidElement(child)){
            returnChildNode = React.cloneElement(
                child as React.ReactElement,
              //  getControlled((child as React.ReactElement).props),
            );
        } else{
            returnChildNode=child
            warning(false,"`renderer is not valid`")
        }

        return returnChildNode as React.ReactNode
    }


    return (<React.Fragment>{returnChild()}</React.Fragment>)
}
)
)



export default Field