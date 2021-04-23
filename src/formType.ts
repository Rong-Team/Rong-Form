import { getEnv, types, flow } from "mobx-state-tree"

import { defaultValidateMessages } from "./defaultValidateMessage"
import { FieldStore } from "./Field"
import { FieldError, IFieldStore, Rule, ValidateMessages } from "./interface"
import { validateRule } from "./validateUtils"

export const ListFormStore = types.model({
    name: types.identifier,
    data: types.optional(types.map(types.map(FieldStore)), {}), // {1: {name1:FieldStore,name2:FieldStore}}
    type: types.optional(types.array(types.string), []),
    dependencies: types.optional(types.array(types.string), [])
}).actions((self) => ({
    reset() {
        self.data.clear()
    }
}))


export const FormStore = types.model("Form", {
    fields: types.optional(types.map(FieldStore), {}),
    listFields: types.optional(types.map(ListFormStore), {})
    // list1: [ {"first":FieldStore,"second":FieldStore } ]
}).actions((self) => ({

    initForm(data: { [name: string]: any }) {
        Object.keys(data).map(item => {
            const dataSet = data[item]
            if (Array.isArray(dataSet)) {

            } else {

            }
        })
    },

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
        self.listFields.forEach(item => item.reset())
    },

    registerDependencies(name: string, dependencies: string[]) {
        dependencies?.map(item => {
            const cur = self.fields.get(item)
            if (cur) {
                if (!cur?.dependencies) {

                    self.fields.set(item, { ...cur, dependencies: [name] as any })
                } else {
                    self.fields.set(item, { ...cur, dependencies: [...cur.dependencies, name] as any })
                }
            }
        })
    },
    changeDependencies(name: string, value: string) {
       
        const dependencies = self.fields.get(name)?.dependencies
        dependencies?.map(item => {
            const source = self.fields.get(item)
            const dependsOn = { ...source?.dependsOn, [name]: value }
            self.fields.set(item, { ...source, dependsOn })
            
        })
    },


    validateFields: flow(function* (field: string, rules: Rule, newVali?: ValidateMessages) {
        const cur = self.fields.get(field)
        if (cur) {


            if (!rules) {
                return
            }
            self.fields.set(field, { ...cur, validating: true })
            const promise = yield validateRule(field, cur.value, rules, { validateMessages: { ...defaultValidateMessages, ...newVali }, })
           
            self.fields.set(field, { ...cur, validating: false, error: promise })
        }
    }),

    getFieldError(name: string) {
        const data = self.fields.get(name)
        if (!data) {
            return undefined
        }
        return data.error.toJSON()
    },
    getFieldsError(): FieldError[] {
        return Object.keys(self.fields).map(item => {
            return { errors: self.fields.get(item).error.toJSON(), name: item }
        })
    },
    isFieldValidating(name: string) {
        return self.fields.get(name)?.validating || false
    },
    // register on form 
    registerFromForm(name: string, value?: any[]) {
        let data: {}
        let type = ['1'] // default set one item in list's index
        value.map((item, index) => {
            if (typeof item !== 'object') {
                data[index] = { [index]: { name: index, validating: false, value: item, error: null } }
            } else {
                let cur: { [name: string]: IFieldStore }
                Object.keys(item).map(each => {
                    cur[each] = { name: each, value: each[each], error: null }
                })
                data[index] = cur
            }
        })
        if (value.length > 0) {
            if (typeof value[0] === 'object') {
                type = Object.keys(value[0])   // each index in list might have multiple item
            }
        }
        self.listFields.set(name, { data, name, type })
    },

    registerFromField(name: string[]) {
        let list = self.listFields.get(name[0])
        // single field 
        if (name.length === 1 && list.type.length === 0) {
            self.listFields.set(name[0], { ...list, type: ["1"] as any })
            // multiple
        } else if (name.length === 2) {
            let { type } = list
            let newtype: any = [...type, name[1]]
            self.listFields.set(name[0], { ...list, type: newtype })
        }
    },
    // when no initialValue found from list form, must init the start set of value
    registerInit(name: string) {
        let list = self.listFields.get(name)
        self.listFields.set(name, { ...list, name, type: ["1"], data: { "0": { "0": { name: "0", value: null } } } })

    },



    // change the value
    changeListValue(name: string[], value: any, index: number) {

        if (name.length === 2) {
            const cur = self.listFields.get(name[0]) // get parent list
            let dataSet = cur.data

            let beforeValue = dataSet.get(String(index))

            let replaced = beforeValue.get(name[1])
            beforeValue.set(name[1], { ...replaced, ...value })
            dataSet.set(String(index), beforeValue)

            self.listFields.set(name[0], { ...cur, data: dataSet })

        } else if (name.length === 1) {
            const cur = self.listFields.get(name[0]) // get parent list
            let dataSet = cur.data

            let before = dataSet.get(String(index)) // {init:FieldStore}

            let beforeVal = Object.values(before.toJSON())[0]
            let beforeKey = Object.keys(before.toJSON())[0]
            let newVal = { ...beforeVal, ...value }

            dataSet.set(String(index), { [beforeKey]: newVal })
            cur.data = dataSet
            self.listFields.set(name[0], cur)

        }
    },


    fillValues(name: string, values: any[]) {
        const list = self.listFields.get(name)?.data
        Object.keys(list).map((item, index) => {
            let cur = list.get(item)
            let content = Object.keys(cur)
            if (content.length === 1) {
                cur.set(content[0], { ...cur.get(content[0]), value: values[index] })
            } else {
                content.map(each => {
                    cur.set(each, { ...cur.get(each), value: values[index][each] })
                })
            }
        })
    },

    // add value to list
    addListValue(name: string, values?: any, index?: number) {
        const list = self.listFields.get(name)

        let dataSet = list.data
        let newValue
        let ind = String(index || dataSet.size)
        if (list.type.length === 1) {

            newValue = { [ind]: { name: ind, value: values, error: null } }

        } else if (list.type.length > 1) {
            let a = {}
            if (values) {
                list.type.map(item => {
                    a[item] = { name: item, value: values[item] || null, error: null }
                })
            } else {
                list.type.map(item => {
                    a[item] = { name: item, value: null, error: null }
                })
            }
            newValue = a
        }
        dataSet.set(ind, newValue)
        self.listFields.set(name, { ...list, data: dataSet })
    },

    // remove value from list
    removeListValue(name: string, index: number) {
        const cur = self.listFields.get(name)
        let dataSet = cur.data
        dataSet.delete(String(index))

        self.listFields.set(name, { ...cur, data: dataSet })
    }



})).views((self) => ({
    // normal fields
    getFieldValue(name: string) {
        return self.fields.get(name)?.value
    },
    getFieldByName(name: string) {
        return self.fields.get(name)
    },
    getFieldKeys(key?: any, value?: any) {
        let cur = {}
        self.fields.forEach((item) => {
            if (item.name === key) {
                cur[item.name] = value
            } else {
                cur[item.name] = item.value
            }

        })
        return cur
    },
    hasField(name: string) {
        return self.fields.has(name)
    },

    // list fields


    hasList(name: string) {
        return self.listFields.has(name)
    },

    listLength(name: string) {
        return self.listFields.get(name).data.size
    },

    getDataType(name: string) {
        return self.listFields.get(name)?.type
    },

    getListData(name: string) {
        return self.listFields.get(name)?.data
    },
    getOneSet(name: string, index: number) {
        return self.listFields.get(name)?.data.get(String(index))?.toJSON()
    },

    getListValues(name?: string[], index?: number, value?: any) {
        if (name && index && value) {
            const dataSet = self.listFields.get(name[0]).data.toJSON()
            let c = []
            if (dataSet) { // dataset={0:{name:FieldStore,pwd:FieldStore}}
                Object.keys(dataSet).map(item => {
                    let a = {}
                    Object.values(dataSet[item]).map((each: any) => {
                        if (Object.keys(dataSet[item]).length === 1) {
                            if (item == String(index)) {
                                c.push(each?.value)
                            } else {
                                c.push(each?.value)
                            }
                        } else {
                            if (item == String(index)) {
                                a[each.name] = value
                            } else {
                                a[each.name] = each.value
                            }
                        }
                    })
                    if (Object.keys(dataSet[item]).length > 1) {
                        c.push(a)
                    }
                })
                return { [name[0]]: c }
            }
        } else {
            let res = {}
            self.listFields.forEach(item => {
                const cur = item.data.toJSON()
                const curList = []
                Object.values(cur).map(value => {
                    let a = {}
                    Object.values(value).map(each => {
                        if (Object.keys(value).length === 1) {
                            curList.push(each.value)
                        } else {
                            a[each.name] = each.value
                        }
                    })
                    if (Object.keys(value).length > 1) {
                        curList.push(a)
                    }
                })
                res[item.name] = curList
            })
            return res
        }

    }


}))