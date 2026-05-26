import Grid from 'antd/es/grid';

const { useBreakpoint } = Grid;

export function useResponsive() {
  const screens = useBreakpoint();

  return {
    isXs: !!screens?.xs,
    isSm: !!screens?.sm,
    isMd: !!screens?.md,
    isLg: !!screens?.lg,
    isXl: !!screens?.xl,
    isXxl: !!screens?.xxl,
    isMobile: !screens?.lg,
    isDesktop: !!screens?.lg,
  };
}
