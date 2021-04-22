import {Form,Field} from 'rong-form'
export default ()=>{
    let x=0
    return (
        <Form>
            Field1
            <Field name="field1" dependencies={["field2"]}>
                {
                    (control,meta,dependeices)=>{
                       
                        if(dependeices["field2"]?.value==="OK"){
                            return "OK"
                        }
                        return <input {...control} />
                    }
                }
            </Field>
            <br/>
            <br/>
            Field2
            <Field name="field2">
                <input/>
            </Field>
           
        </Form>
    )
}