export default class LabelRecord {
    constructor({records, graphFrameRate}) {
        this.graphFrameRate = graphFrameRate
        if (records == null) {
            this.records = []
        } else if (!(records instanceof Array)) {
            console.log(`records isn't an array, its: ${this.records}`)
        } else {
            this.records = records
        }
    }
    toJSON() {
        return this.records
    }
    addNewRecordSegment(newRecords) {
        if (newRecords.length != 0) {
            // extract start and end times
            let oldestRecord = newRecords[0]
            let newestRecord = newRecords[newRecords.length-1]
            let startTime    = oldestRecord[0]
            let endTime      = newestRecord[0]
            // 
            // remove all of the records times that are in this record's duration
            // replace them with the new records
            // 
            let startIndex = null
            let endIndex = null
            for (let eachIndex in this.records) {
                // convert to number
                eachIndex = eachIndex-0
                
                let [eachTime, eachValue] = this.records[eachIndex]
                if (startIndex == null && eachTime >= startTime) {
                    startIndex = eachIndex
                }
                if (endIndex == null && eachTime >= endTime) {
                    if (eachTime == endTime) {
                        endIndex = (eachIndex-0)+1
                    } else {
                        endIndex = eachIndex
                    }
                }
            }
            if (startIndex == null) {
                startIndex = this.records.length
            }
            if (endIndex == null) {
                endIndex = this.records.length
            }
            let firstPart = this.records.slice(0, startIndex)
            let middlePart = this.records.slice(startIndex, endIndex)
            let lastPart = this.records.slice(endIndex, this.records.length)
            
            // create a new record with the new info overwriting the old
            this.records = firstPart.concat(newRecords, lastPart)
        }
    }
}