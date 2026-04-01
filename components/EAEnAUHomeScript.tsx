"use client"

import Script from "next/script"

export default function EAEnAUHomeScript() {
  return (
    <>
      <Script id="ea-interact-audience" strategy="afterInteractive">{`

        /*
         ******************************************************************************
         Licensed Materials - Property of HCL Technologies Ltd.
         Unica Interact
         (c) Copyright HCL Technologies Ltd. 2024. All Rights Reserved.
         US Government Users Restricted Rights - Use, duplication or disclosure
         restricted by GSA ADP Schedule Contract with HCL Technologies Ltd.
         *******************************************************************************

         ***************************************************************************************************
           In order to make personalization rules working on your web page at runtime,
           you must add below block of RTP page tag script to the web page
         ***************************************************************************************************
        */

        // BEGIN: Unica Interact RTP Page Tag Script for page: EA home

        // Uncomment the following lines and set the appropriate values to pass the audience information to RTP getOffers API
        var _appData = localStorage.getItem('energyaustralia_customer_data');
        if (_appData) {
          var _customerId = JSON.parse(_appData)?.loginData?.id;
          if (_customerId) {
            localStorage.setItem("AudienceLevel", "Customer1");
            localStorage.setItem("_RTP_CustomerID", _customerId);
          }
        }
      `}</Script>
      <Script id="ea-interact-rtp" strategy="afterInteractive">{`


        const audienceFieldName = "_RTP_CustomerID";

        function requestPersonalizationPointTag(ppName) {
            console.debug("requestPersonalizationPointTag()");
            var audienceStr = readInteractAudience();
            if (audienceStr === '') {
                console.warn("AudienceFields not found in cookie/localStorage so skipping the Interact call.");
                return;
            }
            var otherCookieValues = readCookiesForInteract();
            var unicaRTPConnectorURL = getInteractURL() + "/pageTag?src=rtp&res=true&dbg=false";
            var unicaURLData = "&partition=partition1&ic=1&pg=47&pp="+ ppName;

            try { unicaURLData += "&title=" + encodeURIComponent(document.title) } catch (err) {}
            try { unicaURLData += "&referrer=" + encodeURIComponent(document.referrer) } catch (err) {}
            try { unicaURLData += "&cookie=" + encodeURIComponent(audienceStr + ';' + otherCookieValues) } catch (err) {}
            try { unicaURLData += "&browser=" + encodeURIComponent(navigator.userAgent) } catch (err) {}
            try { unicaURLData += "&screensize=" + encodeURIComponent(screen.width + "x" + screen.height) } catch (err) {}

            console.debug("Unica Interact URL: " + unicaRTPConnectorURL + unicaURLData);
            setTimeout(() => {
                var s = document.createElement('script');
                s.setAttribute('src', unicaRTPConnectorURL + unicaURLData);
                document.body.appendChild(s);
            }, 1000);
        }

        function getInteractURL() {
            return "https://unica.prod.hxun.aws.now.hclsoftware.cloud/interact";
        }

        function readInteractAudience() {
            var resultString = document.cookie.split('; ').filter(cookie => cookie.startsWith('_RTP_')).map(cookie => {
                const [key, value] = cookie.split('=');
                const cleanedKey = key.replace(/^_RTP_/, '');
                return cleanedKey + "=" + value;
            }).join(';');
            console.debug("readInteractAudience() -> cookie value: " + resultString);
            if (resultString === '') {
                resultString = Object.keys(localStorage).filter(key => key.startsWith('_RTP_')).map(key => key.replace(/^_RTP_/, '') + "=" + localStorage[key]).join(';');
                console.debug("readInteractAudience() -> localStorage value: " + resultString);
                return resultString;
            }
        }

        function readCookiesForInteract() {
            var resultString = document.cookie.split('; ').filter(cookie => (cookie !== '' && cookie.length <= 1024)).map(cookie => {
                const [key, value] = cookie.split('=');
                return key + "=" + value;
            }).join(';');
            console.debug("readCookiesForInteract() -> cookie value: " + resultString);
            if (resultString === '') {
                resultString = Object.keys(localStorage).filter(key => localStorage[key].length <= 1024).map(key => key + "=" + localStorage[key]).join(';');
                console.debug("readCookiesForInteract() -> localStorage value: " + resultString);
                return resultString;
            }
        }

        async function postInteractEvent(eventName, elementID) {
            console.debug("postInteractEvent(), Event Name: " + eventName + ", elementID: " + elementID);
            var audienceStr = readInteractAudience();
            if (audienceStr === '') {
                console.warn("AudienceFields not found in cookie/localStorage so skipping the Interact post Event call.");
                return;
            }
            var otherCookieValues = readCookiesForInteract();
            var unicaRTPConnectorURL = getInteractURL() + "/clickThru?src=rtp&res=true&dbg=false";
            var unicaURLData = "&pt=partition1&i=_RealTimePersonalization_&pg=47&e=" + eventName;
            if(typeof elementID !== 'undefined' && elementID !== '') {
                try { unicaURLData += "&elmid=" + encodeURIComponent(elementID) } catch (err) {}
            }
            try { unicaURLData += "&cookie=" + encodeURIComponent(audienceStr + ';' + otherCookieValues) } catch (err) {}
            console.debug("Unica Interact URL for posting Event: " + unicaRTPConnectorURL + unicaURLData);
            try {
                const response = await fetch(unicaRTPConnectorURL + unicaURLData);
                if (!response.ok) {
                    throw new Error("Response status: " + response.status);
                }
                console.debug("Unica Interact event " + eventName + " posted successfully.");
            } catch (error) {
                console.error(error.message);
            }
        }

        function addInteractPostEventListener(elementID, eventName) {
            console.debug("addInteractPostEventListener(), elementID: " + elementID);
            var htmlElement = document.getElementById(elementID);
            if (htmlElement) {
                console.debug("Adding Interact postEvent(" + eventName + ") call on click of element: " + elementID);
                htmlElement.addEventListener("click", (e) => {
                    postInteractEvent(eventName, elementID);
                });
            }
        }

        requestPersonalizationPointTag("Home_Banner");

        // END: Unica Interact RTP Page Tag Script
      `}</Script>
      <noscript>
        <style type="text/css">{`.unicainteractoffer {display:none !important;}`}</style>
      </noscript>
    </>
  )
}
