import { Meta, NamePath, ValidatorRule } from "./interface";
import { warning } from "./utils";

export interface ListOperations {
    add: (defaultValue?: any, index?: number) => void;
    remove: (index: number | number[]) => void;
    move: (from: number, to: number) => void;
}

export interface ListProps {
    name: NamePath;
    rules?: ValidatorRule[];
    validateTrigger?: string | string[] | false;
    initialValue?: any[];
    children?: (
        fields: any[],
        operations: ListOperations,
        meta: Meta,
    ) => JSX.Element | React.ReactNode;
}

const List: React.FC<ListProps> = ({
    children,
    rules,validateTrigger,
    initialValue
}) => {
    if (typeof children !== 'function') {
        warning(false, 'Form.List only accepts function as children.');
        return null;
    }

    let datatype

    const initData=()=>{
        if(initialValue)
    }

    
    const Operations:ListOperations={
        add:(defaultValue:any,index?:number)=>{
            
        }
    }
}