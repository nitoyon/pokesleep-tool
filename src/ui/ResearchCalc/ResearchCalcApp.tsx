import { useCallback, useState } from 'react';
import { InputArea } from './InputArea';
import NotFixedWarning from './NotFixedWarning';
import GeneralPanel from './GeneralPanel';
import { InputAreaData, loadConfig, saveConfig } from './ResearchCalcAppConfig';

const defaultData = loadConfig();

export default function ResearchCalcApp() {
    const [data, setData] = useState(defaultData);

    const updateState = useCallback((value: Partial<InputAreaData>) => {
        const newData = {...data, ...value};
        setData(newData);
        saveConfig(newData);
    }, [data]);

    const onChange = useCallback((value: Partial<InputAreaData>) => {
        updateState(value);
    }, [updateState]);

    return (
        <div style={{margin: '0 .5rem'}}>
            <InputArea data={data} onChange={onChange}/>
            <NotFixedWarning fieldIndex={data.fieldIndex}/>
            <GeneralPanel data={data}/>
        </div>
    );
}
