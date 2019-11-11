let wheelFlickHelper = {
    scrollSpeeds: [0,0,0,0,0,0,0,0,0,0,0],
    scrollFlickDownConfirmed: false,
    scrollFlickUpConfirmed: false,
    scrollSpeedTrendIncreasing: false
}
export function onWheelFlick(e, increaseCallback, decreaseCallback) {
    wheelFlickHelper.scrollSpeeds.push(e.wheelDelta)
    wheelFlickHelper.scrollSpeeds.shift()
    if (wheelFlickHelper.scrollSpeeds.length > 10) {
        let last         = wheelFlickHelper.scrollSpeeds[wheelFlickHelper.scrollSpeeds.length-1]
        let secondToLast = wheelFlickHelper.scrollSpeeds[wheelFlickHelper.scrollSpeeds.length-2]
        
        let lastIsIn120Range         = last         != 0 && last         % 120 == 0
        let secondToLastIsIn120Range = secondToLast != 0 && secondToLast % 120 == 0
        // assume that it is a regular mouse scroll wheel
        if (lastIsIn120Range && secondToLastIsIn120Range) {
            if (last > 0 && secondToLast > 0) {
                if (wheelFlickHelper.scrollFlickDownConfirmed) {
                    decreaseCallback(e)
                    wheelFlickHelper.scrollFlickDownConfirmed = false
                } else {
                    wheelFlickHelper.scrollFlickDownConfirmed = true
                }
            } else if (last < 0 && secondToLast < 0) {
                if (wheelFlickHelper.scrollFlickUpConfirmed) {
                    increaseCallback(e)
                    wheelFlickHelper.scrollFlickUpConfirmed = false
                } else {
                    wheelFlickHelper.scrollFlickUpConfirmed = true
                }
            }
        // assume its a trackpad
        } else {
            let [current, ...otherVals] = wheelFlickHelper.scrollSpeeds
            let increases = 0
            let decreases = 0
            for (let each of otherVals) {
                if (current - each > 0) {
                    increases++
                } else if (current - each < 0) {
                    decreases++
                }
            }
            let isIncreasing = false
            let isDecreaseing = false
            if (increases/otherVals.length >= 0.50) {
                isIncreasing = true
            } else if (decreases/otherVals.length >= 0.50) {
                isDecreaseing = true
            }
            // if there was a change in trend
            if (wheelFlickHelper.scrollSpeedTrendIncreasing != isIncreasing) {
                if (isIncreasing && last > 0) {
                    increaseCallback(e)
                } else if (isDecreaseing && last < 0) {
                    decreaseCallback(e)
                }
            }
            wheelFlickHelper.scrollSpeedTrendIncreasing = isIncreasing
        }
    }
}