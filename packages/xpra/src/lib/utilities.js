export default {
  isFirefox: function () {
    const ua = navigator.userAgent.toLowerCase()
    return ua.includes('firefox')
  },
  isOpera: function () {
    const ua = navigator.userAgent.toLowerCase()
    return ua.includes('opera')
  },
  isSafari: function () {
    const ua = navigator.userAgent.toLowerCase()
    return ua.includes('safari') && !ua.includes('chrome')
  },
  isEdge: function () {
    return navigator.userAgent.includes('Edge')
  },
  isChrome: function () {
    const isChromium = window.hasOwnProperty('chrome'),
      winNav = window.navigator,
      vendorName = winNav.vendor,
      isOpera = winNav.userAgent.includes('OPR'),
      isIEedge = winNav.userAgent.includes('Edge'),
      isIOSChrome = winNav.userAgent.match('CriOS')
    if (isIOSChrome) {
      return true
    } else if (
      isChromium !== null &&
      isChromium !== undefined &&
      vendorName === 'Google Inc.' &&
      isOpera === false &&
      isIEedge === false
    ) {
      return true
    } else {
      return false
    }
  },
  isIE: function () {
    return (
      navigator.userAgent.includes('MSIE') ||
      navigator.userAgent.includes('Trident/')
    )
  },
  isMacOS: function () {
    return navigator.platform.includes('Mac')
  },

  isWindows: function () {
    return navigator.platform.includes('Win')
  },

  isLinux: function () {
    return navigator.platform.includes('Linux')
  },
}
