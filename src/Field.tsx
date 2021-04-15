import { types, } from 'mobx-state-tree'
import { inject, observer, } from 'mobx-react'
import React, { Component, useEffect } from 'react'
import { defaultGetValueFromEvent, toArray as toChildrenArray, warning } from './utils'
import { NamePath } from './interface'
import { useMst } from './context'

export const FieldStore = types.model("field", {
    name: types.identifier,

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
    name: string
    defaultValue?: string
    type?: 'string' | 'number',
    trigger?: string,
    validateOn?: 'change' | 'blur'
    dependencies?: NamePath[],
    valuePropName?: string
    getValueFromEvents?: (...args: any) => any
    // renderer:React.ReactNode
}

const Field: React.FC<IField> = observer(({
    children,
    name,
    trigger = "onChange",
    valuePropName = "value",
    defaultValue="",
    getValueFromEvents
}) => {
    const store = useMst()

    useEffect(() => {

        if (!name) {
            warning(false, "No Name provided")
        } else if (name && !store.hasField(name)) {
            store.registerField({ name, value: defaultValue })
        } else {
            warning(false, "Duplicated Name in form")
        }
        return () => {
            if (name && store.hasField(name)) {
                store.dropField(name)
            }
        }
    }, [])

    const getOnlyChild = (children: React.ReactNode) => {
        const childList = toChildrenArray(children);
        if (childList.length !== 1 || !React.isValidElement(childList[0])) {
            return { child: childList, isFunction: false };
        }

        return { child: childList[0], isFunction: false };

    }
    const getControlled: any = (childProps: { [name: string]: any }) => {
        const originTriggerFunc: any = childProps[trigger];
        const mergedGetValueProps = ((val) => ({ [valuePropName]: val }));
        const control = {
            ...childProps,
            ...mergedGetValueProps(store.getFieldValue(name) || defaultValue),

        };
        control[trigger] = (...args: any) => {
            let newValue
            if (getValueFromEvents) {
                newValue = getValueFromEvents(...args)
            } else {
                newValue = defaultGetValueFromEvent(valuePropName, ...args)
            }
            store.setField(name, newValue)
        }

        return control
    }

    const returnChild = () => {

        let returnChildNode = null
        const { child, isFunction } = getOnlyChild(children);
        if (isFunction) {
            returnChildNode = child;
        } else if (React.isValidElement(child)) {
            returnChildNode = React.cloneElement(
                child as React.ReactElement,
                getControlled((child as React.ReactElement).props),
            );
        } else {
            returnChildNode = child
            warning(false, "`renderer is not valid`")
        }

        return returnChildNode as React.ReactNode
    }


    return (<React.Fragment>{returnChild()}</React.Fragment>)
})



export default Field