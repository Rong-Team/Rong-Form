import { useEffect } from "react";
import { useMst } from "./context";
import { Meta, NamePath, ValidatorRule } from "./interface";
import { warning } from "./utils";

export interface ListOperations {
    add: (defaultValue?: any, index?: number) => void;
    remove: (index: number | number[]) => void;
    //move: (from: number, to: number) => void;
}

export interface ListProps {
    name: string;
    rules?: ValidatorRule[];
    validateTrigger?: string | string[] | false;
    initialValue?: any[];
    children?: (
        fields: any[],
        operations: ListOperations,
        errors: string[],
    ) => JSX.Element | React.ReactNode;
}

const List: React.FC<ListProps> = ({
    children,
    rules, validateTrigger,
    initialValue,
    name
}) => {
    if (typeof children !== 'function') {
        warning(false, 'Form.List only accepts function as children.');
        return null;
    }

    const { store } = useMst()

    const initData = () => {
        if (!Array.isArray(initialValue)) {
            return warning(false, "initialValue should be array")
        }
        if (initialValue) {
            store.registerFromForm(name, initialValue)
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
                store.addListValue(name, defaultValue)
            } else if (index < length) {
                store.addListValue(name, defaultValue, index)

            }
        },
        remove: (index: number) => {
            const length = store.listLength(name)
            if (index >= length) {
                return warning(false, "Cannot delete outscoped value")
            }
            store.removeListValue(name, index)
        }
    }

    return children([],Operations,{})

}