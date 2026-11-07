import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile, Easing} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Look taken from the reference: Barlow bold caps, white + one yellow accent, dark grainy cards.
export const YELLOW = '#F4E01C';
export const WHITE = '#FFFFFF';
export const DARK = '#111113';
export const FONT = 'Barlow';

for (const w of ['600', '700', '800']) {
	loadFont({family: FONT, url: staticFile(`fonts/barlow-latin-${w}-normal.woff2`), weight: w});
}

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 0→1 over `dur` frames starting at `delay`, eased. */
export const useIn = (delay = 0, dur = 14) => {
	const f = useCurrentFrame();
	return interpolate(f, [delay, delay + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
};

export const usePop = (delay = 0) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: f - delay, fps, config: {damping: 14, stiffness: 140, mass: 0.8}});
};

/** Slow camera drift, like the reference's floating camera. */
export const useDrift = (scaleFrom = 1.04, scaleTo = 1.12, x = 0, y = 0) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = interpolate(f, [0, Math.max(1, durationInFrames)], [0, 1], {extrapolateRight: 'clamp'});
	return {
		transform: `scale(${scaleFrom + (scaleTo - scaleFrom) * t}) translate(${x * t}px, ${y * t}px)`,
	};
};

/** Dark grainy background used for chapter cards and graphics. */
export const DarkBg: React.FC<{children?: React.ReactNode}> = ({children}) => {
	const f = useCurrentFrame();
	const seed = Math.floor(f / 2) % 40;
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 40% 35%, #26262a 0%, ${DARK} 70%)`}}>
			<svg width="100%" height="100%" style={{position: 'absolute', opacity: 0.22, mixBlendMode: 'overlay'}}>
				<filter id={`g${seed}`}>
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter={`url(#g${seed})`} />
			</svg>
			{children}
		</AbsoluteFill>
	);
};

/** Small yellow dash + white caps heading, top-left (reference "ONE ENGINE, OR TWO"). */
export const SectionHeader: React.FC<{text: string}> = ({text}) => {
	const a = useIn(0, 16);
	const chars = Math.round(text.length * useIn(4, 22));
	return (
		<div style={{position: 'absolute', left: 96, top: 54}}>
			<div style={{width: 64 * a, height: 5, background: YELLOW, marginBottom: 22}} />
			<div style={{fontFamily: FONT, fontWeight: 700, fontSize: 52, color: WHITE, letterSpacing: 0.5}}>
				{text.slice(0, chars).toUpperCase()}
			</div>
		</div>
	);
};

/** Black tag with yellow edge, top-left (reference "THREE ENGINES: A KC-10"). */
export const CaptionTag: React.FC<{text: string; delay?: number}> = ({text, delay = 6}) => {
	const a = useIn(delay, 14);
	return (
		<div
			style={{
				position: 'absolute', left: 82, top: 120, display: 'flex', alignItems: 'stretch',
				opacity: a, transform: `translateX(${(1 - a) * -30}px)`,
			}}
		>
			<div style={{width: 8, background: YELLOW}} />
			<div style={{background: 'rgba(10,10,12,0.92)', padding: '10px 18px', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: WHITE, letterSpacing: 0.5}}>
				{text.toUpperCase()}
			</div>
		</div>
	);
};

/** Yellow ring drawn on, used to point at part of a picture. */
export const Ring: React.FC<{x: number; y: number; r: number; delay?: number}> = ({x, y, r, delay = 10}) => {
	const p = useIn(delay, 18);
	const c = 2 * Math.PI * r;
	return (
		<svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
			<circle cx={x} cy={y} r={r} fill="none" stroke={YELLOW} strokeWidth={6}
				strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform={`rotate(-90 ${x} ${y})`} strokeLinecap="round" />
		</svg>
	);
};

export const Fill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<AbsoluteFill style={style}>{children}</AbsoluteFill>
);
