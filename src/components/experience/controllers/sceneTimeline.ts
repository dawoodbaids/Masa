import { mix, range, smooth } from "./math";
export const HANDOFF_IN = { start: .502, end: .515 };
export const EXPLOSION = { start: .525, end: .605 };
export const RECONSTRUCTION = { start: .885, end: .945 };
export const HANDOFF_OUT = { start: .952, end: .966 };
export const handoffIn = (p: number) => smooth(range(p, HANDOFF_IN.start, HANDOFF_IN.end));
export const handoffOut = (p: number) => smooth(range(p, HANDOFF_OUT.start, HANDOFF_OUT.end));
export function heroOpacity(p: number, ready: boolean) { if (!ready) return 1; return p < .75 ? 1 - handoffIn(p) : handoffOut(p); }
export function anatomyOpacity(p: number, ready: boolean) { return ready ? handoffIn(p) * (1 - handoffOut(p)) : 0; }
export function storyPose(p: number, mobile: boolean) {
  const chapter = Math.min(11, Math.floor(range(p, .055, .485) * 12));
  const pattern = mobile ? [0] : [-.38, .38, -.18, .4, -.34, .22];
  const close = smooth(range(p, .36, .5));
  return { x: p < .5 ? pattern[chapter % pattern.length] : 0, y: mobile ? mix(-.2, -.04, close) : mix(.02, 0, close), scale: mix(mobile ? .72 : .84, mobile ? .78 : .91, close), rotationY: -.16 + Math.sin(chapter * 1.7) * .09 * (1 - close) };
}
