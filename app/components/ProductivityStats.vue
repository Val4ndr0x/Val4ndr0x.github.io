<script setup lang="ts">
import { completedToday, completedThisWeek, last7DaysCounts } from '~/utils/taskStats'

const { lists } = useLists()

const today = computed(() => completedToday(lists.value))
const week = computed(() => completedThisWeek(lists.value))
const last7 = computed(() => last7DaysCounts(lists.value))
const maxCount = computed(() => Math.max(1, ...last7.value.map((d) => d.count)))

const { totalPoints, pointsToday, pointsThisMonth, byPerson, lastDays, lastMonths } = usePointsLedger()
const pointsDays = computed(() => lastDays(7))
const pointsMonths = computed(() => lastMonths(6))
const maxDayPoints = computed(() => Math.max(1, ...pointsDays.value.map((d) => d.points)))
const maxMonthPoints = computed(() => Math.max(1, ...pointsMonths.value.map((d) => d.points)))
</script>

<template>
  <div class="mx-3 sm:mx-6 mb-6 rounded-[28px] p-4 sm:p-6 flex flex-col gap-6" style="background: linear-gradient(135deg, #eaf1fb 0%, #fdeef4 45%, #fff6e2 100%);">
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl p-4 flex flex-col gap-1">
        <span class="text-xs font-medium text-black/50">Hoy</span>
        <span class="text-3xl font-bold text-black/80">{{ today }}</span>
        <span class="text-xs text-black/45">tareas completadas</span>
      </div>
      <div class="bg-white rounded-2xl p-4 flex flex-col gap-1">
        <span class="text-xs font-medium text-black/50">Esta semana</span>
        <span class="text-3xl font-bold text-black/80">{{ week }}</span>
        <span class="text-xs text-black/45">tareas completadas</span>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-4">
      <span class="text-xs font-medium text-black/50 block mb-3">Últimos 7 días</span>
      <div class="flex items-end justify-between gap-2 h-28">
        <div v-for="day in last7" :key="day.key" class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <div
            class="w-full max-w-8 rounded-t-md bg-[#f4a8c4] transition-[height]"
            :style="{ height: `${Math.max(4, (day.count / maxCount) * 100)}%` }"
            :title="`${day.count} completadas`"
          />
          <span class="text-[10px] text-black/45">{{ day.label }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl p-4 flex flex-col gap-1">
        <span class="text-xs font-medium text-black/50">Puntos hoy</span>
        <span class="text-2xl sm:text-3xl font-bold text-black/80">{{ pointsToday }}</span>
      </div>
      <div class="bg-white rounded-2xl p-4 flex flex-col gap-1">
        <span class="text-xs font-medium text-black/50">Puntos del mes</span>
        <span class="text-2xl sm:text-3xl font-bold text-black/80">{{ pointsThisMonth }}</span>
      </div>
      <div class="bg-white rounded-2xl p-4 flex flex-col gap-1">
        <span class="text-xs font-medium text-black/50">Puntos totales</span>
        <span class="text-2xl sm:text-3xl font-bold text-black/80">{{ totalPoints }}</span>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-4">
      <span class="text-xs font-medium text-black/50 block mb-3">Puntos redimidos por persona</span>
      <p v-if="!byPerson.length" class="text-xs text-black/45">Aún no se han redimido puntos. Completa una tarea con responsable, o sirve un pedido con cliente, para verlos aquí.</p>
      <table v-else class="w-full text-sm text-black/80">
        <thead>
          <tr class="text-[11px] text-black/45 text-right">
            <th class="text-left font-medium pb-2">Persona</th>
            <th class="font-medium pb-2">Hoy</th>
            <th class="font-medium pb-2">Mes</th>
            <th class="font-medium pb-2">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in byPerson" :key="p.name" class="border-t border-black/5 text-right">
            <td class="text-left py-2 truncate max-w-[10rem]">{{ p.name }}</td>
            <td class="py-2">{{ p.today }}</td>
            <td class="py-2">{{ p.month }}</td>
            <td class="py-2 font-semibold">{{ p.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bg-white rounded-2xl p-4">
      <span class="text-xs font-medium text-black/50 block mb-3">Puntos por día (últimos 7 días)</span>
      <div class="flex items-end justify-between gap-2 h-28">
        <div v-for="day in pointsDays" :key="day.key" class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <span class="text-[10px] text-black/60">{{ day.points }}</span>
          <div class="w-full max-w-8 rounded-t-md bg-[#a8c4f4] transition-[height]" :style="{ height: `${Math.max(4, (day.points / maxDayPoints) * 80)}%` }" />
          <span class="text-[10px] text-black/45">{{ day.label }}</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-4">
      <span class="text-xs font-medium text-black/50 block mb-3">Puntos por mes (últimos 6 meses)</span>
      <div class="flex items-end justify-between gap-2 h-28">
        <div v-for="m in pointsMonths" :key="m.key" class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <span class="text-[10px] text-black/60">{{ m.points }}</span>
          <div class="w-full max-w-10 rounded-t-md bg-[#c4a8f4] transition-[height]" :style="{ height: `${Math.max(4, (m.points / maxMonthPoints) * 80)}%` }" />
          <span class="text-[10px] text-black/45">{{ m.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
