import { useState, useCallback } from 'react';

export function useCounter() {
  const [visits] = useState<number>(12580);
  const [comments] = useState<number>(342);
  const [isLoaded] = useState(true);

  const incrementVisit = useCallback(async () => {}, []);
  const incrementComment = useCallback(async () => {}, []);

  return { visits, comments, isLoaded, incrementVisit, incrementComment };
}