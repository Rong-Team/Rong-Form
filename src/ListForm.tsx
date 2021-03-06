import { observer } from "mobx-react";
import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import { ListStoreContext, useMst } from "./context";
import { Meta, NamePath, ValidatorRule } from "./interface";
import { warning } from "./utils";

export interface ListOperations {
    add: (defaultValue?: any, index?: number) => void;
    remove: (index: number | number[]) => void;
    //move: (from: number, to: number) => void;
}

export interface IListProps {
    name: string;
    // rules?: ValidatorRule[];
    validateTrigger?: string | string[] | false;
    initialValue?: any[];
    children?: (
        fields: { name: string,  key: string, isListField: boolean }[],
        operations: ListOperations,

    ) => JSX.Element | React.ReactNode;
}

const List: React.FC<IListProps> = observer((props) => {
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
    const [keys, setkeys] = useState([])
    
    const keyManager = keyRef.current;

    const initData = () => {

        if (initialValue) {
            if (!Array.isArray(initialValue)) {
                return warning(false, "initialValue should be array")
            }
            initialValue.map((item, index) => {
                let key = keyManager.keys[index];
                if (key === undefined) {
                    keyManager.keys[index] = keyManager.id;
                    key = keyManager.keys[index];
                    keyManager.id += 1;
                }

            })
            
            store.registerFromForm(name, initialValue)
        } else {
            keyManager.keys[0]=keyManager.id
            keyManager.id+=1
            store.registerInit(name)
           
        }
        setkeys([2])
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
                store.addListValue(name, defaultValue, keyManager.id)
            } else if (index < length) {
                keyManager.keys = [
                    ...keyManager.keys.slice(0, index),
                    keyManager.id,
                    ...keyManager.keys.slice(index),
                ];
                store.addListValue(name, defaultValue, keyManager.id)

            }
            keyManager.id += 1;
            setkeys([2])
        },
        remove: (index: number) => {
            const removedIndex = keyManager.keys[index]
            if (removedIndex === undefined) {
                return warning(false, "Cannot remove undefined element")
            }

            keyManager.keys = keyManager.keys.filter((i, keyIndex) => keyIndex !== index);
            store.removeListValue(name, removedIndex)
            setkeys([2])
        }
    }
    const mapData = useCallback(
        () => {
            // let dataSet = store.getListData(name)
    
            // if (dataSet) {
    
            //     return Object.values(dataSet.toJSON()).map((item, index) => {
    
    
            //         let key = keyManager.keys[index];
            //         if (key === undefined) {
            //             keyManager.keys[index] = keyManager.id;
            //             key = keyManager.keys[index];
            //             keyManager.id += 1;
            //         }
    
    
            //         const errors = []
            //         Object.values(item).map(each => {
    
            //             errors.push(each.error)
            //         })
            //         return {
            //             errors, name: key, isListField: true, key
            //         }
            //     })
            // }
          
            return keyManager.keys.map((item, index) => {
                return {  name: item, isListField: true, key: item }
            })
            //return []
        },
        [keyManager.id],
    )
    return (<ListStoreContext.Provider value={{
        name, register: (index: number) => {
            let key = keyManager.keys[index];
            if (key === undefined) {
                keyManager.keys[index] = keyManager.id;
                key = keyManager.keys[index];
                keyManager.id += 1;
                setkeys([2]) // force update
            }
        }, id: keyManager.id
    }}>{
            children(mapData(), Operations)
        }</ListStoreContext.Provider>)

})

export default List