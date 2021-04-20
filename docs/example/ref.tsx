import { useRef } from "react"
import Field from "../../src/Field"
import { Form } from "rong-form"


export default () => {
    const form = useRef(null)
    return (
        <>
            <Form ref={form}>
                <Field name="test">
                    <input />
                </Field>
            </Form>
           
           <button onClick={()=>form.current.fillValues({test:"aaaa"})}>Fill Value</button>
            
        </>
    )
}