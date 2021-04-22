import {Form,Field} from '../../src'
export default ()=>{
    return (
        <Form>
            <Field name="name" rules={{required:true,}}>
                {
                    (control,meta)=>{
                     console.log(meta)
                    return <>{
                        <input {...control}/>
                    }
                
                    {
                        meta.errors?.length>0?meta.errors.map(item=>item):""
                    }
                    </>
                    }
                }
            </Field>
        </Form>
    )
}