export class Chart {
  constructor(element, config) {
    if (typeof Chart !== "undefined") {
      return new Chart(element, config)
    }
    console.warn("Chart.js is not loaded. Please include it in your project.")
  }
}

export const ChartContainer = () => {
  return null
}

export const ChartTooltip = () => {
  return null
}

export const ChartTooltipContent = () => {
  return null
}

export const ChartLegend = () => {
  return null
}

export const ChartLegendContent = () => {
  return null
}

export const ChartStyle = () => {
  return null
}
