import React, {useMemo} from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoMercator, geoPath, geoInterpolate} from 'd3-geo';
import {feature} from 'topojson-client';
import land from './land-110m.json';
import {DarkBg, SectionHeader, CaptionTag, Ring, YELLOW, WHITE, FONT, useIn, usePop, useDrift, ease} from './theme';
import {PlaneSide, Part} from './PlaneSide';

const T: React.CSSProperties = {fontFamily: FONT, color: WHITE, textTransform: 'uppercase'};

/* ---------- Sky with the plane flying (stands in for the reference's 3D fly-by) ---------- */
const Clouds: React.FC<{speed: number; y: number; scale: number; opacity: number; seed: number}> = ({speed, y, scale, opacity, seed}) => {
	const f = useCurrentFrame();
	const puffs = Array.from({length: 9}).map((_, i) => {
		const r = (Math.sin(seed * 13.1 + i * 7.7) + 1) / 2;
		const x = ((i * 420 + r * 300 - f * speed) % 3000 + 3000) % 3000 - 500;
		return {x, w: (260 + r * 380) * scale, h: (60 + r * 70) * scale, dy: (r - 0.5) * 120};
	});
	return (
		<>
			{puffs.map((p, i) => (
				<div key={i} style={{position: 'absolute', left: p.x, top: y + p.dy, width: p.w, height: p.h, borderRadius: '50%',
					background: 'rgba(255,255,255,0.95)', filter: `blur(${28 * scale}px)`, opacity}} />
			))}
		</>
	);
};

export const SkyPlane: React.FC<{title?: [string, string]; tag?: string; dir?: 1 | -1; size?: number; dusk?: boolean; night?: boolean; sea?: boolean}> = ({title, tag, dir = 1, size = 1, dusk, night, sea}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = f / durationInFrames;
	const top = night ? '#0d1626' : dusk ? '#e7a96b' : '#8fa3b5';
	const bottom = night ? '#2a3550' : dusk ? '#f3dcc0' : '#dde2e6';
	const bob = Math.sin(f / 24) * 8;
	const W = 1100 * size;
	const ti = useIn(10, 18);
	const ti2 = useIn(22, 18);
	return (
		<AbsoluteFill style={{background: `linear-gradient(${top}, ${bottom} 75%)`, overflow: 'hidden'}}>
			{sea && <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 260, background: night ? '#0b1220' : 'linear-gradient(#7b8d9a,#55697a)', opacity: 0.9}} />}
			<Clouds speed={1.2} y={140} scale={1.4} opacity={night ? 0.15 : 0.55} seed={1} />
			<Clouds speed={2.2} y={560} scale={1.1} opacity={night ? 0.12 : 0.6} seed={2} />
			<div style={{position: 'absolute', width: W, height: W * 0.35, left: 960 - W / 2 + dir * (t - 0.5) * 160, top: 600 - W * 0.17 + bob - (title ? 0 : 60),
				transform: `scaleX(${dir === 1 ? 1 : -1}) rotate(${Math.sin(f / 40) * 1.2}deg)`, filter: night ? 'brightness(0.55)' : dusk ? 'sepia(0.25)' : 'none'}}>
				<PlaneSide prop={f} />
			</div>
			<Clouds speed={4} y={880} scale={1.8} opacity={night ? 0.15 : 0.7} seed={3} />
			{title && (
				<div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center'}}>
					<div style={{...T, fontWeight: 800, fontSize: 92, opacity: ti, transform: `translateY(${(1 - ti) * 20}px)`, textShadow: '0 3px 18px rgba(0,0,0,0.35)'}}>{title[0]}</div>
					<div style={{...T, color: YELLOW, fontWeight: 800, fontSize: 70, opacity: ti2, textShadow: '0 3px 18px rgba(0,0,0,0.35)'}}>{title[1]}</div>
					<div style={{margin: '18px auto 0', width: 120 * ti2, height: 6, background: YELLOW}} />
				</div>
			)}
			{tag && <CaptionTag text={tag} />}
		</AbsoluteFill>
	);
};

/* ---------- Chapter card: big yellow number + label + faint plane ---------- */
export const Chapter: React.FC<{num: number; label: string}> = ({num, label}) => {
	const a = useIn(4, 16);
	const b = useIn(12, 16);
	const f = useCurrentFrame();
	return (
		<DarkBg>
			<div style={{position: 'absolute', right: 120, top: 260, width: 900, height: 320, opacity: 0.16, transform: `translateX(${-f * 0.4}px)`}}>
				<PlaneSide tone="line" />
			</div>
			<div style={{position: 'absolute', left: 140, top: 400}}>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 150, color: YELLOW, lineHeight: 1, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
					{String(num).padStart(2, '0')}
				</div>
				<div style={{width: 90 * a, height: 6, background: YELLOW, margin: '18px 0 26px'}} />
				<div style={{...T, fontWeight: 700, fontSize: 56, maxWidth: 1000, lineHeight: 1.1, opacity: b}}>{label}</div>
			</div>
		</DarkBg>
	);
};

/* ---------- Diagram of the plane with highlighted parts ---------- */
export const Diagram: React.FC<{header?: string; tag?: string; highlight?: Part[]; sightline?: boolean; periscopeView?: boolean; labels?: boolean; xray?: boolean; note?: string}> = ({header, tag, highlight, sightline, periscopeView, labels, xray, note}) => {
	const drift = useDrift(1, 1.05);
	const f = useCurrentFrame();
	const n = useIn(30, 14);
	return (
		<DarkBg>
			<div style={{position: 'absolute', left: 260, top: 280, width: 1400, height: 490, ...drift}}>
				<PlaneSide highlight={highlight} sightline={sightline} periscopeView={periscopeView} labels={labels} xray={xray} prop={f} />
			</div>
			{header && <SectionHeader text={header} />}
			{tag && <CaptionTag text={tag} />}
			{note && (
				<div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', ...T, fontWeight: 700, fontSize: 40, color: YELLOW, opacity: n}}>{note}</div>
			)}
		</DarkBg>
	);
};

/* ---------- Big number that counts up ---------- */
export const Stat: React.FC<{value: number; raw?: boolean; decimals?: number; prefix?: string; suffix?: string; label: string; header?: string; sub?: string}> = ({value, raw, decimals = 0, prefix = '', suffix = '', label, header, sub}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [6, 46], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	const a = useIn(0, 12);
	const b = useIn(40, 14);
	const v = raw ? String(value) : (value * p).toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
	return (
		<DarkBg>
			{header && <SectionHeader text={header} />}
			<div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', opacity: a}}>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 210, color: YELLOW, lineHeight: 1}}>{prefix}{v}{suffix}</div>
				<div style={{...T, fontWeight: 700, fontSize: 58, marginTop: 20}}>{label}</div>
				{sub && <div style={{...T, fontWeight: 600, fontSize: 34, opacity: 0.7 * b, marginTop: 14}}>{sub}</div>}
			</div>
		</DarkBg>
	);
};

/* ---------- Row of cards that pop in with numbered badges (reference card row) ---------- */
export type Card = {big: string; label: string; badge?: string; hot?: boolean; icon?: React.ReactNode};
export const Cards: React.FC<{header: string; items: Card[]; gap?: number; atSec?: number[]}> = ({header, items, gap = 18, atSec}) => {
	const {fps} = useVideoConfig();
	const n = items.length;
	const w = Math.min(330, (1700 - (n - 1) * 26) / n);
	return (
		<DarkBg>
			<SectionHeader text={header} />
			<div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26}}>
				{items.map((c, i) => (
					<CardView key={i} c={c} w={w} delay={atSec ? Math.round(atSec[i] * fps) : 14 + i * gap} />
				))}
			</div>
		</DarkBg>
	);
};
const CardView: React.FC<{c: Card; w: number; delay: number}> = ({c, w, delay}) => {
	const p = usePop(delay);
	const o = useIn(delay, 8);
	return (
		<div style={{width: w, opacity: o, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`}}>
			<div style={{position: 'relative', height: w * 1.25, borderRadius: 12, overflow: 'hidden',
				background: c.hot ? 'linear-gradient(160deg,#3a3a1c,#22220f)' : 'linear-gradient(160deg,#3c4652,#232930)', border: `2px solid ${c.hot ? YELLOW : 'rgba(255,255,255,0.12)'}`,
				display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
				{c.icon}
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: c.big.length > 6 ? 54 : 76, color: c.hot ? YELLOW : WHITE, textAlign: 'center', lineHeight: 1, padding: '0 10px'}}>{c.big}</div>
				{c.badge && (
					<div style={{position: 'absolute', right: 14, top: 14, width: 46, height: 46, borderRadius: 23, background: c.hot ? YELLOW : WHITE,
						color: '#111', fontFamily: FONT, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.badge}</div>
				)}
			</div>
			<div style={{...T, fontWeight: 700, fontSize: 32, textAlign: 'center', marginTop: 18}}>{c.label}</div>
		</div>
	);
};

/* ---------- Map: New York to Paris route drawn on ---------- */
const ROUTE: [number, number][] = [
	[-73.61, 40.73], [-70.0, 41.8], [-63.6, 44.6], [-52.7, 47.6], [-30, 51.2], [-10.3, 52.1], [-4.1, 50.4], [-1.6, 49.6], [2.44, 48.97],
];
export const RouteMap: React.FC<{header?: string; from?: number; to?: number; distance?: boolean; tag?: string; highlightOcean?: boolean}> = ({header, from = 0, to = 1, distance, tag, highlightOcean}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const proj = useMemo(() => geoMercator().center([-36, 47]).scale(1000).translate([960, 600]), []);
	const path = useMemo(() => geoPath(proj), [proj]);
	const landD = useMemo(() => path(feature(land as any, (land as any).objects.land) as any) ?? '', [path]);
	const pts = useMemo(() => {
		const out: [number, number][] = [];
		for (let i = 0; i < ROUTE.length - 1; i++) {
			const ip = geoInterpolate(ROUTE[i], ROUTE[i + 1]);
			for (let k = 0; k < 20; k++) out.push(proj(ip(k / 20)) as [number, number]);
		}
		out.push(proj(ROUTE[ROUTE.length - 1]) as [number, number]);
		return out;
	}, [proj]);
	const p = interpolate(f, [10, Math.max(11, durationInFrames - 20)], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	const nPts = Math.max(2, Math.round(p * (pts.length - 1)) + 1);
	const d = 'M' + pts.slice(0, nPts).map((q) => q.join(',')).join('L');
	const tip = pts[nPts - 1];
	const prev = pts[Math.max(0, nPts - 2)];
	const ang = (Math.atan2(tip[1] - prev[1], tip[0] - prev[0]) * 180) / Math.PI;
	const ny = proj(ROUTE[0]) as [number, number];
	const pa = proj(ROUTE[ROUTE.length - 1]) as [number, number];
	const drift = useDrift(1.0, 1.06, -20, 0);
	const a = useIn(0, 12);
	return (
		<DarkBg>
			<svg width={1920} height={1080} style={{position: 'absolute', ...drift, opacity: a}}>
				<rect width={1920} height={1080} fill={highlightOcean ? 'rgba(40,70,100,0.35)' : 'rgba(30,40,55,0.25)'} />
				<path d={landD} fill="#2c2f35" stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} />
				<path d={'M' + pts.map((q) => q.join(',')).join('L')} stroke="rgba(255,255,255,0.15)" strokeWidth={3} fill="none" strokeDasharray="6 10" />
				<path d={d} stroke={YELLOW} strokeWidth={6} fill="none" strokeLinecap="round" />
				{[ny, pa].map((q, i) => (
					<g key={i}>
						<circle cx={q[0]} cy={q[1]} r={11} fill={WHITE} stroke="#111" strokeWidth={3} />
						<text x={q[0] + (i ? 18 : -18)} y={q[1] + (i ? -20 : 46)} textAnchor={i ? 'start' : 'end'} fontFamily={FONT} fontWeight={800} fontSize={40} fill={WHITE}>
							{i ? 'PARIS' : 'NEW YORK'}
						</text>
					</g>
				))}
				<g transform={`translate(${tip[0]},${tip[1]}) rotate(${ang})`}>
					<path d="M18,0 L-12,-11 L-6,0 L-12,11 Z" fill={YELLOW} stroke="#111" strokeWidth={2} />
				</g>
				{highlightOcean && (
					<text x={1000} y={720} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={44} fill="rgba(255,255,255,0.55)" letterSpacing={8}>ATLANTIC OCEAN</text>
				)}
			</svg>
			{distance && (
				<div style={{position: 'absolute', right: 110, bottom: 90, textAlign: 'right'}}>
					<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 110, color: YELLOW, lineHeight: 1}}>{Math.round(3610 * p).toLocaleString('en-US')}</div>
					<div style={{...T, fontWeight: 700, fontSize: 40}}>MILES</div>
				</div>
			)}
			{header && <SectionHeader text={header} />}
			{tag && <CaptionTag text={tag} />}
		</DarkBg>
	);
};

/* ---------- Horizontal bars (weights, comparisons) ---------- */
export const Bars: React.FC<{header: string; unit: string; items: {label: string; value: number; hot?: boolean}[]}> = ({header, unit, items}) => {
	const f = useCurrentFrame();
	const max = Math.max(...items.map((i) => i.value));
	return (
		<DarkBg>
			<SectionHeader text={header} />
			<div style={{position: 'absolute', left: 160, top: 360, width: 1600}}>
				{items.map((it, i) => {
					const p = interpolate(f, [16 + i * 16, 56 + i * 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
					return (
						<div key={i} style={{marginBottom: 70}}>
							<div style={{...T, fontWeight: 700, fontSize: 38, marginBottom: 14, opacity: Math.min(1, p * 3)}}>{it.label}</div>
							<div style={{display: 'flex', alignItems: 'center', gap: 28}}>
								<div style={{height: 70, width: (1150 * it.value * p) / max, background: it.hot ? YELLOW : 'rgba(255,255,255,0.55)', borderRadius: 6}} />
								<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: it.hot ? YELLOW : WHITE}}>
									{Math.round(it.value * p).toLocaleString('en-US')} <span style={{fontSize: 34}}>{unit}</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</DarkBg>
	);
};

/* ---------- Statement text, key words in yellow ---------- */
export const Statement: React.FC<{lines: string[]; yellow?: number[]; header?: string; size?: number}> = ({lines, yellow = [], header, size = 96}) => (
	<DarkBg>
		{header && <SectionHeader text={header} />}
		<div style={{position: 'absolute', top: 0, bottom: 0, left: 140, right: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
			{lines.map((l, i) => (
				<Line key={i} text={l} delay={6 + i * 10} yellow={yellow.includes(i)} size={size} />
			))}
		</div>
	</DarkBg>
);
const Line: React.FC<{text: string; delay: number; yellow: boolean; size: number}> = ({text, delay, yellow, size}) => {
	const a = useIn(delay, 16);
	return (
		<div style={{...T, fontWeight: 800, fontSize: size, lineHeight: 1.15, color: yellow ? YELLOW : WHITE, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 24}px)`}}>
			{text}
		</div>
	);
};

/* ---------- Chain of boxes with arrows (cause → effect) ---------- */
export const Chain: React.FC<{header: string; steps: string[]}> = ({header, steps}) => (
	<DarkBg>
		<SectionHeader text={header} />
		<div style={{position: 'absolute', top: 440, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
			{steps.map((s, i) => (
				<ChainStep key={i} text={s} delay={10 + i * 22} arrow={i < steps.length - 1} hot={i === steps.length - 1} />
			))}
		</div>
	</DarkBg>
);
const ChainStep: React.FC<{text: string; delay: number; arrow: boolean; hot: boolean}> = ({text, delay, arrow, hot}) => {
	const p = usePop(delay);
	const a = useIn(delay + 10, 12);
	return (
		<div style={{display: 'flex', alignItems: 'center'}}>
			<div style={{width: 280, height: 170, borderRadius: 12, border: `3px solid ${hot ? YELLOW : 'rgba(255,255,255,0.4)'}`, background: 'rgba(255,255,255,0.05)',
				display: 'flex', alignItems: 'center', justifyContent: 'center', ...T, fontWeight: 800, fontSize: 38, color: hot ? YELLOW : WHITE, textAlign: 'center',
				transform: `scale(${p})`, padding: 12}}>{text}</div>
			{arrow && <div style={{fontFamily: FONT, fontSize: 70, color: YELLOW, margin: '0 18px', opacity: a}}>→</div>}
		</div>
	);
};

/* ---------- Front view: banking the plane to look past the nose ---------- */
export const BankView: React.FC<{header?: string}> = ({header}) => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const bank = interpolate(f, [15, durationInFrames * 0.45, durationInFrames * 0.75, durationInFrames], [0, -18, -18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	const cone = interpolate(bank, [-18, -6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<DarkBg>
			{header && <SectionHeader text={header} />}
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{/* view cone through side window toward the ground ahead */}
				<polygon points="960,520 1500,900 1180,980" fill={`rgba(244,224,28,${0.28 * cone})`} />
				<g transform={`rotate(${bank} 960 520)`}>
					<rect x={360} y={432} width={1200} height={22} rx={10} fill="#c8ccd2" stroke="#7d828a" strokeWidth={3} />
					<circle cx={960} cy={520} r={88} fill="#b5bac1" stroke="#7d828a" strokeWidth={4} />
					<circle cx={960} cy={520} r={40} fill="#5b5f66" />
					<ellipse cx={960} cy={520} rx={330} ry={10} fill="rgba(230,232,236,0.35)" />
					<path d="M900,600 L860,740 M1020,600 L1060,740" stroke="#7d828a" strokeWidth={8} />
					<circle cx={860} cy={760} r={26} fill="#2b2d31" />
					<circle cx={1060} cy={760} r={26} fill="#2b2d31" />
				</g>
				<line x1={260} y1={980} x2={1660} y2={980} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
			</svg>
			<div style={{position: 'absolute', right: 140, top: 230, textAlign: 'right'}}>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 80, color: YELLOW}}>{Math.round(Math.abs(bank))}°</div>
				<div style={{...T, fontWeight: 700, fontSize: 32}}>BANK</div>
			</div>
		</DarkBg>
	);
};

/* ---------- Clock / duration counter ---------- */
export const Clock: React.FC<{hours: number; label: string; header?: string}> = ({hours, label, header}) => {
	const f = useCurrentFrame();
	const p = interpolate(f, [8, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
	const h = hours * p;
	const r = 300;
	const c = 2 * Math.PI * r;
	return (
		<DarkBg>
			{header && <SectionHeader text={header} />}
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<circle cx={960} cy={540} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={22} />
				<circle cx={960} cy={540} r={r} fill="none" stroke={YELLOW} strokeWidth={22} strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, h / 36))}
					transform="rotate(-90 960 540)" strokeLinecap="round" />
			</svg>
			<div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center'}}>
				<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 110, color: WHITE, lineHeight: 1}}>
					{Math.floor(h)}<span style={{fontSize: 60, color: YELLOW}}>H</span> {String(Math.round((h % 1) * 60)).padStart(2, '0')}<span style={{fontSize: 60, color: YELLOW}}>M</span>
				</div>
			</div>
			<div style={{position: 'absolute', bottom: 60, width: '100%', textAlign: 'center', ...T, fontWeight: 700, fontSize: 46}}>{label}</div>
		</DarkBg>
	);
};

/* ---------- Real photo with drift, tag and rings (used once photos are supplied) ---------- */
export const Photo: React.FC<{src: string; tag?: string; rings?: {x: number; y: number; r: number}[]; zoom?: [number, number]; pan?: [number, number]}> = ({src, tag, rings = [], zoom = [1.04, 1.14], pan = [0, 0]}) => {
	const drift = useDrift(zoom[0], zoom[1], pan[0], pan[1]);
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', ...drift}} />
			{rings.map((r, i) => <Ring key={i} {...r} delay={14 + i * 10} />)}
			{tag && <CaptionTag text={tag} />}
		</AbsoluteFill>
	);
};
