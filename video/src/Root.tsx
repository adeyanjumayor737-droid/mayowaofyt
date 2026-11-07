import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SHOTS, at, TEST_END_CUE} from './edit';

const FPS = 30;
const FADE = 8;
const AUDIO_END = 1123.5;

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
	const f = useCurrentFrame();
	return <AbsoluteFill style={{opacity: interpolate(f, [0, FADE], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};

const Episode: React.FC<{end: number}> = ({end}) => {
	const starts = SHOTS.map((s) => Math.round(at(s.cue, s.off ?? 0) * FPS));
	starts[0] = 0;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{SHOTS.map((s, i) => {
				const from = starts[i];
				const to = i + 1 < SHOTS.length ? starts[i + 1] : Math.round(end * FPS);
				if (from >= Math.round(end * FPS)) return null;
				return (
					<Sequence key={i} from={from} durationInFrames={Math.max(1, Math.min(to, Math.round(end * FPS)) - from + FADE)}>
						{i === 0 ? s.el : <FadeIn>{s.el}</FadeIn>}
					</Sequence>
				);
			})}
			<Audio src={staticFile('voice_over.mp3')} />
		</AbsoluteFill>
	);
};

export const Root: React.FC = () => {
	const testEnd = at(TEST_END_CUE);
	return (
		<>
			<Composition id="Test" component={() => <Episode end={testEnd} />} durationInFrames={Math.round(testEnd * FPS)} fps={FPS} width={1920} height={1080} />
			<Composition id="Full" component={() => <Episode end={AUDIO_END} />} durationInFrames={Math.round(AUDIO_END * FPS)} fps={FPS} width={1920} height={1080} />
		</>
	);
};
