<script setup lang="ts">
import { computed, ref } from 'vue'

export interface ChartPoint {
  label: string
  value: number
}

export interface ForecastBand {
  label: string
  value: number
  low: number
  high: number
}

const props = withDefaults(
  defineProps<{
    points: ChartPoint[]
    forecast?: ForecastBand[]
    formatValue?: (n: number) => string
  }>(),
  {
    forecast: () => [],
    formatValue: (n: number) => `${Math.round(n).toLocaleString('en-US')}`,
  },
)

const W = 640
const H = 230
const PAD = { l: 46, r: 12, t: 12, b: 26 }
const hover = ref<number | null>(null)

const maxV = computed(() => {
  const vals = [
    ...props.points.map((p) => p.value),
    ...props.forecast.map((f) => f.high),
  ]
  return Math.max(1, ...vals) * 1.08
})

const iw = W - PAD.l - PAD.r
const ih = H - PAD.t - PAD.b

function x(i: number, total: number) {
  return PAD.l + (total <= 1 ? iw / 2 : (i / (total - 1)) * iw)
}
function y(v: number) {
  return PAD.t + ih - (v / maxV.value) * ih
}

/** Catmull-Rom → cubic bezier for a smooth line through values. */
function smoothPath(xs: number[], ys: number[]) {
  if (xs.length === 0) return ''
  if (xs.length === 1) return `M ${xs[0]},${ys[0]}`
  let d = `M ${xs[0]},${ys[0]}`
  for (let i = 0; i < xs.length - 1; i++) {
    const p0 = i === 0 ? 0 : i - 1
    const p3 = i + 2 >= xs.length ? xs.length - 1 : i + 2
    const c1x = xs[i]! + (xs[i + 1]! - xs[p0]!) / 6
    const c1y = ys[i]! + (ys[i + 1]! - ys[p0]!) / 6
    const c2x = xs[i + 1]! - (xs[p3]! - xs[i]!) / 6
    const c2y = ys[i + 1]! - (ys[p3]! - ys[i]!) / 6
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${xs[i + 1]!.toFixed(1)},${ys[i + 1]!.toFixed(1)}`
  }
  return d
}

const n = computed(() => props.points.length)
const m = computed(() => props.forecast.length)
const total = computed(() => n.value + m.value)

const actualXs = computed(() => props.points.map((_, i) => x(i, total.value)))
const actualYs = computed(() => props.points.map((p) => y(p.value)))
const actualLine = computed(() => smoothPath(actualXs.value, actualYs.value))
const actualArea = computed(
  () =>
    `${actualLine.value} L ${actualXs.value[actualXs.value.length - 1]},${y(0)} L ${actualXs.value[0]},${y(0)} Z`,
)

const fcXs = computed(() =>
  props.forecast.map((_, j) => x(n.value + j, total.value)),
)
const fcLineXs = computed(() => [actualXs.value[actualXs.value.length - 1]!, ...fcXs.value])
const fcLineYs = computed(() => [
  actualYs.value[actualYs.value.length - 1]!,
  ...props.forecast.map((f) => y(f.value)),
])
const fcLine = computed(() => smoothPath(fcLineXs.value, fcLineYs.value))
const fcBand = computed(() => {
  if (props.forecast.length === 0) return ''
  const top = smoothPath(fcLineXs.value, [
    actualYs.value[actualYs.value.length - 1]!,
    ...props.forecast.map((f) => y(f.high)),
  ])
  const botPts = [
    actualYs.value[actualYs.value.length - 1]!,
    ...props.forecast.map((f) => y(f.low)),
  ]
  const rev = smoothPath([...fcLineXs.value].reverse(), [...botPts].reverse())
  return `${top} ${rev.replace(/^M [^C]+/, '')} Z`
})

const grid = computed(() => [0.25, 0.5, 0.75, 1].map((f) => ({ v: maxV.value * f, y: y(maxV.value * f) })))

const xTicks = computed(() => {
  const all = [...props.points.map((p) => p.label), ...props.forecast.map((f) => f.label)]
  const indexed = all.map((label, i) => ({ label, x: x(i, total.value), i }))
  if (all.length <= 8) return indexed
  const step = Math.ceil(all.length / 6)
  return indexed.filter((t) => t.i % step === 0 || t.i === all.length - 1)
})

const hovered = computed(() => {
  if (hover.value === null) return null
  const all = [...props.points, ...props.forecast.map((f) => ({ label: f.label, value: f.value }))]
  const item = all[hover.value]
  if (!item) return null
  return {
    ...item,
    x: x(hover.value, total.value),
    isForecast: hover.value >= n.value,
  }
})

function onMove(e: MouseEvent) {
  const el = e.currentTarget as SVGSVGElement
  const rect = el.getBoundingClientRect()
  const px = ((e.clientX - rect.left) / rect.width) * W
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < total.value; i++) {
    const d = Math.abs(x(i, total.value) - px)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  hover.value = best
}
</script>

<template>
  <div class="relative">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="block w-full"
      role="img"
      @mousemove="onMove"
      @mouseleave="hover = null"
    >
      <g v-for="g in grid" :key="g.y">
        <line :x1="PAD.l" :x2="W - PAD.r" :y1="g.y" :y2="g.y" stroke="#EDEDED" :stroke-width="1" />
        <text :x="PAD.l - 6" :y="g.y + 3.5" text-anchor="end" font-size="10" fill="#8A8A8A">
          {{ formatValue(g.v) }}
        </text>
      </g>

      <path v-if="fcBand" :d="fcBand" fill="#273BE2" opacity="0.08" />
      <path v-if="n > 0" :d="actualArea" fill="#273BE2" opacity="0.1" />
      <path
        v-if="n > 1"
        :d="actualLine"
        fill="none"
        stroke="#121212"
        :stroke-width="2"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
      <path
        v-if="m > 0"
        :d="fcLine"
        fill="none"
        stroke="#273BE2"
        :stroke-width="1.8"
        stroke-dasharray="5 4"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      />
      <circle
        v-if="n > 0"
        :cx="actualXs[actualXs.length - 1]"
        :cy="actualYs[actualYs.length - 1]"
        r="3.5"
        fill="#121212"
      />

      <g v-for="t in xTicks" :key="t.label + t.x">
        <text :x="t.x" :y="H - 8" text-anchor="middle" font-size="10" fill="#8A8A8A">
          {{ t.label }}
        </text>
      </g>

      <line
        v-if="hovered"
        :x1="hovered.x"
        :x2="hovered.x"
        :y1="PAD.t"
        :y2="H - PAD.b"
        stroke="#8A8A8A"
        stroke-dasharray="3 3"
        :stroke-width="1"
      />
      <circle v-if="hovered" :cx="hovered.x" :cy="y(hovered.value)" r="4" fill="#273BE2" stroke="#fff" :stroke-width="1.5" />
    </svg>

    <div
      v-if="hovered"
      class="unmodified-font-sans pointer-events-none absolute z-10 -translate-x-1/2 rounded-[8px] border border-[#E3E3E3] bg-white px-2 py-1 text-center shadow-sm"
      :style="{ left: `${(hovered.x / W) * 100}%`, top: '0' }"
    >
      <div class="text-[11px] font-medium whitespace-nowrap text-[#121212]">
        {{ formatValue(hovered.value) }}{{ hovered.isForecast ? ' ⏳' : '' }}
      </div>
      <div class="text-[10px] whitespace-nowrap text-[#8A8A8A]">{{ hovered.label }}{{ hovered.isForecast ? ' · projected' : '' }}</div>
    </div>
  </div>
</template>
