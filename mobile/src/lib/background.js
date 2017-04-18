import { configureStore } from './store'
import { initServices } from './init'
import { logException, logInfo } from './reporter'
import { loadState } from './localStorage'
import { startMediaUpload, mediaBackup, endMediaUpload } from '../actions/mediaBackup'
import { backupAllowed } from './network'
import { initPolyglot } from '../../../src/lib/I18n'
import { isCordova, isIos, isAndroid, getDeviceName } from './device'

/*
  This files is split on 4 parts:
    - GENERIC: Platform agnostic
    - SERVICE: The service background
    - ANDROID: The Android-specific part
    - IOS: The iOS-specific part

  Only 3 functions are export:
    - updateStatusBackgroundService: to enbale/disable background service
    - startBackgroundService: to start background service
    - disableBackgroundService: to disable background service

  For each platform (Android, iOS) we have:
    - has__platform__CordovaPlugin: Checks if the plugin is installed
    - enable__platform__BackgroundService and disable__platform__BackgroundService
    - start__platform__BackgroundService: Allowing to add a specific callback at the end of the service
*/

// GENERIC

export const updateStatusBackgroundService = (backupImages) => {
  if (backupImages) {
    enableBackgroundService()
  } else {
    disableBackgroundService()
  }
}

export const startBackgroundService = () => {
  if (hasIosCordovaPlugin()) {
    startIosBackgroundService()
  } else if (hasAndroidCordovaPlugin()) {
    startAndroidBackgroundService()
  } else {
    notCompatibleError()
  }
}

const enableBackgroundService = () => {
  if (hasIosCordovaPlugin()) {
    enableIosBackgroundService()
  } else if (hasAndroidCordovaPlugin()) {
    enableAndroidBackgroundService()
  } else {
    notCompatibleError()
  }
}

export const disableBackgroundService = () => {
  if (hasIosCordovaPlugin()) {
    disableIosBackgroundService()
  } else if (hasAndroidCordovaPlugin()) {
    disableAndroidBackgroundService()
  } else {
    notCompatibleError()
  }
}

const notCompatibleError = () => {
  const msg = 'Background Service is not compatible with your platform.'
  console.warn(msg)
  if (isCordova()) {
    console.log(getDeviceName())
    if (isIos()) {
      console.log(window.BackgroundFetch)
    } else if (isAndroid()) {
      console.log(window.JSBackgroundService)
    }
  }
  logException(msg)
}

// SERVICE

const backgroundService = () => new Promise(resolve => {
  console.log('BackgroundFetch initiated')

  loadState().then(persistedState => {
    const store = configureStore(persistedState)
    initServices(store)

    logInfo('It\'s me Background Service!!!')

    const state = store.getState()
    if (state.mobile.settings.backupImages && backupAllowed(state.mobile.settings.wifiOnly)) {
      const end = () => {
        store.dispatch(endMediaUpload())
        resolve()
      }
      store.dispatch(startMediaUpload())

      const context = window.context
      const lang = (navigator && navigator.language) ? navigator.language.slice(0, 2) : 'en'
      const polyglot = initPolyglot(context, lang)
      const dir = polyglot.t('mobile.settings.media_backup.media_folder')

      store.dispatch(mediaBackup(dir)).then(end).catch(end)
    } else {
      resolve()
    }
  })
})

// ANDROID

const hasAndroidCordovaPlugin = () => (isAndroid() && window.JSBackgroundService !== undefined)

const enableAndroidBackgroundService = async () => {
  const isEnable = await isEnableAndroidBackgroundService()
  if (!isEnable) {
    const repeatingPeriod = 15 * 60 * 1000
    window.JSBackgroundService.setRepeating(repeatingPeriod, err => {
      if (err) {
        console.warn(err)
        logException('enableAndroidBackgroundService error')
      }
    })
  }
}

const disableAndroidBackgroundService = async () => {
  const isEnable = await isEnableAndroidBackgroundService()
  if (isEnable) {
    window.JSBackgroundService.cancelRepeating(err => {
      if (err) {
        console.warn(err)
        logException('disableAndroidBackgroundService error')
      }
    })
  }
}

const startAndroidBackgroundService = () => {
  backgroundService().then(() => {
    logInfo('end startAndroidBackgroundService')
    window.service.workDone()
  })
}

const isEnableAndroidBackgroundService = () => new Promise(resolve => {
  window.JSBackgroundService.isRepeating((err, isSet) => {
    if (err) {
      console.warn(err)
      logException('isEnableAndroidBackgroundService error')
      resolve(false)
    }
    resolve(isSet)
  })
})

// IOS

const hasIosCordovaPlugin = () => (isIos() && window.BackgroundFetch !== undefined)

const enableIosBackgroundService = () => {
  // documentation: https://github.com/transistorsoft/cordova-plugin-background-fetch
  const fetcher = window.BackgroundFetch

  const failureCallback = (error) => {
    console.log('BackgroundFetch failed', error)
  }

  const options = {
    stopOnTerminate: false
  }
  fetcher.configure(startIosBackgroundService, failureCallback, options)
}

const disableIosBackgroundService = () => {
  window.BackgroundFetch.stop()
}

const startIosBackgroundService = () => {
  const fetcher = window.BackgroundFetch
  backgroundService().then(() => {
    fetcher.finish()
  })
}