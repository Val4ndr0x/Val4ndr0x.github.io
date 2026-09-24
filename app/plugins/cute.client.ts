export default defineNuxtPlugin((nuxtApp) => {
  const cute = useCuteTheme()

  nuxtApp.hook('app:mounted', () => {
    cute.init()
    // El tema automático sigue a la hora del día.
    window.setInterval(cute.refreshHour, 5 * 60_000)
    useRewards().checkAchievements()
  })
})
