import React from 'react';
import {YELLOW, FONT, WHITE, useIn} from './theme';

// Side view of the Spirit of St. Louis (Ryan NYP), nose to the left.
// viewBox 0 0 1200 420. Engine 95-190, main fuel tank 190-360, cockpit 360-470.
export type Part = 'engine' | 'tank' | 'cockpit' | 'periscope' | 'window';

const FUS = 'M190,150 L470,150 L1080,192 L1080,214 L470,270 L190,270 Z';

export const PlaneSide: React.FC<{
	highlight?: Part[];
	dim?: boolean;
	sightline?: boolean;
	periscopeView?: boolean;
	xray?: boolean;
	prop?: number; // frame number for propeller blur
	tone?: 'silver' | 'line';
	labels?: boolean;
	delay?: number;
}> = ({highlight = [], sightline, periscopeView, xray, prop = 0, tone = 'silver', labels, delay = 8}) => {
	const h = (p: Part) => highlight.includes(p);
	const hl = useIn(delay, 16);
	const sl = useIn(delay + 6, 22);
	const lab = useIn(delay + 10, 14);
	const metal = tone === 'silver' ? '#c8ccd2' : 'none';
	const edge = tone === 'silver' ? '#7d828a' : 'rgba(255,255,255,0.75)';
	const inner = xray || highlight.length > 0;
	const zone = (on: boolean) => (on ? `rgba(244,224,28,${0.85 * hl})` : inner ? 'rgba(255,255,255,0.10)' : 'transparent');
	const blade = Math.sin(prop * 1.7) * 0.5 + 0.5;
	return (
		<svg viewBox="0 0 1200 420" width="100%" height="100%" style={{overflow: 'visible'}}>
			<defs>
				<clipPath id="fus"><path d={FUS} /></clipPath>
				<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#e9ebee" />
					<stop offset="0.55" stopColor={metal} />
					<stop offset="1" stopColor="#9a9fa7" />
				</linearGradient>
			</defs>
			{/* landing gear */}
			<g stroke={edge} strokeWidth={6} fill="none">
				<path d="M250,268 L318,352" />
				<path d="M400,268 L330,352" />
			</g>
			<circle cx={322} cy={356} r={40} fill="#2b2d31" stroke={edge} strokeWidth={4} />
			<circle cx={322} cy={356} r={14} fill="#8d929a" />
			{/* tail skid */}
			<path d="M1050,212 L1078,246" stroke={edge} strokeWidth={5} />
			{/* fuselage */}
			<path d={FUS} fill={tone === 'silver' ? 'url(#metal)' : 'rgba(255,255,255,0.04)'} stroke={edge} strokeWidth={3} />
			{/* corrugated panel lines on the nose like the real aircraft */}
			<g clipPath="url(#fus)" stroke={tone === 'silver' ? 'rgba(90,95,105,0.35)' : 'rgba(255,255,255,0.18)'} strokeWidth={1.5}>
				{Array.from({length: 9}).map((_, i) => (
					<line key={i} x1={200 + i * 30} y1={150} x2={200 + i * 30} y2={270} />
				))}
			</g>
			{/* internal zones */}
			<g clipPath="url(#fus)">
				<rect x={192} y={152} width={166} height={116} fill={zone(h('tank'))} />
				<rect x={362} y={152} width={106} height={116} fill={zone(h('cockpit'))} />
				{inner && <line x1={360} y1={150} x2={360} y2={270} stroke={edge} strokeWidth={3} strokeDasharray="8 6" />}
			</g>
			{/* side window */}
			<rect x={392} y={164} width={58} height={40} rx={4} fill={h('window') ? `rgba(244,224,28,${0.9 * hl})` : '#5d7286'} stroke={edge} strokeWidth={2} />
			{/* pilot */}
			{inner && (
				<g fill="#1b1c1f" stroke={WHITE} strokeWidth={2} opacity={0.9}>
					<circle cx={428} cy={186} r={15} />
					<path d="M410,262 L414,206 Q428,198 442,206 L448,262 Z" />
				</g>
			)}
			{/* periscope on the left side, ahead of the window */}
			<rect x={372} y={172} width={14} height={30} rx={3} fill={h('periscope') ? YELLOW : '#4a4e55'} stroke={edge} strokeWidth={2} />
			{/* wing (high wing) and strut */}
			<path d="M245,148 Q260,112 330,114 L540,118 Q552,128 540,140 L250,150 Z" fill={tone === 'silver' ? '#d6d9dd' : 'rgba(255,255,255,0.06)'} stroke={edge} strokeWidth={3} />
			<path d="M460,146 L300,268" stroke={edge} strokeWidth={5} />
			{/* tail */}
			<path d="M1000,194 Q1010,120 1060,108 Q1092,110 1094,140 L1086,196 Z" fill={tone === 'silver' ? '#d6d9dd' : 'rgba(255,255,255,0.06)'} stroke={edge} strokeWidth={3} />
			<path d="M960,200 L1110,198 L1110,206 L960,208 Z" fill={edge} />
			{/* engine cowling + cylinders */}
			<path d="M95,168 Q95,150 120,148 L190,150 L190,270 L120,272 Q95,270 95,252 Z" fill={h('engine') ? `rgba(244,224,28,${0.25 + 0.65 * hl})` : '#9ea3ab'} stroke={edge} strokeWidth={3} />
			{[160, 192, 224, 256].map((y) => (
				<rect key={y} x={112} y={y - 9} width={40} height={18} rx={6} fill="#5b5f66" stroke={edge} strokeWidth={1.5} />
			))}
			{/* spinner + propeller */}
			<path d="M95,186 Q60,210 95,234 Z" fill="#b8bcc2" stroke={edge} strokeWidth={2} />
			<ellipse cx={74} cy={210} rx={7} ry={150} fill={`rgba(220,224,230,${0.18 + 0.1 * blade})`} />
			<ellipse cx={74} cy={210} rx={3} ry={150} fill="rgba(60,64,70,0.25)" />

			{/* line of sight from the pilot's eye, stopped by the tank */}
			{sightline && (
				<g opacity={sl}>
					<line x1={420} y1={184} x2={420 - 60 * sl} y2={184} stroke={YELLOW} strokeWidth={5} strokeDasharray="12 8" />
					{sl > 0.95 && (
						<g stroke="#ff4d3d" strokeWidth={7} strokeLinecap="round">
							<line x1={348} y1={172} x2={372} y2={196} />
							<line x1={372} y1={172} x2={348} y2={196} />
						</g>
					)}
				</g>
			)}
			{/* periscope view path: out of the side, forward past the nose */}
			{periscopeView && (
				<g opacity={sl}>
					<path d={`M379,186 L379,128 L${379 - 330 * sl},128`} stroke={YELLOW} strokeWidth={5} fill="none" strokeDasharray="12 8" />
					<polygon points={`${379 - 330 * sl},116 ${379 - 330 * sl - 24},128 ${379 - 330 * sl},140`} fill={YELLOW} />
				</g>
			)}
			{labels && (
				<g opacity={lab} fontFamily={FONT} fontWeight={700} fontSize={26} fill={WHITE} textAnchor="middle">
					<line x1={143} y1={146} x2={143} y2={60} stroke={YELLOW} strokeWidth={3} />
					<text x={143} y={48}>ENGINE</text>
					<line x1={275} y1={278} x2={275} y2={400} stroke={YELLOW} strokeWidth={3} />
					<text x={275} y={428}>FUEL TANK</text>
					<line x1={430} y1={278} x2={480} y2={400} stroke={YELLOW} strokeWidth={3} />
					<text x={490} y={428}>PILOT</text>
				</g>
			)}
		</svg>
	);
};
