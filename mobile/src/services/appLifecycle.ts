import { AppState, type AppStateStatus } from 'react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type RealtimeStatus = 'stopped' | 'connecting' | 'connected' | 'degraded';
type LifecycleCallbacks = {
  refresh: () => Promise<void>;
  status: (status: RealtimeStatus) => void;
};

class AppLifecycleService {
  private userId: string | null = null;
  private channel: RealtimeChannel | null = null;
  private appState: AppStateStatus = AppState.currentState;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshInFlight = false;
  private refreshQueued = false;
  private generation = 0;
  private subscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private callbacks: LifecycleCallbacks | null = null;

  start(userId: string, callbacks: LifecycleCallbacks) {
    this.stop();
    this.userId = userId;
    this.callbacks = callbacks;
    this.subscription = AppState.addEventListener('change', state => { void this.onAppState(state); });
    if (this.appState === 'active') {
      void supabase?.auth.startAutoRefresh();
      this.activate();
    } else {
      void supabase?.auth.stopAutoRefresh();
    }
  }

  stop() {
    this.generation += 1;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
    this.subscription?.remove();
    this.subscription = null;
    if (this.channel && supabase) void supabase.removeChannel(this.channel);
    void supabase?.auth.stopAutoRefresh();
    this.channel = null;
    this.userId = null;
    this.callbacks?.status('stopped');
    this.callbacks = null;
  }

  private async onAppState(state: AppStateStatus) {
    const previous = this.appState;
    this.appState = state;
    if (state === 'active' && previous !== 'active' && this.userId) {
      void supabase?.auth.startAutoRefresh();
      this.refresh();
      this.activate();
    } else if (state !== 'active' && previous === 'active') {
      void supabase?.auth.stopAutoRefresh();
      this.deactivate();
    }
  }

  private activate() {
    if (!supabase || !this.userId || this.channel) return;
    const generation = ++this.generation;
    this.callbacks?.status('connecting');
    const refresh = () => this.refresh();
    this.channel = supabase.channel(`nearly-live-${this.userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hearts' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, refresh)
      .subscribe(status => {
        if (generation !== this.generation) return;
        if (status === 'SUBSCRIBED') this.callbacks?.status('connected');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') this.callbacks?.status('degraded');
      });
  }

  private deactivate() {
    this.generation += 1;
    if (this.channel && supabase) void supabase.removeChannel(this.channel);
    this.channel = null;
    this.callbacks?.status('stopped');
  }

  private refresh() {
    if (this.appState !== 'active' || !this.callbacks) return;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.runRefresh();
    }, 180);
  }

  private async runRefresh() {
    if (!this.callbacks || this.appState !== 'active') return;
    if (this.refreshInFlight) {
      this.refreshQueued = true;
      return;
    }
    this.refreshInFlight = true;
    try {
      await this.callbacks.refresh();
    } finally {
      this.refreshInFlight = false;
      if (this.refreshQueued) {
        this.refreshQueued = false;
        this.refresh();
      }
    }
  }
}

export const appLifecycle = new AppLifecycleService();
