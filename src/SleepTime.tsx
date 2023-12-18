import './SleepTime.css';
import React from 'react';
import { t } from 'i18next'

type SleepTimeProps = {
    score: number;
    time: string;
    power: number;
}

class SleepTime extends React.Component<SleepTimeProps> {
    render() {
        const s = this.props.score;
        const img = `radial-gradient(#ffffff 50%, transparent 51%), conic-gradient(#489eff 0% ${s}%, #dddddd ${s+1}% 100%)`;
        return <div className="sleep_time">
            <div className="pie" style={{backgroundImage: img}}>{this.props.score}</div>
            <div className="time">
                {this.props.time}
                <div className="time_power">{t("num", {n: this.props.power})}</div>
            </div>
        </div>
    }
}
export default SleepTime;