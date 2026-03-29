"use client"

import { useEffect } from "react"

export default function EAEnAUHomeScript() {
  useEffect(() => {
    function getInteractURL() {
      return "https://unica.prod.hxun.aws.now.hclsoftware.cloud/interact"
    }

    function readInteractAudience() {
      var resultString = document.cookie
        .split("; ")
        .filter(cookie => cookie.startsWith("RTP"))
        .map(cookie => {
          const [key, value] = cookie.split("=")
          const cleanedKey = key.replace(/^RTP/, "")
          return `${cleanedKey}=${value}`
        })
        .join(";")
      console.debug("readInteractAudience() -> cookie value: " + resultString)
      if (resultString === "") {
        resultString = Object.keys(localStorage)
          .filter(key => key.startsWith("RTP"))
          .map(key => key.replace(/^RTP/, "") + "=" + localStorage[key])
          .join(";")
        console.debug("readInteractAudience() -> localStorage value: " + resultString)
        return resultString
      }
    }

    function readCookiesForInteract() {
      var resultString = document.cookie
        .split("; ")
        .filter(cookie => cookie !== "" && cookie.length <= 1024)
        .map(cookie => {
          const [key, value] = cookie.split("=")
          return `${key}=${value}`
        })
        .join(";")
      console.debug("readCookiesForInteract() -> cookie value: " + resultString)
      if (resultString === "") {
        resultString = Object.keys(localStorage)
          .filter(key => localStorage[key].length <= 1024)
          .map(key => key + "=" + localStorage[key])
          .join(";")
        console.debug("readCookiesForInteract() -> localStorage value: " + resultString)
        return resultString
      }
    }

    function requestPersonalizationPointTag(ppName: string) {
      console.debug("requestPersonalizationPointTag()")
      var audienceStr = readInteractAudience()
      if (audienceStr === "") {
        console.warn("AudienceFields not found in cookie/localStorage so skipping the Interact call.")
        return
      }
      var otherCookieValues = readCookiesForInteract()
      var unicaRTPConnectorURL = getInteractURL() + "/pageTag?src=rtp&res=true&dbg=false"
      var unicaURLData = "&partition=partition1&ic=1&pg=43&pp=" + ppName

      try {
        unicaURLData += "&title=" + encodeURIComponent(document.title)
      } catch (err) {}
      try {
        unicaURLData += "&referrer=" + encodeURIComponent(document.referrer)
      } catch (err) {}
      try {
        unicaURLData += "&cookie=" + encodeURIComponent(audienceStr + ";" + otherCookieValues)
      } catch (err) {}
      try {
        unicaURLData += "&browser=" + encodeURIComponent(navigator.userAgent)
      } catch (err) {}
      try {
        unicaURLData += "&screensize=" + encodeURIComponent(screen.width + "x" + screen.height)
      } catch (err) {}

      console.debug("Unica Interact URL: " + unicaRTPConnectorURL + unicaURLData)
      var s = document.createElement("script")
      s.setAttribute("src", unicaRTPConnectorURL + unicaURLData)
      document.body.appendChild(s)
    }

    async function postInteractEvent(eventName: string, elementID: string) {
      console.debug("postInteractEvent(), Event Name: " + eventName + ", elementID: " + elementID)
      var audienceStr = readInteractAudience()
      if (audienceStr === "") {
        console.warn("AudienceFields not found in cookie/localStorage so skipping the Interact post Event call.")
        return
      }
      var otherCookieValues = readCookiesForInteract()
      var unicaRTPConnectorURL = getInteractURL() + "/clickThru?src=rtp&res=true&dbg=false"
      var unicaURLData = "&pt=partition1&i=RealTimePersonalization&pg=43&e=" + eventName
      if (typeof elementID !== "undefined" && elementID !== "") {
        try {
          unicaURLData += "&elmid=" + encodeURIComponent(elementID)
        } catch (err) {}
      }
      try {
        unicaURLData += "&cookie=" + encodeURIComponent(audienceStr + ";" + otherCookieValues)
      } catch (err) {}
      console.debug("Unica Interact URL for posting Event: " + unicaRTPConnectorURL + unicaURLData)
      try {
        const response = await fetch(unicaRTPConnectorURL + unicaURLData)
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`)
        }
        console.debug("Unica Interact event " + eventName + " posted successfully.")
      } catch (error) {
        console.error((error as Error).message)
      }
    }

    function addInteractPostEventListener(elementID: string, eventName: string) {
      console.debug("addInteractPostEventListener(), elementID: " + elementID)
      var htmlElement = document.getElementById(elementID)
      if (htmlElement) {
        console.debug("Adding Interact postEvent(" + eventName + ") call on click of element: " + elementID)
        htmlElement.addEventListener("click", () => {
          postInteractEvent(eventName, elementID)
        })
      }
    }

    requestPersonalizationPointTag("Deals")
  }, [])

  return (
    <noscript>
      <style type="text/css">{`.unicainteractoffer {display:none !important;}`}</style>
    </noscript>
  )
}
