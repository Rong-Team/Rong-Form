
import React, { useState } from 'react'
import { Field, Form } from 'rong-form'
export default () => {
    const [state, setstate] = useState<any>()
    return (
        <>
            {JSON.stringify(state)}

            <Form onValuesChange={(val,second) => setstate({val,second})}>
                <Field name="username" >
                    <input type="text" />
                </Field>
                <Field name="password">
                    <input type="text" />
                </Field>
                <button type="submit">submit</button>

            </Form>

        </>
    )
}