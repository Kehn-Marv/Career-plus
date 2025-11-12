/**
 * Performance monitoring utilities for tracking FPS and render performance
 * Helps ensure 60fps target is maintained across devices
 */

export interface PerformanceMetrics {
  fps: number;
  avgFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
  droppedFrames: number;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private frameTimes: number[] = [];
  private readonly maxSamples = 60; // Track last 60 frames
  private readonly targetFrameTime = 1000 / 60; // ~16.67ms (60fps)
  private isMonitoring = false;
  private animationFrameId: number | null = null;

  /**
   * Start monitoring performance
   */
  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimes = [];
    
    this.measureFrame();
  }

  /**
   * Stop monitoring performance
   */
  stop(): void {
    this.isMonitoring = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Measure frame timing
   */
  private measureFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastTime;
    
    this.frameTimes.push(frameTime);
    
    // Keep only the last N samples
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
    
    this.lastTime = currentTime;
    this.frameCount++;
    
    this.animationFrameId = requestAnimationFrame(this.measureFrame);
  };

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    if (this.frameTimes.length === 0) {
      return {
        fps: 0,
        avgFrameTime: 0,
        maxFrameTime: 0,
        minFrameTime: 0,
        droppedFrames: 0,
      };
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = 1000 / avgFrameTime;
    const maxFrameTime = Math.max(...this.frameTimes);
    const minFrameTime = Math.min(...this.frameTimes);
    
    // Count frames that took longer than target (dropped frames)
    const droppedFrames = this.frameTimes.filter(
      time => time > this.targetFrameTime * 1.5 // 50% over target
    ).length;

    return {
      fps: Math.round(fps),
      avgFrameTime: Math.round(avgFrameTime * 100) / 100,
      maxFrameTime: Math.round(maxFrameTime * 100) / 100,
      minFrameTime: Math.round(minFrameTime * 100) / 100,
      droppedFrames,
    };
  }

  /**
   * Check if performance is acceptable (>= 55 FPS)
   */
  isPerformanceAcceptable(): boolean {
    const metrics = this.getMetrics();
    return metrics.fps >= 55; // Allow 5 FPS tolerance
  }

  /**
   * Log performance metrics to console
   */
  logMetrics(): void {
    const metrics = this.getMetrics();
    console.log('Performance Metrics:', {
      fps: `${metrics.fps} FPS`,
      avgFrameTime: `${metrics.avgFrameTime}ms`,
      maxFrameTime: `${metrics.maxFrameTime}ms`,
      minFrameTime: `${metrics.minFrameTime}ms`,
      droppedFrames: metrics.droppedFrames,
      status: this.isPerformanceAcceptable() ? '✅ Good' : '⚠️ Poor',
    });
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.frameCount = 0;
    this.frameTimes = [];
    this.lastTime = performance.now();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for monitoring component performance
 */
export function usePerformanceMonitor(enabled = false): PerformanceMetrics | null {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    performanceMonitor.start();

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000); // Update every second

    return () => {
      clearInterval(interval);
      performanceMonitor.stop();
    };
  }, [enabled]);

  return metrics;
}

// Import React for the hook
import React from 'react';
