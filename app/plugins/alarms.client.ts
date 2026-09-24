export default defineNuxtPlugin(() => {
  const { checkAlarms } = useCalendar()
  checkAlarms()
  setInterval(() => checkAlarms(), 20000)
})
