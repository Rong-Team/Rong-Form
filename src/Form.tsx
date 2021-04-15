import { getSnapshot, Instance, TypeOfValue, types } from "mobx-state-tree";
import React, { useImperativeHandle } from "react";
import { Provider } from "./context";

import { FieldStore } from "./Field";
import { Callbacks } from "./interface";


export const FormStore = types.model("Form", {
    fields: types.optional(types.map(FieldStore), {})
}).actions((self) => ({
    registerField(data) {
        self.fields.put(data)
    },

    dropField(name: string) {
        self.fields.delete(name)
    },
    setField(name: string, value: any) {
        const cur = self.fields.get(name)
        self.fields.set(name, { ...cur, value })
    },
    reset(){
        self.fields.forEach(item=>item.reset())
    }

})).views((self) => ({
    getFieldValue(name: string) {
        return self.fields.get(name)?.value
    },
    hasField(name: string) {
        return self.fields.has(name)
    },
}))

export interface IFormProps {
    initialValues?: { [name: string]: any },
    children?: React.ReactNode
    component: false | string | React.FC<any>,
    name?: string
    onValuesChange: Callbacks<any>['onValuesChange']
    onFieldsChange: Callbacks<any>['onFieldsChange']
    onFinish: Callbacks<any>['onFinish']
}
const formState=FormStore.create({ fields: {} },)
const Form: React.ForwardRefRenderFunction<any, IFormProps> = ({ children, component: Component = "form" as any,onFinish }, ref) => {

   
    // useImperativeHandle(
    //     ref,
    //     () => ({
    //         getFieldValue(name:string){
    //             return formState.getFieldValue(name)
    //         },
           
    //     }),
    //     [],
    // )

    const wrapperNode = (
        <Provider value={formState}>{children}</Provider>
    );

    if (Component === false) {
        return wrapperNode;
    }

    return <Component
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onFinish(getSnapshot(formState))
            
        }}
        onReset={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            formState.reset()
            
        }}
    >
        {wrapperNode}
    </Component >
}

export default Form