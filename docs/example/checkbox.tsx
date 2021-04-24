import { Field, Form } from "rong-form"

interface CheckboxInterface {
    value?: any
    onChange?: (value: any) => void
}

const Radio: React.FC<CheckboxInterface> = ({ value, onChange }) => {
    const triggerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange && onChange(e.target.value)
    }
    return <span>
        <div>
            <label>A </label>
            <input type="radio" name="radio" value="a" checked={value === 'a'} onChange={triggerChange} />
        </div>
        <div>
            <label>B </label>
            <input type="radio" name="radio" value="b" checked={value === 'b'} onChange={triggerChange} />
        </div>
    </span>
}


export default () => {

    return (
        <Form onValuesChange={(e) => console.log(e)}>
            <Field name="radio">
                <Radio />
            </Field>
            <br />
            <br />
            <Field name="select">
                <select>
                    <option value="a">A</option>
                    <option value="b">B</option>
                </select>
            </Field>
            <div>
                <span>checkbox</span>
                <Field name="checkbox" valuePropName="checked">
                    <input type="checkbox" />
                </Field>
            </div>
        </Form>
    )
}