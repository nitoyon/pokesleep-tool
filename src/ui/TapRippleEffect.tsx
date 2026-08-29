import React from "react";

const RIPPLE_SIZE = 30;
const RIPPLE_DURATION = 500;

const RIPPLE_STYLE_ID = "tap-ripple-effect-style";

/** Shows a Material-style ripple effect at each tap/click position. */
export default function TapRippleEffect() {
	React.useEffect(() => {
		ensureRippleStyle();
		const timeoutIds = new Set<ReturnType<typeof setTimeout>>();

		const onPointerDown = (event: PointerEvent) => {
			const ripple = document.createElement("span");
			ripple.style.position = "fixed";
			ripple.style.left = `${event.clientX - RIPPLE_SIZE / 2}px`;
			ripple.style.top = `${event.clientY - RIPPLE_SIZE / 2}px`;
			ripple.style.width = `${RIPPLE_SIZE}px`;
			ripple.style.height = `${RIPPLE_SIZE}px`;
			ripple.style.borderRadius = "50%";
			ripple.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
			ripple.style.transform = "scale(0)";
			ripple.style.pointerEvents = "none";
			ripple.style.zIndex = "2147483647";
			ripple.style.animation = `tapRippleEffectAnimation ${RIPPLE_DURATION}ms ease-out`;
			document.body.appendChild(ripple);

			const remove = () => {
				ripple.remove();
				timeoutIds.delete(timeoutId);
			};
			ripple.addEventListener("animationend", remove, { once: true });
			const timeoutId = setTimeout(remove, RIPPLE_DURATION);
			timeoutIds.add(timeoutId);
		};

		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			timeoutIds.forEach((id) => {
				clearTimeout(id);
			});
		};
	}, []);

	return null;
}

function ensureRippleStyle() {
	if (document.getElementById(RIPPLE_STYLE_ID)) {
		return;
	}
	const style = document.createElement("style");
	style.id = RIPPLE_STYLE_ID;
	style.textContent = `
		@keyframes tapRippleEffectAnimation {
			from {
				transform: scale(0);
				opacity: 0.6;
			}
			to {
				transform: scale(3);
				opacity: 0;
			}
		}
	`;
	document.head.appendChild(style);
}
