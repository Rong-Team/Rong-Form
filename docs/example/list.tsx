import React from 'react'
import { Field, Form, ListForm } from 'rong-form'


export default () => {
    return (
        <Form >
            <ListForm name="a">
                {
                    (fields, { add, remove }) => {
                        return <>{
                            fields.map((field, index) => {
                             
                                return <React.Fragment key={field.key}>
                                    <Field {...field} >
                                        <input />
                                    </Field>
                                    <span onClick={() => remove(index)}>remove</span>
                                    <br />
                                    <br />
                                </React.Fragment>
                            })

                        }
                            <button onClick={() => add()}> add</button>
                        </>
                    }
                }
            </ListForm>
        </Form>
    )
}