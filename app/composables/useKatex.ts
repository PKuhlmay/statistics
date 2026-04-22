import katex from 'katex'

export function useKatex() {
  function renderFormula(latex: string, displayMode = true): string {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    })
  }

  return { renderFormula }
}
