import { getEnv, types } from "mobx-state-tree"
import { Instance, string } from "mobx-state-tree/dist/internal"
import { defaultValidateMessages } from "./defaultValidateMessage"
import { FieldStore } from "./Field"
import { IFieldStore, Rule, ValidateMessages } from "./interface"
import { validateRule } from "./validateUtils"

export const ListFormStore = types.model({
    name: types.identifier,
    data: types.optional(types.array(types.map(FieldStore)), []), // [[{name,a}]]
    type: types.optional(types.array(types.string), [])
})


export const FormStore = types.model("Form", {
    fields: types.optional(types.map(FieldStore), {}),
    listFields: types.optional(types.map(ListFormStore), {})
    // list1: [ {"first":FieldStore,"second":FieldStore } ]
}).actions((self) => ({

    // normal fields
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
    changeField(name: string, other: any) {
        const cur = self.fields.get(name)
        self.fields.set(name, { ...cur, ...other })
    },
    reset() {
        self.fields.forEach(item => item.reset())
    },
    validateFields(field: string, rules: Rule, newVali?: ValidateMessages) {
        const cur = self.fields.get(field)
        if (cur) {
            self.fields.set(field, { ...cur, validating: true })

            if (!rules) {
                return
            }
            const promise = validateRule(field, cur.value, rules, { validateMessages: { ...defaultValidateMessages, ...newVali }, })
            promise.then(() => {
                self.fields.set(field, { ...cur, validating: false, error: null })
            }).catch(e => {
                self.fields.set(field, { ...cur, validating: false, error: e })
            })
        }
    },

    // register on form 
    registerIntoList(name: string, value?: any[]) {
        let data: any[]
        let type=['1'] // default set one item in list's index
        value.map((item, index) => {
            if (typeof item !== 'object') {
                data.push({ [item + index]: { name: name + index, validating: false, value: item, error: null } })
            } else {
                let cur: { [name: string]: IFieldStore }
                Object.keys(item).map(each => {
                    cur[each] = { name: each, value: each[each], error: null }
                })
                data.push(cur)
            }
        })
        if(value.length>0){
            if(typeof value[0]==='object'){
                type=Object.keys(value[0])   // each index in list might have multiple item
            }
        }
        self.listFields.set(name, { data, name ,type})
    },

    

    // change the value
    changeValue(name: string[], value: any, index: number) {

        if (name.length === 2) {
            const cur = self.listFields.get(name[0]) // get parent list
            let dataSet = cur.data
            if (index >= 0 && index <= dataSet.length) {
                let beforeValue = dataSet[index]

                let replaced = beforeValue.get(name[1])
                beforeValue.set(name[1], { ...replaced, ...value })

                const newList: any = [...dataSet.slice(0, index), beforeValue, ...dataSet.slice(index + 1)]
                self.listFields.set(name[0], { ...cur, data: newList })
            } else {
                let newValue = { [name[1]]: { name: name[1], ...value } }
                const newList = [...cur.data, newValue]
                self.listFields.set(name[0], { ...cur, data: newList })
            }
        } else if (name.length === 1) {
            const cur = self.listFields.get(name[0]) // get parent list
            let dataSet = cur.data
            if (index >= 0 && index <= dataSet.length) {
                let beforeVal = dataSet[index]
                let newVal = { ...beforeVal, ...value }
                const newList: any = [...dataSet.slice(0, index), newVal, ...dataSet.slice(index + 1)]
                self.listFields.set(name[0], newList)
            } 
        }
    },

    addValue(name:string,values?:any){
        const list=self.listFields.get(name)
        if (list.type.length===1){
            let cname = Date.now()
            let newValue = { [cname]: { name: cname, ...value } }
            const newList = [...cur.data, newValue]
            self.listFields.set(name[0], { ...cur, data: newList })
        }
    },

    removeSet(name: string, index: number) {
        const cur = self.listFields.get(name)
        let dataSet = cur.data
        const newList: any = [...dataSet.slice(0, index), ...dataSet.slice(index + 1)]
        self.listFields.set(name, { ...cur, data: newList })
    }



})).views((self) => ({
    // normal fields
    getFieldValue(name: string) {
        return self.fields.get(name)?.value
    },
    getFieldByName(name: string) {
        return self.fields.get(name)
    },
    getFieldKeys(key, value) {
        let cur = {}
        self.fields.forEach((item) => {
            if (item.name === key) {
                cur[item.name] = { name: item.name, value: value }
            } else {
                cur[item.name] = { name: item.name, value: item.value }
            }

        })
        return cur
    },
    hasField(name: string) {
        return self.fields.has(name)
    },

    // list fields
    getOneSet(name: string, index: number) {
        return self.fields.get(name)[index]
    },

    hasList(name: string) {
        return self.fields.has(name)
    },

    listLength(name: string) {
        return
    }


}))