import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import CalculatorPage from './HomePage';
import { DEFAULT_STATE, type CalculatorState } from '@/data/calculator';

const STORAGE_KEY = 'trade-profit-calculator-v2';

export default function HomePageContainer() {
  const [state, setState] = useState<CalculatorState>(() => {
    try {
      const saved = scopedStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // 忽略读取错误
    }
    return DEFAULT_STATE;
  });

  const handleUpdate = useCallback((patch: Partial<CalculatorState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSave = useCallback(() => {
    try {
      scopedStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      toast.success('参数已保存到本地', {
        description: '下次打开自动填充',
      });
    } catch {
      toast.error('保存失败');
    }
  }, [state]);

  const handleReset = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      scopedStorage.removeItem(STORAGE_KEY);
    } catch {
      // 忽略
    }
    toast.info('已重置所有参数');
  }, []);

  // 自动保存（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        scopedStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // 忽略
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <CalculatorPage
      state={state}
      onUpdate={handleUpdate}
      onSave={handleSave}
      onReset={handleReset}
    />
  );
}
