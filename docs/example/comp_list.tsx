import React from "react"
import { Form, Field, ListForm } from 'rong-form'
export default () => (
    <Form>
        <ListForm name="a">
            {
                (fields, { add, remove }) => {
                    return (
                        <>
                            {
                                fields.map((field, index) => {
                                    return <React.Fragment key={field.key}>
                                        <Field
                                        {...field}
                                        key={field.key+"lastname"}
                                        name={[field.name,"lastname"]}
                                        >
                                            <input />
                                        </Field>
                                        &nbsp;
                                        <Field
                                        {...field}
                                        key={field.key+"firstname"}
                                        name={[field.name,"firstname"]}
                                        >
                                            <input />
                                        </Field>
                                        &nbsp;
                                        <button onClick={()=>remove(index)}>remove</button>
                                    </React.Fragment>
                                })
                            }
                            <br/>
                            <button onClick={()=>add()}>add</button>
                        </>
                    )
                }
            }
        </ListForm>
    </Form>
)