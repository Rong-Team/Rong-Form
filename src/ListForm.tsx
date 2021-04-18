import { observer } from "mobx-react";
import React from "react";
import { useEffect } from "react";
import { ListStoreContext, useMst } from "./context";
import { Meta, NamePath, ValidatorRule } from "./interface";
import { warning } from "./utils";

export interface ListOperations {
    add: (defaultValue?: any, index?: number) => void;
    remove: (index: number | number[]) => void;
    //move: (from: number, to: number) => void;
}

export interface ListProps {
    name: string;
    // rules?: ValidatorRule[];
    validateTrigger?: string | string[] | false;
    initialValue?: any[];
    children?: (
        fields: any[],
        operations: ListOperations,

    ) => JSX.Element | React.ReactNode;
}

const List: React.FC<ListProps> = observer((props) => {
    const {
        children,
        validateTrigger,
        initialValue,
        name
    } = props
    if (typeof children !== 'function') {
        warning(false, 'Form.List only accepts function as children.');
        return null;
    }

    const { store } = useMst()
    const keyRef = React.useRef({
        keys: [],
        id: 0,
    });
    const keyManager = keyRef.current;

    const initData = () => {

        if (initialValue) {
            if (!Array.isArray(initialValue)) {
                return warning(false, "initialValue should be array")
            }
            store.registerFromForm(name, initialValue)
        } else {
            store.registerInit(name)
        }
    }
    useEffect(() => {
        initData()
        return () => {

        }
    }, [])


    const Operations: ListOperations = {
        add: (defaultValue: any, index?: number) => {
            const length = store.listLength(name)
            if (index < 0) {
                warning(false, "index cannot be negative")
                return
            } else if (index >= length || !index) {
                keyManager.keys = [...keyManager.keys, keyManager.id];
                store.addListValue(name, defaultValue)
            } else if (index < length) {
                keyManager.keys = [
                    ...keyManager.keys.slice(0, index),
                    keyManager.id,
                    ...keyManager.keys.slice(index),
                ];
                store.addListValue(name, defaultValue, index)

            }
            keyManager.id += 1;
        },
        remove: (index: number) => {
            const length = store.listLength(name)
            if (index >= length) {
                return warning(false, "Cannot delete outscoped value")
            }
            keyManager.keys = keyManager.keys.filter((_, keysIndex) => keysIndex === index);
            store.removeListValue(name, index)
        }
    }
    const mapData = () => {
        let dataSet = store.getListData(name)

        if (dataSet) {
            return dataSet.map((item, index) => {

                let key = keyManager.keys[index];
                if (key === undefined) {
                    keyManager.keys[index] = keyManager.id;
                    key = keyManager.keys[index];
                    keyManager.id += 1;
                }
                let errors = Object.keys(item.toJSON()).map(each => {
                    return item.get(each)?.error
                })
                return {
                    errors, name: key, isListField: true,
                }
            })
        }
        return []
    }
    return (<ListStoreContext.Provider value={{ name }}>{
        children(mapData(), Operations)
    }</ListStoreContext.Provider>)

})

export default List