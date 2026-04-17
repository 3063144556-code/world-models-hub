import { useState, useEffect, useCallback } from 'react';

interface CounterData {
  visits: number;
  comments: number;
}

const COUNTER_KEY = 'wmh_counter_data';
const VISITOR_KEY = 'wmh_visitor_id';
const VISITED_KEY = 'wmh_visited_today';

// 初始化计数器数据
const initCounterData = (): CounterData => ({
  visits: 12580,
  comments: 342
});

export function useCounter() {
  const [counters, setCounters] = useState<CounterData>(initCounterData());
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载计数器数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COUNTER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCounters({
          visits: parsed.visits || 12580,
          comments: parsed.comments || 342
        });
      } else {
        // 首次访问，初始化数据
        localStorage.setItem(COUNTER_KEY, JSON.stringify(initCounterData()));
      }
    } catch (e) {
      console.error('Failed to load counters:', e);
    }
    setIsLoaded(true);
  }, []);

  // 保存计数器数据到 localStorage
  const saveCounters = useCallback((data: CounterData) => {
    try {
      localStorage.setItem(COUNTER_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save counters:', e);
    }
  }, []);

  // 增加访问计数
  const incrementVisit = useCallback(() => {
    setCounters(prev => {
      // 检查今天是否已经计数过
      const visitedToday = sessionStorage.getItem(VISITED_KEY);
      if (visitedToday) {
        return prev; // 今天已经访问过，不再增加
      }

      // 标记今天已访问
      sessionStorage.setItem(VISITED_KEY, 'true');

      const newData = {
        ...prev,
        visits: prev.visits + 1
      };
      saveCounters(newData);
      return newData;
    });
  }, [saveCounters]);

  // 增加留言计数
  const incrementComment = useCallback(() => {
    setCounters(prev => {
      const newData = {
        ...prev,
        comments: prev.comments + 1
      };
      saveCounters(newData);
      return newData;
    });
  }, [saveCounters]);

  // 获取访客ID（用于标识唯一访客）
  const getVisitorId = useCallback(() => {
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(VISITOR_KEY, visitorId);
    }
    return visitorId;
  }, []);

  // 检查是否为新访客
  const isNewVisitor = useCallback(() => {
    return !localStorage.getItem(VISITOR_KEY);
  }, []);

  return {
    visits: counters.visits,
    comments: counters.comments,
    incrementVisit,
    incrementComment,
    getVisitorId,
    isNewVisitor,
    isLoaded
  };
}

export default useCounter;
