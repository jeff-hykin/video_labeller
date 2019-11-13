let wheelFlickHelper = {
    scrollSpeeds: [0,0,0,0,0,0,0,0,0,0,0],
    scrollFlickDownConfirmed: false,
    scrollFlickUpConfirmed: false,
    scrollSpeedTrendIncreasing: false
}
export function onWheelFlick(e, flickUpCallback, flickDownCallback) {
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
                    flickDownCallback(e)
                    wheelFlickHelper.scrollFlickDownConfirmed = false
                } else {
                    wheelFlickHelper.scrollFlickDownConfirmed = true
                }
            } else if (last < 0 && secondToLast < 0) {
                if (wheelFlickHelper.scrollFlickUpConfirmed) {
                    flickUpCallback(e)
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
                    flickDownCallback(e)
                } else if (isDecreaseing && last < 0) {
                    flickUpCallback(e)
                }
            }
            wheelFlickHelper.scrollSpeedTrendIncreasing = isIncreasing
        }
    }
}


export function binSearch(array, value, start, end) {
    // initilize arguments
    if (start == undefined) {
        start = 0
    }
    if (end == undefined) {
        end = array.length
    }
    let func
    if (!(value instanceof Function)) {
        func = (each) => {
            if (each == value) {
                return 0
            } else if (each > value) {
                return 1
            } else {
                return -1
            }
        }
    } else {
        func = value
    }
    while (true) {
        // base case
        if (start > end) {
            return middleIndex
        }
        let middleIndex = Math.floor( (start+end)/2 )
        let middle = array[middleIndex]
        if (func(middle) === 0) {
            return middleIndex
        }
        if (func(middle) === 1) {
            end = middleIndex-1
        } else {
            start = middleIndex+1
        }
    }
}

export let once = ({ isTrue, then, interval=100 }) => new Promise((resolve, reject)=>{
    let clearIntervalId
    let intervalFunction = async () => {
        // once the statement is true
        if (isTrue()) {
            // detact the loop
            clearInterval(clearIntervalId)
            // run the computation
            resolve(await then())
        }
    }
    // try it first before scheduling it
    intervalFunction()
    clearIntervalId = setInterval(intervalFunction, interval)
})

export let scale0to100 = (aList) => {
    let minScore = Math.min(...aList)
    let shiftedScores = aList.map(each => each - minScore)
    let maxScore = Math.max(...shiftedScores)
    let scaleTo100 = 100.0 / maxScore
    let adjustedScores = shiftedScores.map(each => each * scaleTo100)
    return adjustedScores
}