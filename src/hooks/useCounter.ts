import { useState, useEffect, useCallback } from 'react';

const COUNTER_API_URL = '/api/counter.json';

export function useCounter() {
  const [visits, setVisits] = useState<number>(12580);
  const [comments, setComments] = useState<number>(342);
  const [isLoaded, setIsLoaded] = useState(true);

  const incrementVisit = useCallback(async () => {
    setVisits(prev => prev + 1);
  }, []);

  const incrementComment = useCallback(async () => {
    setComments(prev => prev + 1);
  }, []);

  return { visits, comments, isLoaded, incrementVisit, incrementComment };
}