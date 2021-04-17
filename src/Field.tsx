import { types, } from 'mobx-state-tree'
import { inject, observer, } from 'mobx-react'
import React, { Component, useEffect } from 'react'
import { defaultGetValueFromEvent, toArray, toArray as toChildrenArray, warning } from './utils'
import { Meta, NamePath, Rule, RuleObject, ValidateTriggerType } from './interface'
import { useMst } from './context'

export const FieldStore = types.model("field", {
    name: types.identifier,

    value: types.maybeNull(types.string),
    error: types.maybeNull(types.array(types.string)),
    defaultValue: types.maybeNull(types.string),
    validating: types.optional(types.boolean, false)

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
    trigger?: string,
    validateTrigger?: ValidateTriggerType[]
    dependencies?: NamePath[],
    valuePropName?: string
    getValueFromEvents?: (...args: any) => any
    // renderer:React.ReactNode
    rules: RuleObject,
    isListField?: boolean,
    initialValue?: string
}

const Field: React.FC<IField> = observer(({
    children,
    name,
    trigger = "onChange",
    valuePropName = "value",
    defaultValue = "",
    getValueFromEvents,
    validateTrigger,
    rules,
    isListField = false,
    initialValue
}) => {
    const { store, validateTrigger: RootTrigger, validateMessage = {} } = useMst()

    useEffect(() => {

        if (!name) {
            warning(false, "No Name provided")
        } else if (name && !store.hasField(name)) {
            store.registerField({ name, value: initialValue || defaultValue ,defaultValue})
        } else {
            warning(false, "Duplicated Name in form")
        }
        return () => {
            if (name && store.hasField(name)) {
                store.dropField(name)
            }
        }
    }, [])

    const getMeta = () => {
        const data = store.getFieldByName(name)
        return {
            errors: data.error,
            validating: data.validating,
            name: [name]
        } as Meta
    }

    const getOnlyChild = (children: React.ReactNode) => {
        if (typeof children === 'function') {
            const meta = getMeta()
            return {
                ...getOnlyChild(children(getControlled(), meta)),
                isFunction: true
            }
        }
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
            ...mergedGetValueProps(store.hasField(name) ? store.getFieldValue(name) : defaultValue),

        };
        control[trigger] = (...args: any) => {
            let newValue
            if (getValueFromEvents) {
                newValue = getValueFromEvents(...args)
            } else {
                newValue = defaultGetValueFromEvent(valuePropName, ...args)
            }
            store.setField(name, newValue)

            if (originTriggerFunc) {
                originTriggerFunc(...args)
            }
        }
        let mergedValidate = validateTrigger ? validateTrigger : RootTrigger

        mergedValidate.forEach(item => {
            const originTrigger = control[item];
            control[item] = (...args: any) => {
                if (originTrigger) {
                    originTrigger(...args);
                }

                // Always use latest rules

                if (rules) {
                    // We dispatch validate to root,
                    // since it will update related data with other field with same name
                    store.validateFields(name, rules, validateMessage)
                }
            };
        })


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