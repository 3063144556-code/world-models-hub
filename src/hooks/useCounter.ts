import { useState, useEffect, useCallback } from 'react';

interface CounterData {
  visits: number;
  comments: number;
  lastUpdated: string;
}

// 简单的哈希函数
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

// 生成设备指纹
function generateDeviceFingerprint(): string {
  const features = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.hardwareConcurrency || 'unknown',
  ];
  return simpleHash(features.join('|'));
}

// 生成访客ID
function generateVisitorId(): string {
  const deviceId = generateDeviceFingerprint();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return simpleHash(deviceId + timestamp + random);
}

const COUNTER_API_URL = '/api/counter.json';
const VISITOR_KEY = 'wmh_visitor_id';
const LAST_VISIT_KEY = 'wmh_last_visit';

export function useCounter() {
  const [visits, setVisits] = useState<number>(0);
  const [comments, setComments] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从服务器加载计数器数据
  useEffect(() => {
    const loadCounter = async () => {
      try {
        const response = await fetch(COUNTER_API_URL + '?t=' + Date.now());
        if (response.ok) {
          const data: CounterData = await response.json();
          setVisits(data.visits);
          setComments(data.comments);
        }
      } catch (error) {
        console.error('Failed to load counter:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCounter();
  }, []);

  // 增加访问计数
  const incrementVisit = useCallback(async () => {
    // 获取或生成访客ID
    let visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem(VISITOR_KEY, visitorId);
    }

    // 检查是否是新访问会话（24小时内只算一次）
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastVisit || (now - parseInt(lastVisit)) > oneDay) {
      // 新访问会话，更新计数
      setVisits(prev => prev + 1);
      localStorage.setItem(LAST_VISIT_KEY, now.toString());

      // 在实际部署中，这里应该调用后端API来更新计数
      // 对于静态站点，计数会在下次构建时从Google Analytics等获取
    }
  }, []);

  // 增加留言计数
  const incrementComment = useCallback(async () => {
    setComments(prev => prev + 1);
  }, []);

  return {
    visits,
    comments,
    isLoaded,
    incrementVisit,
    incrementComment,
  };
}
