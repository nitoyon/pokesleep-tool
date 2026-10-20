import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import { clamp } from "../../../util/NumberUtil";
import PokemonIv from "../../../util/PokemonIv";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import SwipeContainer, {
	defaultIgnoreDragSelector,
} from "../../common/SwipeContainer";
import type { BoxDrawerPosition, IvAction } from "../IvState";
import { lowerTabHeaderId } from "../LowerTabHeader";
import BoxItemEditor from "./BoxItemEditor";

/** Height of the drag handle (in pixels) */
const handleHeight = 24;

/** Minimum height of the drawer in the half mode (in pixels) */
const minHalfHeight = 240;

/** Elements on which the horizontal swipe is not started */
const ignoreSwipeSelector = `${defaultIgnoreDragSelector}, input`;

/**
 * Clip the track without making the swipe container a scroll container,
 * so that the sticky summary in each item sticks to the drawer content.
 */
const swipeContainerStyle: React.CSSProperties = { overflow: "clip" };

/** Ignore changes made in the editors of the previous/next items */
const ignoreChange = () => {};

/**
 * Drawer to add or edit a pokemon in the box.
 */
const BoxItemDialog = React.memo((props: BoxItemDialogProps) => {
	const { open, position, parameter, dispatch, onClose } = props;
	const isEdit = props.mode === "edit";
	const onItemChange = isEdit ? props.onItemChange : undefined;

	const { t } = useTranslation();
	const [newItem] = React.useState(
		() =>
			new PokemonBoxItem(
				new PokemonIv({ pokemonName: "Venusaur" }),
				undefined,
				undefined,
				-1,
			),
	);
	/** Edited value of the current item (null when not changed) */
	const [currentItem, setCurrentItem] = React.useState<PokemonBoxItem | null>(
		null,
	);

	// In the add mode, the new item is the only item
	const editItems = isEdit ? props.items : undefined;
	const items = React.useMemo(
		() => editItems ?? [newItem],
		[editItems, newItem],
	);
	const itemId = isEdit ? props.itemId : newItem.id;
	const idToItem = React.useMemo(
		() => new Map(items.map((x) => [x.id, x])),
		[items],
	);
	const item = idToItem.get(itemId);

	// IDs to navigate (skip removed items)
	const ids = isEdit ? props.orderedIds : undefined;
	const navIds = React.useMemo(() => {
		const existing = (ids ?? []).filter((id) => idToItem.has(id));
		return existing.includes(itemId) ? existing : [itemId];
	}, [ids, idToItem, itemId]);
	const index = navIds.indexOf(itemId);
	const prevId = navIds[index - 1] as number | undefined;
	const nextId = navIds[index + 1] as number | undefined;

	// Discard the unsaved change when opened
	React.useLayoutEffect(() => {
		if (open) {
			setCurrentItem(null);
		}
	}, [open]);

	/** Save the edited item to the box if it's changed (edit mode only). */
	const commit = React.useCallback(() => {
		setCurrentItem(null);
		if (!isEdit || currentItem === null) {
			return;
		}
		const original = items.find((x) => x.id === currentItem.id);
		if (
			original === undefined ||
			(original.iv.isEqual(currentItem.iv) &&
				original.nickname === currentItem.nickname)
		) {
			return;
		}
		dispatch({ type: "addOrEditDone", payload: { item: currentItem } });
	}, [isEdit, items, currentItem, dispatch]);

	const close = React.useCallback(() => {
		commit();
		onClose();
	}, [commit, onClose]);

	const setPosition = React.useCallback(
		(value: BoxDrawerPosition) => {
			dispatch({
				type: "changeBoxDrawerPosition",
				payload: { position: value },
			});
		},
		[dispatch],
	);

	const onEditorChange = React.useCallback(
		(value: PokemonBoxItem) => {
			if (isEdit) {
				dispatch({ type: "addOrEditDone", payload: { item: value } });
			} else {
				setCurrentItem(value);
			}
		},
		[isEdit, dispatch],
	);

	const onAddClick = React.useCallback(() => {
		setCurrentItem(null);
		dispatch({
			type: "addOrEditDone",
			payload: { item: currentItem ?? newItem },
		});
		close();
	}, [currentItem, newItem, dispatch, close]);

	const moveTo = React.useCallback(
		(targetId: number | undefined) => {
			if (targetId === undefined) {
				return;
			}
			onItemChange?.(targetId);
		},
		[onItemChange],
	);
	const onPrevClick = React.useCallback(() => {
		moveTo(prevId);
	}, [prevId, moveTo]);
	const onNextClick = React.useCallback(() => {
		moveTo(nextId);
	}, [nextId, moveTo]);

	return (
		<ResizableDrawer
			open={open && item !== undefined}
			position={position}
			onPositionChange={setPosition}
			onClose={close}
		>
			<BoxItemContainer
				navIds={navIds}
				index={index}
				idToItem={idToItem}
				currentItem={currentItem}
				isEdit={isEdit}
				parameter={parameter}
				dispatch={dispatch}
				onChange={onEditorChange}
				onItemChange={moveTo}
			/>
			<footer>
				{isEdit ? (
					<>
						<IconButton onClick={onPrevClick} disabled={prevId === undefined}>
							<ChevronLeftIcon />
						</IconButton>
						<IconButton onClick={close} aria-label={t("close")}>
							<CloseIcon />
						</IconButton>
						<IconButton onClick={onNextClick} disabled={nextId === undefined}>
							<ChevronRightIcon />
						</IconButton>
					</>
				) : (
					<>
						<IconButton onClick={close} aria-label={t("close")} color="error">
							<CloseIcon />
						</IconButton>
						<IconButton
							onClick={onAddClick}
							aria-label={t("add")}
							color="primary"
						>
							<CheckIcon />
						</IconButton>
					</>
				)}
			</footer>
		</ResizableDrawer>
	);
});

/**
 * Bottom drawer whose height can be changed by dragging the handle.
 */
const ResizableDrawer = React.memo(
	({
		open,
		position,
		onPositionChange,
		onClose,
		children,
	}: {
		open: boolean;
		position: BoxDrawerPosition;
		onPositionChange: (position: BoxDrawerPosition) => void;
		onClose: () => void;
		children: React.ReactNode;
	}) => {
		const [dragHeight, setDragHeight] = React.useState<number | null>(null);
		const [layout, setLayout] = React.useState({ top: 0, height: 0 });

		// Measure the position of the lower tab header when opened
		React.useLayoutEffect(() => {
			if (!open) {
				return () => {};
			}
			setDragHeight(null);
			const measure = () => {
				const header = document.getElementById(lowerTabHeaderId);
				setLayout({
					top: header?.getBoundingClientRect().top ?? 0,
					height: window.innerHeight,
				});
			};
			measure();
			window.addEventListener("resize", measure);
			return () => {
				window.removeEventListener("resize", measure);
			};
		}, [open]);

		const fullHeight = layout.height;
		const halfHeight = clamp(
			Math.min(minHalfHeight, fullHeight),
			fullHeight - layout.top,
			fullHeight,
		);
		// Clamp the stopped height in case the window is resized
		const restHeight = clamp(
			halfHeight,
			position.height ?? halfHeight,
			fullHeight,
		);
		const baseHeight = position.full ? fullHeight : restHeight;
		const height = dragHeight ?? baseHeight;
		const isFull = height >= fullHeight;

		// Drag the handle vertically to resize the drawer
		const bindHandle = useDrag(
			({
				active,
				tap,
				movement: [, my],
				velocity: [, vy],
				direction: [, dy],
			}) => {
				if (tap) {
					// Toggle between full screen and the height stopped last time
					onPositionChange({ ...position, full: !position.full });
					return;
				}
				const h = clamp(0, baseHeight - my, fullHeight);
				if (active) {
					setDragHeight(h);
					return;
				}

				// Stop at the released height unless flicked or below the half height
				let next: number | "close";
				if (vy > 0.5 && dy < 0) {
					next = fullHeight;
				} else if (vy > 0.5 && dy > 0) {
					next =
						baseHeight > halfHeight && h > halfHeight / 2
							? halfHeight
							: "close";
				} else if (h < halfHeight / 2) {
					next = "close";
				} else {
					next = Math.max(h, halfHeight);
				}

				if (next === "close") {
					// Keep the current height while sliding out
					onClose();
					return;
				}
				setDragHeight(null);
				if (next >= fullHeight) {
					// Keep the height to restore when the full screen is canceled
					onPositionChange({ ...position, full: true });
				} else {
					// Follow the half height of the current layout when stopped there
					onPositionChange({
						full: false,
						height: next > halfHeight ? next : null,
					});
				}
			},
			{ filterTaps: true },
		);

		return (
			<StyledDrawer
				anchor="bottom"
				open={open}
				onClose={onClose}
				className={isFull ? "full" : ""}
			>
				<div
					className="container"
					style={{
						height,
						transition:
							dragHeight === null
								? "height 225ms cubic-bezier(0, 0, 0.2, 1)"
								: "none",
					}}
				>
					<div className="handle" {...bindHandle()}>
						<span />
					</div>
					{children}
				</div>
			</StyledDrawer>
		);
	},
);

/**
 * Scrollable content of the drawer to swipe between the items.
 * Renders the current item and its neighbors only.
 */
const BoxItemContainer = React.memo(
	({
		navIds,
		index,
		idToItem,
		currentItem,
		isEdit,
		parameter,
		dispatch,
		onChange,
		onItemChange,
	}: {
		navIds: number[];
		index: number;
		idToItem: Map<number, PokemonBoxItem>;
		currentItem: PokemonBoxItem | null;
		isEdit: boolean;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		onChange: (value: PokemonBoxItem) => void;
		onItemChange: (id: number) => void;
	}) => {
		const itemId = navIds[index];
		const [width, setWidth] = React.useState(0);
		const [showSummary, setShowSummary] = React.useState(false);
		const contentElmRef = React.useRef<HTMLDivElement | null>(null);

		// Measure the width of the content
		const contentRef = React.useCallback((elm: HTMLDivElement) => {
			contentElmRef.current = elm;
			const observer = new ResizeObserver(() => {
				setWidth(elm.clientWidth);
			});
			observer.observe(elm);
			return () => {
				contentElmRef.current = null;
				observer.disconnect();
			};
		}, []);

		// Show the summary when the nickname of the current item reaches the top
		const updateSummary = React.useCallback(() => {
			const content = contentElmRef.current;
			const nickname = content?.querySelector(".current div.nickname");
			if (content == null || nickname == null) {
				setShowSummary(false);
				return;
			}
			setShowSummary(
				nickname.getBoundingClientRect().top <=
					content.getBoundingClientRect().top,
			);
		}, []);

		// SwipeContainer -> Parent
		const onIndexChange = React.useCallback(
			(newIndex: number) => {
				const id = navIds[newIndex];
				if (id !== undefined) {
					onItemChange(id);
				}
			},
			[navIds, onItemChange],
		);

		const start = Math.max(0, index - 1);
		const visibleIds = navIds.slice(start, index + 2);

		return (
			<div className="content" ref={contentRef} onScroll={updateSummary}>
				{width > 0 && (
					<SwipeContainer
						index={index}
						min={0}
						max={navIds.length - 1}
						width={width}
						onIndexChange={onIndexChange}
						ignoreDragSelector={ignoreSwipeSelector}
						style={swipeContainerStyle}
					>
						{(x, widthGap) => (
							<animated.div
								className="tabTrack"
								style={{ x: x.to((v) => v + start * widthGap) }}
							>
								{visibleIds.map((id) => {
									const visibleItem = idToItem.get(id);
									return (
										<div
											key={id}
											className={id === itemId ? "current" : undefined}
											style={{ width }}
										>
											{visibleItem !== undefined && (
												<BoxItemEditor
													boxItem={currentItem ?? visibleItem}
													isEdit={isEdit}
													parameter={parameter}
													dispatch={dispatch}
													onChange={id === itemId ? onChange : ignoreChange}
													showSummary={showSummary}
												/>
											)}
										</div>
									);
								})}
							</animated.div>
						)}
					</SwipeContainer>
				)}
			</div>
		);
	},
);

const StyledDrawer = styled(Drawer)({
	"& > .MuiBackdrop-root": {
		background: "rgba(0, 0, 0, 0.2)",
	},
	"& > .MuiDrawer-paper": {
		borderRadius: "12px 12px 0 0",
		overflow: "hidden",
	},
	"&.full > .MuiDrawer-paper": {
		borderRadius: 0,
	},
	"& div.container": {
		position: "relative",
		display: "flex",
		flexDirection: "column",
		"& > div.handle": {
			flex: `0 0 ${handleHeight}px`,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			cursor: "grab",
			touchAction: "none",
			"& > span": {
				width: 36,
				height: 4,
				borderRadius: 2,
				background: "#ccc",
			},
		},
		"& > div.content": {
			flex: "1 1 auto",
			overflowX: "hidden",
			overflowY: "auto",
			overscrollBehavior: "contain",
			touchAction: "pan-y",
			// Keep the width stable so that the track position isn't shifted
			// when the scrollbar appears
			scrollbarGutter: "stable",
			// Align the items of different heights to the top
			"& div.tabTrack": {
				alignItems: "flex-start",
			},
			// Leave space so that the content can scroll above the buttons
			"& article": {
				paddingBottom: "5rem",
			},
		},
		// Overlay the buttons on the content with a transparent background
		"& > footer": {
			position: "absolute",
			left: 0,
			right: 0,
			bottom: 0,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "2rem",
			padding: "0 0.5rem 1rem 0.5rem",
			pointerEvents: "none",
			"& > button": {
				pointerEvents: "auto",
				width: 44,
				height: 44,
				background: "rgba(255, 255, 255, 0.9)",
				boxShadow: "0 1px 4px rgba(0, 0, 0, 0.25)",
				"&:hover": {
					background: "rgba(245, 245, 245, 0.95)",
				},
				"&.Mui-disabled": {
					background: "rgba(255, 255, 255, 0.6)",
					boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
				},
			},
		},
	},
});

type BoxItemDialogProps = {
	/** Whether the drawer is open. */
	open: boolean;
	/** Position where the drawer stopped last time. */
	position: BoxDrawerPosition;
	parameter: StrengthParameter;
	dispatch: (action: IvAction) => void;
	/** Called when the drawer is closed. */
	onClose: () => void;
} & (
	| {
			/** Add a new pokemon to the box. */
			mode: "add";
	  }
	| {
			/** Edit a pokemon in the box. */
			mode: "edit";
			/** Box items. */
			items: PokemonBoxItem[];
			/** IDs of the items in the order they are navigated. */
			orderedIds: number[];
			/** ID of the item being edited. */
			itemId: number;
			/** Called when the user moves to another item. */
			onItemChange: (id: number) => void;
	  }
);

export default BoxItemDialog;
