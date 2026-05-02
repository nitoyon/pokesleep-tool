/** Member item action */
export type MemberAction =
	/** Add from box or IV */
	| "add"
	/** Edit IV */
	| "editiv"
	/** Open box and change pokemon */
	| "openbox"
	/** Clear current pokemon */
	| "clear";

/** Event when edit or clear member item */
export type MemberEvent = {
	/** Current member index */
	index: number;
	/** Action */
	action: MemberAction;
};
