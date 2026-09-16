import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useFusionEngine } from '../hooks/useFusionEngine';
import { SEED_INCIDENTS, SEED_REVIEWS, SEED_ROUTE_RATINGS } from '../data/seed';
import { CommunityReview, IncidentReport, RouteRating } from '../types';

const REVIEWS_KEY = 'secura:reviews';
const INCIDENTS_KEY = 'secura:incidents';
const ROUTE_RATINGS_KEY = 'secura:route-ratings';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface AppDataContextValue {
  breakdowns: ReturnType<typeof useFusionEngine>['breakdowns'];
  history: ReturnType<typeof useFusionEngine>['history'];
  lastPhoneReports: ReturnType<typeof useFusionEngine>['lastPhoneReports'];
  lastVerkadaEvents: ReturnType<typeof useFusionEngine>['lastVerkadaEvents'];

  reviews: CommunityReview[];
  addReview: (r: Omit<CommunityReview, 'id' | 'timestamp'>) => void;

  incidents: IncidentReport[];
  addIncident: (r: Omit<IncidentReport, 'id' | 'timestamp'>) => void;

  routeRatings: RouteRating[];
  addRouteRating: (r: Omit<RouteRating, 'id' | 'timestamp'>) => void;
  avgRatingForRoute: (routeKey: string) => number | null;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<CommunityReview[]>(SEED_REVIEWS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(SEED_INCIDENTS);
  const [routeRatings, setRouteRatings] = useState<RouteRating[]>(SEED_ROUTE_RATINGS);
  const [loaded, setLoaded] = useState(false);

  const engine = useFusionEngine(reviews);

  useEffect(() => {
    (async () => {
      try {
        const [r, i, rr] = await Promise.all([
          AsyncStorage.getItem(REVIEWS_KEY),
          AsyncStorage.getItem(INCIDENTS_KEY),
          AsyncStorage.getItem(ROUTE_RATINGS_KEY),
        ]);
        // Only overrides the seed defaults once a session has actually
        // persisted its own state (i.e. not the very first launch).
        if (r) setReviews(JSON.parse(r));
        if (i) setIncidents(JSON.parse(i));
        if (rr) setRouteRatings(JSON.parse(rr));
      } catch (e) {
        // Session-local demo data only; safe to ignore load failures.
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews)).catch(() => {});
  }, [reviews, loaded]);
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(INCIDENTS_KEY, JSON.stringify(incidents)).catch(() => {});
  }, [incidents, loaded]);
  useEffect(() => {
    if (loaded)
      AsyncStorage.setItem(ROUTE_RATINGS_KEY, JSON.stringify(routeRatings)).catch(() => {});
  }, [routeRatings, loaded]);

  const addReview = useCallback((r: Omit<CommunityReview, 'id' | 'timestamp'>) => {
    setReviews((prev) => [{ ...r, id: uid(), timestamp: Date.now() }, ...prev]);
  }, []);

  const addIncident = useCallback(
    (r: Omit<IncidentReport, 'id' | 'timestamp'>) => {
      setIncidents((prev) => [{ ...r, id: uid(), timestamp: Date.now() }, ...prev]);
      engine.reportIncident(r.zoneId);
    },
    [engine]
  );

  const addRouteRating = useCallback((r: Omit<RouteRating, 'id' | 'timestamp'>) => {
    setRouteRatings((prev) => [{ ...r, id: uid(), timestamp: Date.now() }, ...prev]);
  }, []);

  const avgRatingForRoute = useCallback(
    (routeKey: string) => {
      const matches = routeRatings.filter((r) => r.routeKey === routeKey);
      if (matches.length === 0) return null;
      return matches.reduce((s, r) => s + r.rating, 0) / matches.length;
    },
    [routeRatings]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      breakdowns: engine.breakdowns,
      history: engine.history,
      lastPhoneReports: engine.lastPhoneReports,
      lastVerkadaEvents: engine.lastVerkadaEvents,
      reviews,
      addReview,
      incidents,
      addIncident,
      routeRatings,
      addRouteRating,
      avgRatingForRoute,
    }),
    [
      engine.breakdowns,
      engine.history,
      engine.lastPhoneReports,
      engine.lastVerkadaEvents,
      reviews,
      addReview,
      incidents,
      addIncident,
      routeRatings,
      addRouteRating,
      avgRatingForRoute,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
