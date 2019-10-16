import React, { memo } from "react";
import "./LimitBreak.scss";

const easeInOutQuad = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const LimitBreak = memo(({ level, status, max, charge, className }) => (
	<div className={`bg-gray-300 rounded ${className}`}>
		<div
			className={`limit-break limit-break--${status}`}
			style={{
				width: `${(100 * level) / max}%`,
				animation: `${status}Animation ${(1 -
					easeInOutQuad(Math.min(1, charge / 100))) *
					2}s infinite`
			}}
		></div>
	</div>
));

export default LimitBreak;
