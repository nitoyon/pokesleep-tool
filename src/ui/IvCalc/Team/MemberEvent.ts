/** Member item action */
export type MemberAction = "add" | "edit" | "clear";

/** Event when edit or clear member item */
export type MemberEvent = {
	/** Current member index */
	index: number;
	/** Action */
	action: MemberAction;
};
