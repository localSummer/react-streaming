// 外部 effectOptions 不受类型系统保护，统一把非法数值收敛到默认值。
export const getNonNegativeNumber = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
