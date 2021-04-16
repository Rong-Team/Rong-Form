import { getEnv, types } from "mobx-state-tree"
import { defaultValidateMessages } from "./defaultValidateMessage"
import { FieldStore } from "./Field"
import { Rule, ValidateMessages } from "./interface"
import { validateRule } from "./validateUtils"

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
    changeField(name: string, other: any) {
        const cur = self.fields.get(name)
        self.fields.set(name, { ...cur, ...other })
    },
    reset() {
        self.fields.forEach(item => item.reset())
    },
    validateFields(field: string, rules: Rule) {
        const cur = self.fields.get(field)
        if (cur) {
            self.fields.set(field, { ...cur, validating: true })
            const newVali = getEnv(self).validateMessages
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
    }

})).views((self) => ({
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
}))