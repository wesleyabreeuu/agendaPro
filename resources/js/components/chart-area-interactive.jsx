import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select } from "@/components/ui/select"

export const description = "An interactive area chart"

const chartConfig = {
  volume: {
    label: "Volume",
  },

  km: {
    label: "Km",
    color: "var(--chart-1)",
  },

  altimetria: {
    label: "Altimetria",
    color: "var(--chart-2)",
  }
}

function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number(value || 0))
}

export function ChartAreaInteractive({
  data = [],
  title = "Area Chart - Interactive",
  description: chartDescription = "Showing total visitors for the last 3 months",
}) {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = data.filter((item) => {
    if (!item.date) {
      return true
    }

    const date = new Date(item.date)
    const referenceDate = data.reduce((latest, current) => {
      const currentDate = new Date(current.date)
      return currentDate > latest ? currentDate : latest
    }, new Date(item.date))
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const totals = filteredData.reduce((acc, item) => ({
    km: acc.km + Number(item.km || 0),
    altimetria: acc.altimetria + Number(item.altimetria || 0),
  }), { km: 0, altimetria: 0 })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {chartDescription} {formatNumber(totals.km, 1)} km • {formatNumber(totals.altimetria)} m
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onChange={(event) => setTimeRange(event.target.value)}
          className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
          aria-label="Selecione o período"
        >
          <option value="90d">Últimos 3 meses</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="7d">Últimos 7 dias</option>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-km)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-km)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-altimetria)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-altimetria)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                  }}
                  indicator="dot" />
              } />
            <Area
              dataKey="altimetria"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-altimetria)"
              stackId="a" />
            <Area
              dataKey="km"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-km)"
              stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
