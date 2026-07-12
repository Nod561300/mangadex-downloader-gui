export type PrimeVueThemePalette =
  | 'emerald'
  | 'green'
  | 'lime'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose'
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | string

const primarySteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

export function createPrimeVueTheme(theme: unknown, palette: PrimeVueThemePalette) {
  const baseTheme = theme as Record<string, any>

  return {
    ...baseTheme,
    semantic: {
      ...baseTheme.semantic,
      primary: primarySteps.reduce((acc, step) => {
        acc[step] = `{${palette}.${step}}`
        return acc
      }, {} as Record<number, string>)
    }
  }
}
