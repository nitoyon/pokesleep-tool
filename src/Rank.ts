
type RankType = "basic" | "great" | "ultra" | "master";

class Rank {
    /** rank index (=rankTypeIndex * 5 + rankNumber - 1) */
    index: number;

    /** rank type */
    type: RankType;

    /** rank number in the rank type */
    rankNumber: number;

    /** strength of this rank */
    thisStrength: number;

    /** strength of next rank */
    nextStrength: number;

    /**
     * Initialize rank for the strength.
     *
     * @param strength  current strength
     * @param ranks     ranks
     * @returns current rank
     */
    constructor(strength: number, ranks: number[]) {
        let rankIndex = 0;
        for (let i = 0; i < ranks.length; i++) {
            if (strength < ranks[i]) {
                break;
            }
            rankIndex = i;
        }

        this.index = rankIndex;
        this.thisStrength = ranks[rankIndex];
        this.nextStrength = rankIndex + 1 < ranks.length ?
            ranks[rankIndex + 1] : NaN;
        this.type = Rank.rankIndexToType(rankIndex);
        this.rankNumber = Rank.rankIndexToRankNumber(rankIndex);
    }

    public static rankIndexToType(rankIndex:number): RankType {
        return (rankIndex < 5 ? "basic" :
            rankIndex < 10 ? "great" : rankIndex < 15 ? "ultra" : "master");
    }

    public static rankIndexToRankNumber(rankIndex:number): number {
        return rankIndex < 15 ? rankIndex % 5 + 1 : rankIndex - 14;
    }
}


export { Rank } ;
