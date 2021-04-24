import { mount } from "enzyme"
import { Field, Form } from "../src"

describe("RForm.Field",()=>{
    it("work with input",()=>{
        const wrapper=mount(<Form>
            <Field name="input">
                <input type="text" />
            </Field>
        </Form>)
        wrapper.find("input").simulate("change",{target:{value:"joe"}})
        expect(wrapper.find('input').props().value).toEqual("joe")
    })

    it("work with checkbox",()=>{
       
        const wrapper=mount(<Form>
            <Field name="checkbox" valuePropName="checked">
                <input type="checkbox" />
            </Field>
        </Form>)
        wrapper.find("input").simulate("change",{target:{checked:true}})
        
        expect(wrapper.find('input').props().checked).toEqual(true)
    })

    it("work with select",()=>{
        const wrapper=mount(<Form>
            <Field name="select">
                <select >
                    <option value="a">
                        A
                    </option>
                    <option value="b">
                        B
                    </option>
                </select>
            </Field>
        </Form>)
        wrapper.find("select").simulate("change",{target:{value:"a"}})
        expect(wrapper.find('select').props().value).toEqual("a")
    })
})