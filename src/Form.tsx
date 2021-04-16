import { toJS } from "mobx";
import { addMiddleware, getSnapshot, Instance, TypeOfValue, types } from "mobx-state-tree";
import React, { useImperativeHandle } from "react";
import { Provider } from "./context";

import { FieldStore } from "./Field";
import { FormStore } from "./formType";
import { Callbacks, Rule, ValidateMessages, ValidateTriggerType } from "./interface";





export interface IFormProps {
    initialValues?: { [name: string]: any },
    children?: React.ReactNode
    component: false | string | React.FC<any>,
    name?: string
    onValuesChange: Callbacks<any>['onValuesChange']
    onFieldsChange: Callbacks<any>['onFieldsChange']
    onFinish: Callbacks<any>['onFinish']
    validateMessages?:ValidateMessages
    validateTrigger?:ValidateTriggerType[]
}
const formState = FormStore.create({ fields: {} },)
const Form= React.forwardRef<any,IFormProps>(({ 
    children, 
    component: Component = "form" as any, 
    onFinish, 
    onValuesChange,
validateMessages,
validateTrigger=[]
 }, ref) => {


    // useImperativeHandle(
    //     ref,
    //     () => ({
    //         getFieldValue(name:string){
    //             return formState.getFieldValue(name)
    //         },

    //     }),
    //     [],
    // )

    const getValues=(args)=>{
        return formState.getFieldKeys(args[0],args[1])
    }
    const disposer = (baseStore) => {
        if (onValuesChange) {
            addMiddleware(baseStore, (call, next, abort) => {
                if (call.name === "setField") {
                    const args = call.args
                    onValuesChange({ [args[0]]: args[1] }, getValues(args))
                }
                return next(call)
            })
        }
        return baseStore
    }
    const wrapperNode = (
        <Provider value={{store:disposer(formState),validateTrigger}}>{children}</Provider>
    );

    if (Component === false) {
        return wrapperNode;
    }

    return <Component
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onFinish(getSnapshot(formState, true))

        }}
        onReset={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            formState.reset()

        }}
    >
        {wrapperNode}
    </Component >
})

export default Form