'use client';

/**
 * Motion type-shim. The monorepo currently has two `@types/react` versions
 * (one pulled in by react-native@0.76 transitively), which makes TS conflate
 * `ReactNode` types and reject children for `motion.*` components.
 *
 * Casting via this module keeps the pragmatic surface narrow: only landing
 * page components import from here, and runtime behaviour is unchanged.
 */

import { motion as fmMotion } from 'framer-motion';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const motion = fmMotion as any;
export const MotionDiv = fmMotion.div as any;
export const MotionSpan = fmMotion.span as any;
