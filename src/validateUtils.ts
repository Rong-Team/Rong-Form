import { RuleObject, ValidateMessages, ValidateOptions } from "./interface";
import { defaultValidateMessages } from './defaultValidateMessage'
import { setValues } from './utils'
import RawAsyncValidator from 'async-validator'
import React from "react";
const AsyncValidator: any = RawAsyncValidator
function replaceMessage(template: string, kv: Record<string, string>): string {
    return template.replace(/\$\{\w+\}/g, (str: string) => {
        const key = str.slice(2, -1);
        return kv[key];
    });
}

// convert error messge to customized message     
function convertMessages(
    messages: ValidateMessages,
    name: string,
    rule: RuleObject,
    messageVariables?: Record<string, string>,
): ValidateMessages {
    const kv = {
        ...(rule as Record<string, string | number>),
        name,
        enum: (rule.enum || []).join(', '),
    };

    const replaceFunc = (template: string, additionalKV?: Record<string, string>) => () =>
        replaceMessage(template, { ...kv, ...additionalKV });

    /* eslint-disable no-param-reassign */
    function fillTemplate(source: ValidateMessages, target: ValidateMessages = {}) {
        Object.keys(source).forEach(ruleName => {
            const value = source[ruleName];
            if (typeof value === 'string') {
                target[ruleName] = replaceFunc(value, messageVariables);
            } else if (value && typeof value === 'object') {
                target[ruleName] = {};
                fillTemplate(value, target[ruleName]);
            } else {
                target[ruleName] = value;
            }
        });

        return target;
    }
    /* eslint-enable */

    return fillTemplate(setValues({}, defaultValidateMessages, messages)) as ValidateMessages;
}

// validate one rule
export async function validateRule(name: string, value: any, rule: RuleObject, options: ValidateOptions,
    messageVariables?: Record<string, string>,):Promise<string[]> {
    
    const cloneRule = { ...rule };
    console.log()
    // We should special handle array validate
    let subRuleField: RuleObject = null;
    if (cloneRule && cloneRule.type === 'array' && cloneRule.defaultField) {
        subRuleField = cloneRule.defaultField;
        delete cloneRule.defaultField;
    }

    const validator = new AsyncValidator({
        [name]: [Object.values(cloneRule)[0]],
    });
    const messages: ValidateMessages = convertMessages(
        options.validateMessages,
        name,
        cloneRule,
        messageVariables,
    );
    validator.messages(messages);
    let result = []
    return validator.validate({ [name]: value }, { ...options }).then(()=>{return result}).catch((errObj)=>{
        if (errObj.errors) {
            result = errObj.errors.map(({ message }, index) =>
                // Wrap ReactNode with `key`
                React.isValidElement(message)
                    ? React.cloneElement(message, { key: `error_${index}` })
                    : message,
            );
        } else {
            console.error(errObj);
            result = [(messages.default as () => string)()];
        }
        return result
    })
   
    // if (!result.length && subRuleField) {
    //     const subResults: string[][] = await Promise.all(
    //         (value as any[]).map((subValue: any, i: number) =>
    //             validateRule(`${name}.${i}`, subValue, subRuleField, options, messageVariables),
    //         ),
    //     );

    //     return subResults.reduce((prev, errors) => [...prev, ...errors], []);
    // }

    // return result;
}