/**
 * input.js — pointer handling for tap / hold-to-fire.
 *
 * Works with touch, mouse and pen through Pointer Events. With several fingers
 * down, the most recently pressed/moved one aims; lifting it hands aim back to
 * the next finger. `aimX/aimY` are in world units relative to the Core.
 */
import { CONFIG } from './config.js';

export class Input {
  /**
   * @param {HTMLElement|null} el    element that receives the pointer events
   * @param {{cx:number, cy:number, scale:number}} view  live screen→world mapping (the renderer)
   */
  constructor(el, view) {
    this.el = el;
    this.view = view;
    this.pointers = new Map();     // pointerId → {x, y} in client px
    this.activeId = -1;
    this.aimX = 0;
    this.aimY = -100;
    this.hasAim = false;
    this.firing = false;           // true while any pointer is down
    this.tapAt = -1e9;
    this.tapUsed = true;

    this.onDown = this.onDown.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);
    this.reset = this.reset.bind(this);
  }

  attach() {
    const el = this.el;
    if (!el) return;
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointermove', this.onMove, { passive: true });
    el.addEventListener('pointerup', this.onUp, { passive: true });
    el.addEventListener('pointercancel', this.onUp, { passive: true });
    el.addEventListener('lostpointercapture', this.onUp, { passive: true });
    // Block context menus, drag, selection and pinch-zoom on the playfield.
    const stop = (e) => e.preventDefault();
    el.addEventListener('contextmenu', stop);
    el.addEventListener('dragstart', stop);
    el.addEventListener('selectstart', stop);
    document.addEventListener('gesturestart', stop);
    window.addEventListener('blur', this.reset);
  }

  toWorld(clientX, clientY) {
    const v = this.view;
    return { x: (clientX - v.cx) / v.scale, y: (clientY - v.cy) / v.scale };
  }

  setAim(e) {
    const w = this.toWorld(e.clientX, e.clientY);
    this.aimX = w.x;
    this.aimY = w.y;
    this.hasAim = true;
    this.activeId = e.pointerId;
  }

  onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.pointerType === 'mouse') {
      try { this.el.setPointerCapture(e.pointerId); } catch { /* not all browsers allow it */ }
    }
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.setAim(e);
    this.firing = true;
    this.tapAt = performance.now();
    this.tapUsed = false;
  }

  onMove(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p) return;                               // hover without a press → ignore
    p.x = e.clientX; p.y = e.clientY;
    if (e.pointerId === this.activeId) this.setAim(e);
  }

  onUp(e) {
    if (!this.pointers.delete(e.pointerId)) return;
    if (e.pointerId === this.activeId) {
      // hand aim to the most recent remaining finger, if any
      let last = null, lastId = -1;
      for (const [id, p] of this.pointers) { last = p; lastId = id; }
      if (last) {
        const w = this.toWorld(last.x, last.y);
        this.aimX = w.x; this.aimY = w.y; this.activeId = lastId;
      } else this.activeId = -1;
    }
    this.firing = this.pointers.size > 0;
  }

  /** True if a fresh tap happened recently enough to fire as soon as the weapon is ready. */
  peekTap() {
    return !this.tapUsed && performance.now() - this.tapAt <= CONFIG.core.tapBuffer * 1000;
  }

  consumeTap() { this.tapUsed = true; }

  /** Forget every pointer (pause, blur, screen change) so nothing gets stuck "firing". */
  reset() {
    this.pointers.clear();
    this.activeId = -1;
    this.firing = false;
    this.tapUsed = true;
  }
}