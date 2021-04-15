import { types } from "mobx-state-tree"
import { FieldStore } from "./Field"

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
    changeField(name:string,other:any){
        const cur=self.fields.get(name)
        self.fields.set(name,{...cur,...other})
    },
    reset() {
        self.fields.forEach(item => item.reset())
    }

})).views((self) => ({
    getFieldValue(name: string) {
        return self.fields.get(name)?.value
    },
    getFieldByName(name:string){
        return self.fields.get(name)
    },
    getFieldKeys(key,value){
        let cur={}
         self.fields.forEach((item)=>{
            if(item.name===key){
                cur[item.name]={name:item.name,value:value}
            }else{
                cur[item.name]={name:item.name,value:item.value}
            }
            
        })
        return cur
    },
    hasField(name: string) {
        return self.fields.has(name)
    },
}))