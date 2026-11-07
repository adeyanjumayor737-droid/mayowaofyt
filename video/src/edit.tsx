import React from 'react';
import cues from './cues.json';
import {SkyPlane, Chapter, Diagram, Stat, Cards, RouteMap, Bars, Statement, Chain, BankView, Clock, Photo} from './Shots';

// Each shot starts at a subtitle cue (number from narration_clean.srt) and runs until the next shot.
// `off` nudges the start in seconds.
export type Shot = {cue: number; off?: number; el: React.ReactNode};
export const at = (cue: number, off = 0) => (cues as unknown as Record<string, [number, number, string]>)[String(cue)][0] + off;

export const SHOTS: Shot[] = [
	// 01 Cold open
	{cue: 1, el: <SkyPlane sea />},
	{cue: 3, el: <Statement lines={['The one thing', 'every pilot depends on', 'is missing']} yellow={[2]} />},
	{cue: 4, el: <Diagram tag="No front window" highlight={['tank']} sightline xray />},
	{cue: 7, el: <RouteMap highlightOcean />},
	{cue: 9, el: <Stat value={1927} raw label="New York to Paris" />},
	{cue: 10, el: <SkyPlane dusk tag="One pilot. One engine. No front window." dir={-1} />},
	{cue: 12, el: <SkyPlane title={['The Spirit of', 'St. Louis']} />},
	{cue: 13, el: <Statement lines={['Charles Lindbergh', 'Pilot, age 25']} yellow={[1]} />},
	{cue: 14, el: <Cards header="The attempt" items={[
		{big: 'NYC', label: 'Take off', badge: '1'},
		{big: '1', label: 'Pilot', badge: '2'},
		{big: '0', label: 'Stops', badge: '3'},
		{big: 'PARIS', label: 'Land', badge: '4', hot: true},
	]} />},
	{cue: 15, el: <Cards header="The missing window was not…" atSec={[3.2, 6.1, 7.8]} items={[
		{big: '✕', label: 'An accident', badge: '1'},
		{big: '✕', label: 'A mistake', badge: '2'},
		{big: '✕', label: 'Unfinished', badge: '3'},
	]} />},
	{cue: 19, el: <Statement lines={['It was', 'deliberately', 'eliminated']} yellow={[1]} />},
	{cue: 20, el: <Diagram tag="A small periscope" highlight={['periscope']} periscopeView xray />},
	{cue: 22, el: <BankView header="Bank the plane to see ahead" />},
	{cue: 23, el: <Statement lines={['Why build a plane', 'you can’t see out of?']} yellow={[1]} />},
	{cue: 25, el: <Clock hours={33.5} label="Across an ocean, barely able to see out" />},
	{cue: 27, el: <Diagram tag="One decision changed the whole design" labels xray />},

	// 02 The cockpit
	{cue: 29, el: <Chapter num={1} label="The most unusual cockpit in aviation history" />},
	{cue: 30, el: <SkyPlane tag="Ryan NYP · Spirit of St. Louis" />},
];

export const TEST_END_CUE = 33;
