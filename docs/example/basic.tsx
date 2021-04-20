
import React, { useState } from 'react'
import { Field, Form } from 'rong-form'
export default () => {
    const [state, setstate] = useState<any>()
    return (
        <>
            {JSON.stringify(state)}

            <Form  onValuesChange={(val) => { console.log(val) }} onFinish={(e)=>{setstate(e)}}>
                <Field name="username" rules={[{required:true,type:'string'}]} >
                    <input type="text" />
                </Field>
                <br/>
                <br/>
                <Field name="password">
                    <input type="text" />
                </Field>
                <button type="submit">submit</button>

            </Form>

        </>
    )
}