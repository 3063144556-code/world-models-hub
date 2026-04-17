import { useState, useCallback, useEffect } from 'react';

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

// 生成设备指纹（基于浏览器特征）
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

interface Stats {
  visits: number;
  uniqueVisitors: string[];
  lastUpdated: string;
}

export function useStats() {
  const [visits, setVisits] = useState<number>(0);
  const [uniqueVisitors, setUniqueVisitors] = useState<string[]>([]);

  // 初始化统计数据
  useEffect(() => {
    const savedStats = localStorage.getItem('wmh_stats');
    if (savedStats) {
      const stats: Stats = JSON.parse(savedStats);
      setVisits(stats.visits);
      setUniqueVisitors(stats.uniqueVisitors);
    } else {
      // 初始化默认数据
      const defaultStats: Stats = {
        visits: 0,
        uniqueVisitors: [],
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('wmh_stats', JSON.stringify(defaultStats));
    }
  }, []);

  // 保存统计数据
  const saveStats = useCallback((newStats: Stats) => {
    localStorage.setItem('wmh_stats', JSON.stringify(newStats));
    setVisits(newStats.visits);
    setUniqueVisitors(newStats.uniqueVisitors);
  }, []);

  // 增加访问计数
  const incrementVisit = useCallback(() => {
    const savedStats = localStorage.getItem('wmh_stats');
    const stats: Stats = savedStats ? JSON.parse(savedStats) : {
      visits: 0,
      uniqueVisitors: [],
      lastUpdated: new Date().toISOString(),
    };

    // 获取或生成访客ID
    let visitorId = localStorage.getItem('wmh_visitor_id');
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem('wmh_visitor_id', visitorId);
    }

    // 检查是否是新访客（24小时内只算一次）
    const lastVisitKey = `wmh_last_visit_${visitorId}`;
    const lastVisit = localStorage.getItem(lastVisitKey);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastVisit || (now - parseInt(lastVisit)) > oneDay) {
      // 新访问会话
      stats.visits += 1;
      
      // 记录唯一访客
      if (!stats.uniqueVisitors.includes(visitorId)) {
        stats.uniqueVisitors.push(visitorId);
        // 只保留最近1000个唯一访客
        if (stats.uniqueVisitors.length > 1000) {
          stats.uniqueVisitors = stats.uniqueVisitors.slice(-1000);
        }
      }

      stats.lastUpdated = new Date().toISOString();
      saveStats(stats);
      localStorage.setItem(lastVisitKey, now.toString());
    }
  }, [saveStats]);

  // 获取唯一访客数
  const getUniqueVisitorCount = useCallback(() => {
    return uniqueVisitors.length;
  }, [uniqueVisitors]);

  return {
    visits,
    uniqueVisitors,
    incrementVisit,
    getUniqueVisitorCount,
  };
}
