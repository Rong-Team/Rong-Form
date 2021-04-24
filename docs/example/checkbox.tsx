import { Field, Form } from "rong-form"

interface CheckboxInterface {
    value?: boolean
    onChange?: (value: boolean) => void
}

const Checkbox: React.FC<CheckboxInterface> = ({ value, onChange }) => {
    const triggerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange && onChange(e.target.checked)
    }
    return <span>
        <label>checkbox</label>
        <input type="checkbox" checked={value} onChange={triggerChange} />
    </span>
}

export default () => {

    return (
        <Form onValuesChange={(e) => console.log(e)}>
            <Field name="checkbox">
                <Checkbox />
            </Field>
        </Form>
    )
}