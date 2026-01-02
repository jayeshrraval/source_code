package com.yogisamajsambandh.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;

public class MainActivity extends BridgeActivity implements IUnityAdsInitializationListener {

    // તમારી Game ID અને Ad Unit ID (તમારા ડેશબોર્ડ મુજબ)
    private String unityGameID = "6017455";
    private String adUnitId = "Interstitial_Android";
    private Boolean testMode = false; // ટેસ્ટિંગ માટે ચાલુ રાખ્યું છે

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // એપ ચાલુ થતાં જ Unity Ads તૈયાર થશે
        UnityAds.initialize(getApplicationContext(), unityGameID, testMode, this);
    }

    // સ્ટેપ 1: Unity Ads તૈયાર થઈ જાય એટલે આ ફંક્શન કોલ થશે
    @Override
    public void onInitializationComplete() {
        System.out.println("Unity Ads Initialization Complete. Loading Ad...");
        // અહીંથી આપણે એડ લોડ કરવાનું શરૂ કરીશું
        loadInterstitialAd();
    }

    @Override
    public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
        System.out.println("Unity Ads Initialization Failed: " + message);
    }

    // સ્ટેપ 2: એડ લોડ કરવાનું ફંક્શન
    public void loadInterstitialAd() {
        UnityAds.load(adUnitId, new IUnityAdsLoadListener() {
            @Override
            public void onUnityAdsAdLoaded(String placementId) {
                System.out.println("Ad Loaded Successfully. Showing Ad Now...");
                // જેવી એડ લોડ થાય એટલે તરત બતાવશે
                showAd();
            }

            @Override
            public void onUnityAdsFailedToLoad(String placementId, UnityAds.UnityAdsLoadError error, String message) {
                System.out.println("Ad Failed to Load: " + message);
            }
        });
    }

    // સ્ટેપ 3: એડ બતાવવાનું ફંક્શન
    public void showAd() {
        UnityAds.show(MainActivity.this, adUnitId, new IUnityAdsShowListener() {
            @Override
            public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {
                System.out.println("Ad Show Failed: " + message);
            }

            @Override
            public void onUnityAdsShowStart(String placementId) {
                System.out.println("Ad Started Showing");
            }

            @Override
            public void onUnityAdsShowClick(String placementId) {
                System.out.println("Ad Clicked");
            }

            @Override
            public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                System.out.println("Ad Finished");
            }
        });
    }
}