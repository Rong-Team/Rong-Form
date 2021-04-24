import { Field, Form } from "../src"
import { mount } from "enzyme"
import React from "react"
import { IFormInstance } from "@/Form"

describe('RForm.Form', () => {
    it("show initalValues", () => {
        const wrapper = mount(<Form initialValues= {{ name: "joe" }}>
            <Field name="name">
                <input />
            </Field>
        </Form>)
      
        expect(wrapper.find("input").props().value).toEqual('joe')
    })

    it("initalValues in Form is prior than Field", () => {
        const wrapper = mount(<Form initialValues={{ name: 'joe' }}>
            <Field name="name" initialValue="adam">
                <input />
            </Field>
        </Form>)

        expect(wrapper.find('input').props().value).toEqual('joe')
    })
    
    it("should be called by ref",()=>{
        const ref=React.createRef<IFormInstance>()
        const wrapper=mount(<Form ref={ref}>
            <Field name="name">
                <input/>
            </Field>
        </Form>)
        ref.current.fillValue('name','joe')
        wrapper.update()
        expect(wrapper.find('input').props().value).toEqual('joe')
    })
})
