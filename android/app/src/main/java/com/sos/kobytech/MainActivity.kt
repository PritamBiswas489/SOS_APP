package com.sos.kobytech

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

// ✅ ADD THIS IMPORT
import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "KobyTech"

  // ✅ ADD THIS METHOD
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // 🔥 REQUIRED for Health Connect permissions
    HealthConnectPermissionDelegate.setPermissionDelegate(this)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}