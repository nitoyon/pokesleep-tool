import React from 'react';
import { styled } from '@mui/system';
import { RankType } from '../../util/Rank';

interface RankBallProps {
    /** Rank type (basic, great, ultra, master) */
    type: RankType;
    /** Rank number to display */
    number: number;
}

const RankBall = React.memo(({ type, number }: RankBallProps) => {
    return (
        <StyledRankBall>
            <span className={"rank_ball rank_ball_" + type}>◓</span>
            <span className="rank_number">{number}</span>
        </StyledRankBall>
    );
});

const StyledRankBall = styled('span')({
    '& .rank_ball_basic': { color: '#ff0000' },
    '& .rank_ball_great': { color: '#0000ff' },
    '& .rank_ball_ultra': { color: '#000000' },
    '& .rank_ball_master': { color: '#cc00cc' },

    '& .rank_number': {
        paddingLeft: '.2em',
    },
});

export default RankBall;
